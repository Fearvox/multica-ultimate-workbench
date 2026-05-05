import { execFile } from "node:child_process";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const HOST = process.env.RUNTIME_PANEL_HOST ?? "127.0.0.1";
const PORT = Number(process.env.RUNTIME_PANEL_PORT ?? "5189");
const WEB_ROOT = fileURLToPath(new URL("../app/dashboard/", import.meta.url));
const WORKBENCH_ROOT = fileURLToPath(new URL("..", import.meta.url));
const PANEL_SCRIPT = join(WORKBENCH_ROOT, "scripts/runtime-panel.sh");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function serveStatic(response, filePath) {
  createReadStream(filePath).pipe(response);
}

async function serveFleetJson(response) {
  try {
    const body = await new Promise((resolve, reject) => {
      execFile("bash", [PANEL_SCRIPT, "--json"], {
        timeout: 15_000,
        maxBuffer: 512 * 1024,
      }, (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve(stdout);
      });
    });

    response.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    });
    response.end(body);
  } catch (err) {
    response.writeHead(502, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({
      fleet: [],
      generated_at_utc: new Date().toISOString(),
      mode: "read-only",
      error: `runtime-panel.sh failed: ${err.message}`,
    }));
  }
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${HOST}:${PORT}`);

    if (url.pathname === "/api/fleet.json") {
      return serveFleetJson(response);
    }

    const staticPath = url.pathname === "/" ? "/index.html" : url.pathname;
    const normalized = normalize(staticPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = join(WEB_ROOT, normalized);
    if (!filePath.startsWith(WEB_ROOT)) throw new Error("path escapes web root");

    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("not a file");

    response.writeHead(200, {
      "content-type": TYPES[extname(filePath)] ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    serveStatic(response, filePath);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("not found");
  }
});

server.on("error", (error) => {
  console.error(`runtime-panel serve failed: ${error.message}`);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`runtime-panel: http://${HOST}:${PORT}`);
  console.log(`fleet api:   http://${HOST}:${PORT}/api/fleet.json`);
});
