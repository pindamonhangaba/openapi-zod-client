import { OpenAPIObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from "../src/index.ts";

test("schema-name-already-used", async (t) => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/schema-name-already-used": {
                get: {
                    operationId: "getSchemaNameAlreadyUsed",
                    responses: {
                        "200": {
                            content: {
                                "application/json": {
                                    schema: { type: "string" },
                                },
                            },
                        },
                    },
                    parameters: [
                        {
                            name: "schemaNameAlreadyUsed",
                            in: "query",
                            schema: { type: "string", enum: ["xxx", "yyy", "zzz"] },
                        },
                    ],
                },
                put: {
                    operationId: "putSchemaNameAlreadyUsed",
                    responses: {
                        "200": {
                            content: {
                                "application/json": {
                                    schema: { type: "string" },
                                },
                            },
                        },
                    },
                    parameters: [
                        {
                            name: "schemaNameAlreadyUsed",
                            in: "query",
                            schema: { type: "string", enum: ["aaa", "bbb", "ccc"] },
                        },
                    ],
                },
                delete: {
                    operationId: "deleteSchemaNameAlreadyUsed",
                    responses: {
                        "200": {
                            content: {
                                "application/json": {
                                    schema: { type: "string" },
                                },
                            },
                        },
                    },
                    parameters: [
                        {
                            name: "schemaNameAlreadyUsed",
                            in: "query",
                            schema: { type: "string", enum: ["ddd", "eee", "fff"] },
                        },
                    ],
                },
                post: {
                    operationId: "postSchemaNameAlreadyUsed",
                    responses: {
                        "200": {
                            content: {
                                "application/json": {
                                    schema: { type: "string" },
                                },
                            },
                        },
                    },
                    parameters: [
                        {
                            name: "schemaNameAlreadyUsed",
                            in: "query",
                            schema: { type: "string", enum: ["ggg", "hhh", "iii"] },
                        },
                    ],
                },
            },
        },
    };
    const ctx = getZodClientTemplateContext(openApiDoc, { complexityThreshold: 2 });
    await assertSnapshot(t, ctx);

    const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
        options: { complexityThreshold: 2 },
    });

    await assertSnapshot(t, result);
});

test.skip("schema-name-already-used-old", async (t) => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/schema-name-already-used": {
                get: {
                    operationId: "getSchemaNameAlreadyUsed",
                    responses: {
                        "200": {
                            content: {
                                "application/json": {
                                    schema: { type: "string" },
                                },
                            },
                        },
                    },
                    parameters: [
                        {
                            name: "schemaNameAlreadyUsed",
                            in: "query",
                            schema: { type: "string", enum: ["xxx", "yyy", "zzz"] },
                        },
                    ],
                },
                put: {
                    operationId: "putSchemaNameAlreadyUsed",
                    responses: {
                        "200": {
                            content: {
                                "application/json": {
                                    schema: { type: "string" },
                                },
                            },
                        },
                    },
                    parameters: [
                        {
                            name: "schemaNameAlreadyUsed",
                            in: "query",
                            schema: { type: "string", enum: ["aaa", "bbb", "ccc"] },
                        },
                    ],
                },
                delete: {
                    operationId: "deleteSchemaNameAlreadyUsed",
                    responses: {
                        "200": {
                            content: {
                                "application/json": {
                                    schema: { type: "string" },
                                },
                            },
                        },
                    },
                    parameters: [
                        {
                            name: "schemaNameAlreadyUsed",
                            in: "query",
                            schema: { type: "string", enum: ["ddd", "eee", "fff"] },
                        },
                    ],
                },
                post: {
                    operationId: "postSchemaNameAlreadyUsed",
                    responses: {
                        "200": {
                            content: {
                                "application/json": {
                                    schema: { type: "string" },
                                },
                            },
                        },
                    },
                    parameters: [
                        {
                            name: "schemaNameAlreadyUsed",
                            in: "query",
                            schema: { type: "string", enum: ["ggg", "hhh", "iii"] },
                        },
                    ],
                },
            },
        },
    };
    const ctx = getZodClientTemplateContext(openApiDoc, { complexityThreshold: 2 });
    await assertSnapshot(t, ctx);

    const result = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true, options: { complexityThreshold: 2 } });
    await assertSnapshot(t, result);
});