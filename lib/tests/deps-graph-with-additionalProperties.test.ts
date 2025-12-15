import { ReferenceObject, SchemaObject, SchemasObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { getOpenApiDependencyGraph } from "../src/index.ts";

const makeOpenApiDoc = (schemas: SchemasObject, responseSchema: SchemaObject | ReferenceObject) => ({
    openapi: "3.0.3",
    info: { title: "Swagger Petstore - OpenAPI 3.0", version: "1.0.11" },
    paths: {
        "/example": {
            get: {
                operationId: "getExample",
                responses: {
                    "200": { description: "OK", content: { "application/json": { schema: responseSchema } } },
                },
            },
        },
    },
    components: { schemas },
});

test("deps-graph-with-additionalProperties", async (t) => {
    const schemas = {
        ResponseItem: {
            type: "object",
            properties: {
                id: { type: "string" },
            },
        },
        Something: {
            type: "object",
            properties: {
                str: { type: "string" },
            },
        },
        ResponsesMap: {
            type: "object",
            properties: {
                smth: { $ref: "Something" },
            },
            additionalProperties: {
                $ref: "ResponseItem",
            },
        },
    } as SchemasObject;
    const openApiDoc = makeOpenApiDoc(schemas, { $ref: "ResponsesMap" });
    const getSchemaByRef = (ref: string) => schemas[ref];
    await assertSnapshot(t, getOpenApiDependencyGraph(Object.keys(openApiDoc.components.schemas), getSchemaByRef));
});
