import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { getZodiosEndpointDefinitionList } from "../src/index.ts";

test("missing operationId outputs variables['undefined_Body']", async (t) => {
    const result = getZodiosEndpointDefinitionList({
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/media-objects/{id}": {
                put: {
                    requestBody: {
                        content: { "application/json": { schema: { $ref: "#/components/schemas/Basic" } } },
                    },
                    responses: {
                        "200": {
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Basic" } } },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                Payload: { type: "object", properties: { thing: { type: "number" } } },
                Basic: { type: "string" },
            },
        },
    });
    await assertSnapshot(t, result.endpoints);
});
