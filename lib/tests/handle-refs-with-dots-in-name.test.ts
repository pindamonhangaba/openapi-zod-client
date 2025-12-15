import { generateZodClientFromOpenAPI, getZodiosEndpointDefinitionList } from "../src/index.ts";
import { test } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import type { OpenAPIObject } from "openapi3-ts";

test("handle-refs-with-dots-in-name", async (t) => {
    const doc = {
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
            "/ref-with-dot-in-name": {
                get: {
                    operationId: "getWithUnusualRefFormat",
                    responses: {
                        "200": {
                            content: {
                                "application/json": { schema: { $ref: "#components/schemas/Basic.Thing" } },
                            },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                Basic: { type: "string" },
                "Basic.Thing": {
                    type: "object",
                    properties: {
                        thing: { $ref: "#/components/schemas/Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj" },
                    },
                },
                "Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj": {
                    type: "object",
                    properties: {
                        aaa: { type: "string" },
                        bbb: { type: "string" },
                    },
                },
            },
        },
    } as OpenAPIObject;

    const endpoints = getZodiosEndpointDefinitionList(doc);
    await assertSnapshot(t, endpoints);

    const output = await generateZodClientFromOpenAPI({ openApiDoc: doc, disableWriteToFile: true });
    await assertSnapshot(t, output);
});