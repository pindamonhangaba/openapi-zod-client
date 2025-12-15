import { getZodiosEndpointDefinitionList } from "../src/index.ts";
import { test } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

test("autofix-unusual-ref-format", async (t) => {
    await assertSnapshot(t,
        getZodiosEndpointDefinitionList({
            openapi: "3.0.3",
            info: { version: "1", title: "Example API" },
            paths: {
                "/usual-ref-format": {
                    get: {
                        operationId: "getWithUsualRefFormat",
                        responses: {
                            "200": {
                                content: { "application/json": { schema: { $ref: "#/components/schemas/Basic" } } },
                            },
                        },
                    },
                },
                "/unusual-ref-format": {
                    get: {
                        operationId: "getWithUnusualRefFormat",
                        responses: {
                            "200": {
                                content: { "application/json": { schema: { $ref: "#components/schemas/Basic" } } },
                            },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    Basic: { type: "string" },
                },
            },
        })
    );
});
