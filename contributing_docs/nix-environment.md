# Nix Environment

This repository provides a reproducible development environment using [Nix](https://nixos.org/), with [direnv](https://direnv.net/) for automatic activation and [devenv](https://devenv.sh/) as a convenience layer on top.

## Prerequisites

- [Nix](https://nixos.org/download.html) with flakes enabled
- [direnv](https://direnv.net/docs/installation.html) (and its shell hook installed)
- Optionally, [devenv](https://devenv.sh/getting-started/) for the extras described below

## What the flake provides

The base environment is defined in `flake.nix` at the repository root. Entering the shell (`nix develop`, or automatically via direnv) gives you:

- `nodejs_24` and `pnpm_10` pinned from nixpkgs, so every contributor uses the same toolchain versions
- `git`, plus `nixpkgs-fmt` and `nil` for editing Nix files themselves
- Playwright browsers wired up automatically: `PLAYWRIGHT_BROWSERS_PATH` points at the nix-provided browser set and `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` is set, so e2e tests run without downloading browsers
- A `packages/playwright-browsers` output you can build or reference directly if you need the browser bundle standalone
- A formatter available as `nix fmt` (runs `nixpkgs-fmt` over the Nix files)

## What devenv adds on top

`devenv.nix` layers convenience on top of the base shell:

- **Cachix** (`ping-javascript-sdk`): artifacts are pulled from the binary cache so first installs are much faster, and pushed back so what you build is shared with the rest of the team
- **`env.NX_SOCKET_DIR = "/tmp/nx"`**: fixes a macOS issue where the Nx daemon's Unix socket path exceeds the socket length limit because pnpm's deeply nested `node_modules` paths make the socket file path too long. Setting this redirects the socket to a short path.

## How they compose

The `.envrc` at the root wires everything together:

```bash
use flake
eval "$(devenv direnvrc)"
use devenv
```

`use flake` provides the base environment from nixpkgs (the flake); `use devenv` layers devenv's project services, env vars, and caching on top. In short: **flake = the base toolchain and environment; devenv = the convenience layer**. You need both files for the full experience, but the flake alone is enough if you only want the toolchain.

Once direnv is hooked into your shell, `cd`-ing into the repository activates everything automatically.

## Troubleshooting

### Nx socket errors on macOS

If you see errors about the Nx daemon failing to bind a Unix socket (path too long), the `NX_SOCKET_DIR` env var from `devenv.nix` fixes this. If you skipped devenv, set it manually:

```bash
export NX_SOCKET_DIR=/tmp/nx
```

## Note on `.devenv/`

The `.devenv/` directory is generated runtime state, gitignored, and recreated automatically the next time the environment is activated. Never commit it or edit files inside it.
