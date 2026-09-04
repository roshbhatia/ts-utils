{
  biome,
  bun2nix,
  stdenvNoCC,
}:
stdenvNoCC.mkDerivation {
  pname = "ts-utils";
  version = "0.6.0";
  src = ./.;

  nativeBuildInputs = [
    biome
    bun2nix.hook
  ];
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
    biome check .
    bun run typecheck
    bun test
    runHook postCheck
  '';

  installPhase = ''
    runHook preInstall
    runtime_directory="$TMPDIR/ts-utils-runtime"
    mkdir -p "$runtime_directory"
    cp bun.lock package.json "$runtime_directory/"
    (
      cd "$runtime_directory"
      bun install \
        --frozen-lockfile \
        --ignore-scripts \
        --linker=hoisted \
        --offline \
        --production
    )
    mkdir -p "$out/share/ts-utils"
    cp -R dist package.json schema "$runtime_directory/node_modules" src "$out/share/ts-utils/"
    find "$out/share/ts-utils/src" -type f -name '*.test.ts' -delete
    runHook postInstall
  '';
}
