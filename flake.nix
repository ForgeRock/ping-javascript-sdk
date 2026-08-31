{
  description = "development environment for ping-sdk repository";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = import nixpkgs { inherit system; };
          playwrightBrowsers = pkgs.playwright-driver.browsers;
        in
        {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              nodejs_24
              # package.json pins pnpm@10.21.0; nixpkgs provides 10.34.5 (latest pnpm_10)
              pkgs.pnpm_10
              git
              nixpkgs-fmt
              nil
            ];

            env = {
              PLAYWRIGHT_BROWSERS_PATH = "${playwrightBrowsers}";
              PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
            };

            shellHook = ''
              echo "──────────────────────────────────────"
              echo " ping-sdk dev environment"
              echo " node    $(node --version)"
              echo " pnpm    $(pnpm --version)"
              echo " git     $(git --version | cut -d' ' -f3)"
              echo " playwright browsers: $PLAYWRIGHT_BROWSERS_PATH"
              echo "──────────────────────────────────────"
            '';
          };
        }
      );

      packages = forAllSystems (
        system:
        let
          pkgs = import nixpkgs { inherit system; };
        in
        {
          default = self.devShells.${system}.default;
          playwright-browsers = pkgs.playwright-driver.browsers;
        }
      );

      formatter = forAllSystems (system: nixpkgs.legacyPackages.${system}.nixpkgs-fmt);
    };
}
