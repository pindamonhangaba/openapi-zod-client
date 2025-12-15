import { OpenAPIObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from "../src/index.ts";

test("same-schema-different-name", async (t) => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/same-schema-different-name": {
                put: {
                    operationId: "putSameSchemaDifferentName",
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
                            name: "sameSchemaDifferentName",
                            in: "query",
                            schema: { type: "string", enum: ["aaa", "bbb", "ccc"] },
                        },
                    ],
                },
                post: {
                    operationId: "postSameSchemaDifferentName",
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
                            name: "differentNameSameSchema",
                            in: "query",
                            schema: { type: "string", enum: ["aaa", "bbb", "ccc"] },
                        },
                        {
                            name: "anotherDifferentNameWithSlightlyDifferentSchema",
                            in: "query",
                            schema: { type: "string", enum: ["aaa", "bbb", "ccc"], default: "aaa" },
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

test.skip("same-schema-different-name-old", async (t) => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/same-schema-different-name": {
                put: {
                    operationId: "putSameSchemaDifferentName",
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
                            name: "sameSchemaDifferentName",
                            in: "query",
                            schema: { type: "string", enum: ["aaa", "bbb", "ccc"] },
                        },
                    ],
                },
                post: {
                    operationId: "postSameSchemaDifferentName",
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
                            name: "differentNameSameSchema",
                            in: "query",
                            schema: { type: "string", enum: ["aaa", "bbb", "ccc"] },
                        },
                        {
                            name: "anotherDifferentNameWithSlightlyDifferentSchema",
                            in: "query",
                            schema: { type: "string", enum: ["aaa", "bbb", "ccc"], default: "aaa" },
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