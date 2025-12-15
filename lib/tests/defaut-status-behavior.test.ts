import { getZodClientTemplateContext, getZodiosEndpointDefinitionList } from "../src/index.ts";
import { test } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { OpenAPIObject } from "openapi3-ts";

test("defaut-status-behavior", async (t) => {
    const doc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/with-default-response": {
                get: {
                    operationId: "withDefaultResponse",
                    responses: { default: { content: { "application/json": { schema: { type: "string" } } } } },
                },
            },
            "/with-default-error": {
                get: {
                    operationId: "withDefaultError",
                    responses: {
                        "200": { content: { "application/json": { schema: { type: "number" } } } },
                        default: { content: { "application/json": { schema: { type: "string" } } } },
                    },
                },
            },
        },
    };

    const defaultResult = getZodClientTemplateContext(doc);
    await assertSnapshot(t, defaultResult.endpoints);

    const withAutoCorrectResult = getZodClientTemplateContext(doc, { defaultStatusBehavior: "auto-correct" });
    await assertSnapshot(t, withAutoCorrectResult.endpoints);
});
