import { beforeAll, describe, test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPIObject, SchemasObject } from "openapi3-ts";

import { generateZodClientFromOpenAPI } from "./generateZodClientFromOpenAPI.ts";
import { getZodClientTemplateContext } from "./template-context.ts";
import { pathToVariableName } from "./utils.ts";

let openApiDoc: OpenAPIObject;
beforeAll(async () => {
    openApiDoc = (await SwaggerParser.parse("./lib/tests/petstore.yaml")) as OpenAPIObject;
});

test("getZodClientTemplateContext", async (t) => {
    const result = getZodClientTemplateContext(openApiDoc);
    await assertSnapshot(t, result);
});

describe("generateZodClientFromOpenAPI", () => {
    test("without options", async (t) => {
        const prettyOutput = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });
        await assertSnapshot(t, prettyOutput);
    });

    test("withAlias as true", async (t) => {
        const prettyOutput = await generateZodClientFromOpenAPI({
            openApiDoc,
            disableWriteToFile: true,
            options: { withAlias: true },
        });
        await assertSnapshot(t, prettyOutput);
    });

    test("withAlias as false", async (t) => {
        const prettyOutput = await generateZodClientFromOpenAPI({
            openApiDoc,
            disableWriteToFile: true,
            options: { withAlias: false },
        });
        await assertSnapshot(t, prettyOutput);
    });

    test("withAlias as a custom function", async (t) => {
        const prettyOutput = await generateZodClientFromOpenAPI({
            openApiDoc,
            disableWriteToFile: true,
            options: {
                withAlias: (path: string, method: string, operation) =>
                    path === "/pet"
                        ? method + "CustomPet"
                        : (operation?.operationId ?? method + pathToVariableName(path || "/noPath")),
            },
        });
        await assertSnapshot(t, prettyOutput);
    });

    test("with baseUrl", async (t) => {
        const prettyOutput = await generateZodClientFromOpenAPI({
            openApiDoc,
            disableWriteToFile: true,
            options: {
                baseUrl: "http://example.com",
            },
        });
        await assertSnapshot(t, prettyOutput);
    });

    test("without default values", async (t) => {
        const prettyOutput = await generateZodClientFromOpenAPI({
            openApiDoc,
            disableWriteToFile: true,
            options: {
                withDefaultValues: false,
            },
        });
        await assertSnapshot(t, prettyOutput);
    });

    test("with tag-file groupStrategy", async (t) => {
        const prettyOutput = await generateZodClientFromOpenAPI({
            openApiDoc,
            disableWriteToFile: true,
            options: { groupStrategy: "tag-file" },
        });
        await assertSnapshot(t, prettyOutput["pet"]);
    });
});

test("with optional, partial, all required objects", async (t) => {
    const schemas = {
        Root2: {
            type: "object",
            properties: {
                str: { type: "string" },
                nb: { type: "number" },
                nested: { $ref: "#/components/schemas/Nested2" },
                partial: { $ref: "#/components/schemas/PartialObject" },
                optionalProp: { type: "string" },
            },
            required: ["str", "nb", "nested"],
        },
        Nested2: {
            type: "object",
            properties: {
                nested_prop: { type: "boolean" },
                deeplyNested: { $ref: "#/components/schemas/DeeplyNested" },
                circularToRoot: { $ref: "#/components/schemas/Root2" },
                requiredProp: { type: "string" },
            },
            required: ["requiredProp"],
        },
        PartialObject: {
            type: "object",
            properties: {
                something: { type: "string" },
                another: { type: "number" },
            },
        },
        DeeplyNested: {
            type: "array",
            items: { $ref: "#/components/schemas/VeryDeeplyNested" },
        },
        VeryDeeplyNested: {
            type: "string",
            enum: ["aaa", "bbb", "ccc"],
        },
    } as SchemasObject;
    const openApiDoc = {
        openapi: "3.0.3",
        info: { title: "Swagger Petstore - OpenAPI 3.0", version: "1.0.11" },
        paths: {
            "/root": {
                get: {
                    operationId: "getRoot",
                    responses: {
                        "200": { description: "OK", content: { "application/json": { schema: schemas["Root2"] } } },
                    },
                },
            },
            "/nested": {
                get: {
                    operationId: "getNested",
                    responses: {
                        "200": { description: "OK", content: { "application/json": { schema: schemas["Nested2"] } } },
                    },
                },
            },
            "/deeplyNested": {
                get: {
                    operationId: "getDeeplyNested",
                    responses: {
                        "200": {
                            description: "OK",
                            content: { "application/json": { schema: schemas["DeeplyNested"] } },
                        },
                    },
                },
            },
            "/veryDeeplyNested": {
                get: {
                    operationId: "getVeryDeeplyNested",
                    responses: {
                        "200": {
                            description: "OK",
                            content: { "application/json": { schema: schemas["VeryDeeplyNested"] } },
                        },
                    },
                },
            },
        },
        components: { schemas },
    };

    const data = getZodClientTemplateContext(openApiDoc);

    await assertSnapshot(t, data);

    const prettyOutput = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });
    await assertSnapshot(t, prettyOutput);
});

test("getZodClientTemplateContext with allReadonly", async (t) => {
    const result = getZodClientTemplateContext(openApiDoc, {
        allReadonly: true,
    });
    await assertSnapshot(t, result);
});
