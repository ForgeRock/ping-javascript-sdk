{
  description = "Development environment for the ping-javascript-sdk monorepo";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        # Get the pkgs set for the specific system
        pkgs = import nixpkgs { inherit system; };

        # Node.js version from your .node-version file
        nodejs = pkgs.nodejs_22;
      in
      {
        # The `devShell` is the development environment activated by `nix develop`
        devShells.default = pkgs.mkShell {
          # The packages available in the development shell.
          packages = [
            nodejs
            pkgs.pnpm
            pkgs.git
          ];

          shellHook = ''
            # This hook runs when you enter the shell
            echo "---"
            echo "Welcome to the Nix development environment for ping-javascript-sdk!"
            echo ""
            echo "Node.js version: $(node --version)"
            echo "pnpm version: $(pnpm --version)"
            echo "---"
          '';
        };
      });
}
