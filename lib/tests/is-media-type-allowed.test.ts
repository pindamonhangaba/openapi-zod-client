import { getZodiosEndpointDefinitionList } from "../src/index.ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { OpenAPIObject } from "openapi3-ts";

test("is-media-type-allowed", async (t) => {
    const doc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/unusual-ref-format": {
                get: {
                    operationId: "getWithUnusualRefFormat",
                    responses: {
                        "200": {
                            content: {
                                "application/json": { schema: { $ref: "#components/schemas/Basic" } },
                                "application/json-ld": { schema: { $ref: "#components/schemas/CustomMediaType" } },
                            },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                Basic: { type: "string" },
                CustomMediaType: { type: "number" },
            },
        },
    };
    const defaultResult = getZodiosEndpointDefinitionList(doc);
    await assertSnapshot(t, defaultResult.endpoints);

    const withCustomOption = getZodiosEndpointDefinitionList(doc, {
        isMediaTypeAllowed: (mediaType) => mediaType === "application/json-ld",
    });
    await assertSnapshot(t, withCustomOption.endpoints);
});
