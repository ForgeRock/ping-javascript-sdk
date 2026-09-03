{
  description = "development environment for ping-sdk repository";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-darwin.url = "github:NixOS/nixpkgs/nixpkgs-26.05-darwin";
  };

  outputs =
    { self, nixpkgs, nixpkgs-darwin }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;

      pkgsFor =
        system:
        let
          nixpkgsInput =
            if nixpkgs.lib.hasSuffix "darwin" system then nixpkgs-darwin else nixpkgs;
        in
        import nixpkgsInput { inherit system; };
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = pkgsFor system;
          playwrightBrowsers = pkgs.playwright-driver.browsers;
        in
        {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              nodejs_24
              # corepack resolves pnpm from package.json packageManager pin (10.21.0),
              # keeping nix and repo pnpm versions in lockstep
              pkgs.corepack
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
          pkgs = pkgsFor system;
        in
        {
          default = self.devShells.${system}.default;
          playwright-browsers = pkgs.playwright-driver.browsers;
        }
      );

      formatter = forAllSystems (system: (pkgsFor system).nixpkgs-fmt);
    };
}
