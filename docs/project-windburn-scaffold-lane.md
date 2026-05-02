# Project Windburn Scaffold Lane

`Fearvox/project-windburn` is the default landing-zone repository for new
webpage, subpage, landing-page, and microsite work when the human does not name
another repo.

## Current Repo Evidence

Current public repo evidence shows:

- default branch `main`;
- public repository;
- description `Project Windburn - An Evensong Rebrand`;
- root content limited to `README.md` and `LICENSE`;
- root `README.md` content limited to the repo title and short description.

Treat that state as an empty scaffold waiting for upload until future repo
evidence shows created child page projects.

## Routing Rule

- Route new webpage/subpage/landing-page/microsite requests to
  `Fearvox/project-windburn` by default when no other repo is named.
- Do not assume an existing app structure, shared package layout, route tree,
  build system, deployment wiring, or page-level conventions until repo
  evidence proves them.
- Keep the root as index, routing, and workflow documentation unless the human
  explicitly asks for a root app.

## Child Project Shape

Each created page should live as a self-contained project directory under:

```text
project-windburn/<page-name>/
```

Each child page project should carry its own:

- package manifest;
- build scripts;
- README;
- deployment notes;
- verification evidence.

No cross-page dependency is implicit. Shared code must be introduced as an
explicit package, documented convention, or separately reviewed dependency.

## Review Gate

Workbench-originated webpage changes should route toward Windburn by default,
but merge and deploy remain review-gated.
