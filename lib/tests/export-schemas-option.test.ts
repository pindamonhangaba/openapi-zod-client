import { OpenAPIObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from "../src/index.ts";

test("export-schemas-option", async (t) => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/export-schemas-option": {
                get: {
                    operationId: "123_example",
                    responses: {
                        "200": {
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Basic" } } },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                Basic: { type: "string" },
                UnusedSchemas: {
                    type: "object",
                    properties: {
                        nested_prop: { type: "boolean" },
                        another: { type: "string" },
                    },
                },
            },
        },
    };

    await assertSnapshot(t, getZodClientTemplateContext(openApiDoc, { shouldExportAllSchemas: false }).schemas);

    const ctx = getZodClientTemplateContext(openApiDoc, { shouldExportAllSchemas: true });
    await assertSnapshot(t, ctx.endpoints);

    await assertSnapshot(t, ctx.schemas);

    const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
        options: { shouldExportAllSchemas: true },
    });
    await assertSnapshot(t, result);
});
