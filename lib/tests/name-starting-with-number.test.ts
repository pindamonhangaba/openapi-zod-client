import { OpenAPIObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from "../src/index.ts";

test("operationId-starting-with-number", async (t) => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/operationId-starting-with-number": {
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
            },
        },
    };
    const ctx = getZodClientTemplateContext(openApiDoc);
    await assertSnapshot(t, ctx.endpoints);

    // TODO fix
    const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
        options: { withAlias: true },
    });
    await assertSnapshot(t, result);
});