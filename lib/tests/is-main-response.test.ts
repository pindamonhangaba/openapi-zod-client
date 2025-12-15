import { SchemasObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { generateZodClientFromOpenAPI } from "../src/index.ts";

test("determines which one is-main-response", async (t) => {
    const schemas = {
        Main: {
            type: "object",
            properties: {
                str: { type: "string" },
                nb: { type: "number" },
            },
            required: ["str", "nb"],
        },
        AnotherSuccess: { type: "number" },
    } as SchemasObject;

    const openApiDoc = {
        openapi: "3.0.3",
        info: { title: "Swagger Petstore - OpenAPI 3.0", version: "1.0.11" },
        paths: {
            "/example": {
                get: {
                    operationId: "getExample",
                    responses: {
                        "200": { description: "OK", content: { "application/json": { schema: schemas.Main } } },
                        "201": {
                            description: "Created",
                            content: { "application/json": { schema: schemas.AnotherSuccess } },
                        },
                    },
                },
            },
        },
        components: { schemas },
    };

    const result = await generateZodClientFromOpenAPI({
        openApiDoc,
        disableWriteToFile: true,
        options: { isMainResponseStatus: "status === 201" },
    });

    await assertSnapshot(t, result);
});