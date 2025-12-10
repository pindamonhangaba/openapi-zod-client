import type { OpenAPIObject } from "openapi3-ts";
import type { Options } from "prettier";
import { getHandlebars } from "./getHandlebars.js";
import type { TemplateContext } from "./template-context.js";
type GenerateZodClientFromOpenApiArgs<TOptions extends TemplateContext["options"] = TemplateContext["options"]> = {
    openApiDoc: OpenAPIObject;
    templatePath?: string;
    prettierConfig?: Options | null;
    options?: TOptions;
    handlebars?: ReturnType<typeof getHandlebars>;
} & ({
    distPath?: never;
    /** when true, will only return the result rather than writing it to a file, mostly used for easier testing purpose */
    disableWriteToFile: true;
} | {
    distPath: string;
    disableWriteToFile?: false;
});
export declare const generateZodClientFromOpenAPI: <TOptions extends TemplateContext["options"]>({ openApiDoc, distPath, templatePath, prettierConfig, options, disableWriteToFile, handlebars, }: GenerateZodClientFromOpenApiArgs<TOptions>) => Promise<TOptions extends NonNullable<TemplateContext["options"]> ? undefined extends TOptions["groupStrategy"] ? string : TOptions["groupStrategy"] extends "none" | "tag" | "method" ? string : Record<string, string> : string>;
export {};
