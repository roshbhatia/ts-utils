import Handlebars from "handlebars";

export interface TemplateOptions {
  /** Escape HTML-sensitive characters. Code generation leaves them literal. */
  readonly escapeHtml?: boolean;
}

/** Render typed data with strict Handlebars variable lookup. */
export const renderTemplate = <Context>(
  source: string,
  context: Context,
  options: TemplateOptions = {},
): string => {
  const engine = Handlebars.create();
  const render = engine.compile(source, {
    noEscape: !(options.escapeHtml ?? false),
    strict: true,
  });
  return render(context, {
    allowProtoMethodsByDefault: false,
    allowProtoPropertiesByDefault: false,
  });
};
