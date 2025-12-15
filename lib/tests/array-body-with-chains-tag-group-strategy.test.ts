import type { OpenAPIObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { generateZodClientFromOpenAPI } from "../src/index.ts";

test("array-body-with-chains-tag-group-strategy", async (t) => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.0",
        info: { title: "Test", version: "1.0.1" },
        paths: {
            "/test": {
                put: {
                    summary: "Test",
                    description: "Test",
                    tags: ["Test"],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            testItem: {
                                                type: "string",
                                            },
                                        },
                                        additionalProperties: false,
                                    },
                                    minItems: 1,
                                    maxItems: 10,
                                },
                            },
                        },
                    },
                    parameters: [],
                    responses: {
                        "200": {
                            description: "Success",
                            content: { "application/json": {} },
                        },
                    },
                },
            },
        },
        components: {},
        tags: [],
    };

    const output = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
        options: { groupStrategy: "tag-file" },
    });
    await assertSnapshot(t, output);
});
