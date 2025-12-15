import { OpenAPIObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";

import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from "../src/index.ts";

test("name-with-special-characters", async (t) => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/name-with-special-characters": {
                get: {
                    operationId: "nameWithSPecialCharacters",
                    responses: {
                        "200": {
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/1Name-With-Special---Characters" },
                                },
                            },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                "1Name-With-Special---Characters": { type: "string" },
            },
        },
    };
    const ctx = getZodClientTemplateContext(openApiDoc);
    await assertSnapshot(t, ctx.endpoints);

    const result = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    await assertSnapshot(t, result);
});
