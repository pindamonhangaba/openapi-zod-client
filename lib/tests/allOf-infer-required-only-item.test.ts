import type { OpenAPIObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { generateZodClientFromOpenAPI } from "../src/index.ts";

// https://github.com/astahmer/openapi-zod-client/issues/49
test("allOf-infer-required-only-item", async (t) => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: {
            title: "User",
            version: "1.0.0",
        },
        paths: {
            "/user": {
                get: {
                    responses: {
                        "200": {
                            description: "return user",
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/userResponse",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                user: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                        },
                        email: {
                            type: "string",
                        },
                    },
                },
                userResponse: {
                    type: "object",
                    properties: {
                        user: {
                            allOf: [
                                {
                                    $ref: "#/components/schemas/user",
                                },
                                {
                                    required: ["name"],
                                },
                            ],
                        },
                    },
                },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
        options: {
            shouldExportAllTypes: true,
            shouldExportAllSchemas: true,
            withImplicitRequiredProps: true,
        },
    });
    await assertSnapshot(t, output);
});
