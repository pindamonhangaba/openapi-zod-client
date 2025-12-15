import type { OpenAPIObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { generateZodClientFromOpenAPI } from "../src/index.ts";

// https://github.com/astahmer/openapi-zod-client/issues/122
test("request-body-ref", async (t) => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: {
            title: "Pets",
            version: "1.0.0",
        },
        paths: {
            "/pets": {
                post: {
                    summary: "Post pets.",
                    operationId: "PostPets",
                    requestBody: {
                        $ref: "#/components/requestBodies/PostPetsRequest",
                    },
                    responses: {},
                },
            },
        },
        components: {
            schemas: {
                PostPetsRequest: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                        },
                    },
                },
            },
            requestBodies: {
                PostPetsRequest: {
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/PostPetsRequest",
                            },
                        },
                    },
                },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    await assertSnapshot(t, output);
});