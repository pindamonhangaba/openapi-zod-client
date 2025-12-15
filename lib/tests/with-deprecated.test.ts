import { getZodiosEndpointDefinitionList } from "../src/index.ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { OpenAPIObject } from "openapi3-ts";

test("with-deprecated", async (t) => {
    const doc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/deprecated-endpoint": {
                get: {
                    operationId: "deprecatedEndpoint",
                    responses: { "200": { content: { "application/json": { schema: { type: "string" } } } } },
                    deprecated: true,
                },
            },
            "/new-endpoint": {
                get: {
                    operationId: "newEndpoint",
                    responses: { "200": { content: { "application/json": { schema: { type: "number" } } } } },
                },
            },
        },
    };

    const defaultResult = getZodiosEndpointDefinitionList(doc);
    await assertSnapshot(t, defaultResult.endpoints);

    const withCustomOption = getZodiosEndpointDefinitionList(doc, {
        withDeprecatedEndpoints: true,
    });
    await assertSnapshot(t, withCustomOption.endpoints);
});
