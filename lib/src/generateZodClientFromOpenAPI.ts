import * as path from "@std/path";
import { ensureDir } from "@std/fs";

import type { OpenAPIObject } from "openapi3-ts";
import { capitalize, pick } from "pastable/server";
import type { Options } from "prettier";
import { match } from "ts-pattern";

import { getHandlebars } from "./getHandlebars.ts";
import { maybePretty } from "./maybePretty.ts";
import type { TemplateContext } from "./template-context.ts";
import { getZodClientTemplateContext } from "./template-context.ts";

type GenerateZodClientFromOpenApiArgs<TOptions extends TemplateContext["options"] = TemplateContext["options"]> = {
    openApiDoc: OpenAPIObject;
    templatePath?: string;
    prettierConfig?: Options | null;
    options?: TOptions;
    handlebars?: ReturnType<typeof getHandlebars>;
} & (
    | {
          distPath?: never;
          /** when true, will only return the result rather than writing it to a file, mostly used for easier testing purpose */
          disableWriteToFile: true;
      }
    | { distPath: string; disableWriteToFile?: false }
);

export const generateZodClientFromOpenAPI = async <TOptions extends TemplateContext["options"]>({
    openApiDoc,
    distPath,
    templatePath,
    prettierConfig,
    options,
    disableWriteToFile,
    handlebars,
}: GenerateZodClientFromOpenApiArgs<TOptions>): Promise<
    TOptions extends NonNullable<TemplateContext["options"]>
        ? undefined extends TOptions["groupStrategy"]
            ? string
            : TOptions["groupStrategy"] extends "none" | "tag" | "method"
            ? string
            : Record<string, string>
        : string
> => {
    const data = getZodClientTemplateContext(openApiDoc, options);
    const groupStrategy = options?.groupStrategy ?? "none";
    
    // Get base directory - handle both file:// (local) and https:// (JSR) URLs
    let baseDir: string;
    if (import.meta.url.startsWith("file://")) {
        baseDir = path.dirname(path.fromFileUrl(import.meta.url));
    } else {
        // Running from JSR - use URL-based path resolution
        baseDir = new URL(".", import.meta.url).href;
    }

    if (!templatePath) {
        templatePath = match(groupStrategy)
            .with("none", "tag-file", "method-file", () => {
                if (import.meta.url.startsWith("file://")) {
                    return path.join(baseDir, "templates/default.hbs");
                } else {
                    return new URL("templates/default.hbs", baseDir).href;
                }
            })
            .with("tag", "method", () => {
                if (import.meta.url.startsWith("file://")) {
                    return path.join(baseDir, "templates/grouped.hbs");
                } else {
                    return new URL("templates/grouped.hbs", baseDir).href;
                }
            })
            .exhaustive();
    }

    // Read template - handle both file paths and URLs
    let source: string;
    if (templatePath.startsWith("http://") || templatePath.startsWith("https://")) {
        const response = await fetch(templatePath);
        source = await response.text();
    } else {
        source = await Deno.readTextFile(templatePath);
    }
    const hbs = handlebars ?? getHandlebars();
    const template = hbs.compile(source);
    const willWriteToFile = !disableWriteToFile && distPath;
    // TODO parallel writes ? does it really matter here ?

    if (groupStrategy.includes("file")) {
        const outputByGroupName: Record<string, string> = {};

        if (willWriteToFile) {
            await ensureDir(distPath);
        }

        const groupNames = Object.fromEntries(
            Object.keys(data.endpointsGroups).map((groupName) => [`${capitalize(groupName)}Api`, groupName])
        );

        const indexSource = await Deno.readTextFile(path.join(baseDir, "templates/grouped-index.hbs"));
        const indexTemplate = hbs.compile(indexSource);
        const indexOutput = maybePretty(indexTemplate({ groupNames }), prettierConfig);
        outputByGroupName["__index"] = indexOutput;

        if (willWriteToFile) {
            await Deno.writeTextFile(path.join(distPath, "index.ts"), indexOutput);
        }

        const commonSource = await Deno.readTextFile(path.join(baseDir, "templates/grouped-common.hbs"));
        const commonTemplate = hbs.compile(commonSource);
        const commonSchemaNames = [...(data.commonSchemaNames ?? [])];

        if (commonSchemaNames.length > 0) {
            const commonOutput = maybePretty(
                commonTemplate({
                    schemas: pick(data.schemas, commonSchemaNames),
                    types: pick(data.types, commonSchemaNames),
                }),
                prettierConfig
            );
            outputByGroupName["__common"] = commonOutput;

            if (willWriteToFile) {
                await Deno.writeTextFile(path.join(distPath, "common.ts"), commonOutput);
            }
        }

        for (const groupName in data.endpointsGroups) {
            const groupOutput = template({
                ...data,
                ...data.endpointsGroups[groupName],
                options: {
                    ...options,
                    groupStrategy: "none",
                    apiClientName: `${capitalize(groupName)}Api`,
                },
            });
            const prettyGroupOutput = maybePretty(groupOutput, prettierConfig);
            outputByGroupName[groupName] = prettyGroupOutput;

            if (willWriteToFile) {
                console.log("Writing to", path.join(distPath, `${groupName}.ts`));
                await Deno.writeTextFile(path.join(distPath, `${groupName}.ts`), prettyGroupOutput);
            }
        }

        return outputByGroupName as any;
    }

    const output = template({ ...data, options: { ...options, apiClientName: options?.apiClientName ?? "api" } });
    const prettyOutput = maybePretty(output, prettierConfig);

    if (willWriteToFile) {
        await Deno.writeTextFile(distPath, prettyOutput);
    }

    return prettyOutput as any;
};
