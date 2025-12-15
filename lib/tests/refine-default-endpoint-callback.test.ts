import { getZodiosEndpointDefinitionList } from "../src/index.ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

test("refine-default-endpoint-callback", async (t) => {
    // Without the refiner function passed.
    await assertSnapshot(t, getZodiosEndpointDefinitionList({
            openapi: "3.0.3",
            info: { version: "1", title: "Example API" },
            paths: {
                "/basic-schema": {
                    get: {
                        operationId: "getBasicSchema",
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
                    Basic: { type: "string" },
                },
            },
        }));

    // With the refiner function passed.
    await assertSnapshot(t,
        getZodiosEndpointDefinitionList(
            {
                openapi: "3.0.3",
                info: { version: "1", title: "Example API" },
                paths: {
                    "/basic-schema": {
                        get: {
                            operationId: "getBasicSchema",
                            responses: {
                                "200": {
                                    content: { "application/json": { schema: { $ref: "#/components/schemas/Basic" } } },
                                },
                            },
                            security: [
                                {
                                    petstore_auth: ["read:schema"],
                                },
                            ],
                        },
                    },
                },
                components: {
                    schemas: {
                        Basic: { type: "string" },
                    },
                },
            },
            {
                endpointDefinitionRefiner: (defaultDefinition, operation) => ({
                    ...defaultDefinition,
                    operationId: operation.operationId,
                    security: operation.security,
                }),
            }
        ));
});
