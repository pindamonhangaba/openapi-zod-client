import { getZodSchema } from "../src/openApiToZod.ts";
import { test } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { generateZodClientFromOpenAPI } from "../src/index.ts";
import type { OpenAPIObject, SchemaObject } from "openapi3-ts";

test("handle-props-with-special-characters", async (t) => {
    const schemaWithSpecialCharacters = {
        properties: {
            "@id": { type: "string" },
            id: { type: "number" },
        },
    } as SchemaObject;

    const schema = getZodSchema({ schema: schemaWithSpecialCharacters });
    await assertSnapshot(t, schema);

    const output = await generateZodClientFromOpenAPI({
        openApiDoc: {
            openapi: "3.0.3",
            info: { version: "1", title: "Example API" },
            paths: {
                "/something": {
                    get: {
                        operationId: "getSomething",
                        responses: {
                            "200": {
                                content: {
                                    "application/json": {
                                        schema: schemaWithSpecialCharacters,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        } as OpenAPIObject,
        disableWriteToFile: true,
    });
    await assertSnapshot(t, output);
});
