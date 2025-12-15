import { getZodiosEndpointDefinitionList } from "../src/index.ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

test("resolve-ref-responses", async (t) => {
    // Without the refiner function passed.
    const result = getZodiosEndpointDefinitionList({
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/": {
                get: {
                    operationId: "getExample",
                    responses: {
                        "200": {
                            $ref: "#/components/responses/ExampleResponse"
                        },
                    },
                },
            },
        },
        components: {
            responses: {
                ExampleResponse: {
                    description: "example response",
                    content: { "application/json": { schema: { type: "string" } } },
                }
            }
        },
    });
    await assertSnapshot(t, result);
});
