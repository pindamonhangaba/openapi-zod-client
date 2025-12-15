import type { OpenAPIObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { generateZodClientFromOpenAPI } from "../src/index.ts";

// https://github.com/astahmer/openapi-zod-client/issues/116
test("array-oneOf-discriminated-union", async (t) => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: {
            title: "array oneOf discriminated union",
            version: "v1",
        },
        paths: {
            "/test": {
                post: {
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/ArrayRequest" } } },
                    },
                },
            },
        },
        components: {
            schemas: {
                ArrayRequest: {
                    type: "array",
                    items: {
                        oneOf: [
                            {
                                type: "object",
                                required: ["type", "a"],
                                properties: {
                                    type: {
                                        type: "string",
                                        enum: ["a"],
                                    },
                                },
                            },
                            {
                                type: "object",
                                required: ["type", "b"],
                                properties: {
                                    type: {
                                        type: "string",
                                        enum: ["b"],
                                    },
                                },
                            },
                        ],
                        discriminator: { propertyName: "type" },
                    },
                },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    await assertSnapshot(t, output);
});
