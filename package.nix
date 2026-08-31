{
  bun2nix,
  stdenvNoCC,
}:
stdenvNoCC.mkDerivation {
  pname = "ts-utils";
  version = "0.1.0";
  src = ./.;

  nativeBuildInputs = [ bun2nix.hook ];
  bunDeps = bun2nix.fetchBunDeps { bunNix = ./bun.nix; };
  bunInstallFlags =
    if stdenvNoCC.hostPlatform.isDarwin then
      [
        "--linker=hoisted"
        "--backend=copyfile"
      ]
    else
      [ "--linker=hoisted" ];

  buildPhase = ''
    runHook preBuild
    bun run build
    runHook postBuild
  '';

  doCheck = true;
  checkPhase = ''
    runHook preCheck
    bun run check
    runHook postCheck
  '';

  installPhase = ''
    runHook preInstall
    mkdir -p "$out/share/ts-utils"
    cp -R dist package.json src "$out/share/ts-utils/"
    runHook postInstall
  '';
}
