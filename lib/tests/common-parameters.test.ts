import type { OpenAPIObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { generateZodClientFromOpenAPI } from "../src/index.ts";

// https://github.com/astahmer/openapi-zod-client/issues/78
test("common-parameters", async (t) => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { title: "Swagger Petstore - OpenAPI 3.0", version: "1.0.11" },
        paths: {
            "/pet": {
                parameters: [
                    { name: "petId", in: "query", required: true, schema: { type: "string" } },
                    { name: "otherParam", in: "query", schema: { $ref: "#/components/schemas/paramRef" } },
                ],
                put: {
                    parameters: [
                        { name: "petId", in: "query", required: true, schema: { type: "number" } },
                        { name: "personId", in: "query", required: true, schema: { type: "number" } },
                    ],
                    responses: {
                        "200": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { type: "string" } } },
                        },
                    },
                },
                post: {
                    responses: {
                        "200": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { type: "boolean" } } },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                paramRef: { type: "number" },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    await assertSnapshot(t, output);
});
