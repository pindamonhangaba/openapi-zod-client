import type { OpenAPIObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { generateZodClientFromOpenAPI } from "../src/index.ts";

test("schema-type-wrong-case", async (t) => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { title: "Swagger Petstore - OpenAPI 3.0", version: "1.0.11" },
        paths: {
            "/pet": {
                put: {
                    responses: {
                        "200": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/test1" } } },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                test1: { type: "object", properties: { text1: { type: "Integer" as any } } },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    await assertSnapshot(t, output);
});