import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT ?? 51280);
const WEB_ROOT = fileURLToPath(new URL("../web/", import.meta.url));

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8"
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${HOST}:${PORT}`);
    const filePath = resolveWebPath(url.pathname);
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("not a file");

    response.writeHead(200, {
      "content-type": TYPES[extname(filePath)] ?? "application/octet-stream",
      "cache-control": "no-store"
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("not found");
  }
});

server.on("error", (error) => {
  console.error(`Decision Runtime VM control surface failed: ${error.message}`);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`Decision Runtime VM control surface: http://${HOST}:${PORT}`);
});

function resolveWebPath(pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const normalized = normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(WEB_ROOT, normalized);
  if (!filePath.startsWith(WEB_ROOT)) {
    throw new Error("path escapes web root");
  }
  return filePath;
}
