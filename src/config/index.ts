import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { YAML } from "bun";
import { Schema } from "effect";

export interface ConfigOptions<A> {
  readonly defaults: A;
  readonly environment?: Readonly<Record<string, string | undefined>>;
  readonly name: string;
  readonly path?: string;
  readonly prefix: string;
}

export const configPath = (
  options: Pick<
    ConfigOptions<unknown>,
    "environment" | "name" | "path" | "prefix"
  >,
): string => {
  if (options.path) return options.path;
  const environment = options.environment ?? process.env;
  const override = environment[`${options.prefix}_CONFIG`]?.trim();
  if (override) return override;
  const root =
    environment.XDG_CONFIG_HOME ??
    (environment.HOME ? join(environment.HOME, ".config") : undefined);
  if (!root)
    throw new Error("XDG_CONFIG_HOME or HOME must name a config directory");
  return join(root, options.name, "config.yaml");
};

export const loadConfig = <S extends Schema.Decoder<unknown>>(
  schema: S,
  options: ConfigOptions<S["Type"]>,
): S["Type"] => {
  const environment = options.environment ?? process.env;
  const path = configPath(options);
  const yaml = existsSync(path) ? YAML.parse(readFileSync(path, "utf8")) : {};
  const merged = deepMerge(options.defaults, yaml);
  const overridden = applyEnvironment(merged, options.prefix, environment);
  return Schema.decodeUnknownSync(schema)(overridden, {
    errors: "all",
    onExcessProperty: "error",
  });
};

export const configSchema = <S extends Schema.Top>(
  schema: S,
  title: string,
): Readonly<Record<string, unknown>> => {
  const standard = Schema.toStandardJSONSchemaV1(schema);
  const generated = standard["~standard"].jsonSchema.input({
    target: "draft-2020-12",
  });
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    ...generated,
    title,
  };
};

const applyEnvironment = <A>(
  defaults: A,
  prefix: string,
  environment: Readonly<Record<string, string | undefined>>,
): A =>
  applyObject(
    defaults as Readonly<Record<string, unknown>>,
    prefix.toUpperCase(),
    environment,
  ) as A;

const applyObject = (
  defaults: Readonly<Record<string, unknown>>,
  prefix: string,
  environment: Readonly<Record<string, string | undefined>>,
): Readonly<Record<string, unknown>> =>
  Object.fromEntries(
    Object.entries(defaults).map(([name, value]) => {
      const key = `${prefix}_${snake(name)}`;
      if (isObject(value)) return [name, applyObject(value, key, environment)];
      const override = environment[key];
      return [name, override === undefined ? value : YAML.parse(override)];
    }),
  );

const deepMerge = <A>(defaults: A, override: unknown): A => {
  if (!isObject(defaults) || !isObject(override)) return override as A;
  const entries = Object.entries(defaults).map(([name, value]) => [
    name,
    name in override ? deepMerge(value, override[name]) : value,
  ]);
  for (const [name, value] of Object.entries(override)) {
    if (!(name in defaults)) entries.push([name, value]);
  }
  return Object.fromEntries(entries) as A;
};

const isObject = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const snake = (value: string): string =>
  value.replaceAll(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();
