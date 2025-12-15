import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPIObject } from "openapi3-ts";
import { Options, resolveConfig } from "prettier";
import { getZodClientTemplateContext } from "../src/template-context.ts";
import { getHandlebars } from "../src/getHandlebars.ts";
import { maybePretty } from "../src/maybePretty.ts";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { expect } from "jsr:@std/expect";
import fg from "fast-glob";
import * as path from "@std/path";
import { describe, test, beforeAll } from "jsr:@std/testing/bdd";


let prettierConfig: Options | null;
const pkgRoot = Deno.cwd();

beforeAll(async () => {
    prettierConfig = await resolveConfig(path.resolve(pkgRoot, ".."));
});

describe("samples-generator", () => {
    const samplesPath = path.resolve(pkgRoot, "../", "./samples/v3\\.*/**/*.yaml");
    const list = fg.sync([samplesPath]);

    const resultByFile = {} as Record<string, string>;

    beforeAll(async () => {
        const template = getHandlebars().compile(await Deno.readTextFile("lib/src/templates/default.hbs"));
        
        for (const docPath of list) {
            const openApiDoc = (await SwaggerParser.parse(docPath)) as OpenAPIObject;
            const data = getZodClientTemplateContext(openApiDoc);

            const output = template({ ...data, options: { ...data.options, apiClientName: "api" } });
            const prettyOutput = maybePretty(output, prettierConfig);
            const fileName = docPath.replace("yaml", "");

            // means the .ts file is valid
            expect(prettyOutput).not.toBe(output);
            resultByFile[fileName] = prettyOutput;
        }
    });

    test("results by file", async (t) => {
        const results = Object.fromEntries(Object.entries(resultByFile).map(([key, value]) => [key.split("samples/").at(1), value]));
        await assertSnapshot(t, results);
    });
});