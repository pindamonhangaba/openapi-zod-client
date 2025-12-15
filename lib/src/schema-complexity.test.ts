import type { SchemaObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

import { getSchemaComplexity } from "./schema-complexity.ts";

const getComplexity = (schema: SchemaObject) => getSchemaComplexity({ schema: schema, current: 0 });

test("getSchemaComplexity", async (t) => {
    const results = {
        null: getComplexity({ type: "null" }),
        boolean: getComplexity({ type: "boolean" }),
        string: getComplexity({ type: "string" }),
        number: getComplexity({ type: "number" }),
        integer: getComplexity({ type: "integer" }),
        arrayWithStringItems: getComplexity({ type: "array", items: { type: "string" } }),
        arrayWithoutItems: getComplexity({ type: "array" }),
        objectEmpty: getComplexity({ type: "object" }),
        objectWithAdditionalPropertiesTrue: getComplexity({ type: "object", additionalProperties: true }),
        objectWithAdditionalPropertiesString: getComplexity({ type: "object", additionalProperties: { type: "string" } }),
        objectWithComplexAdditionalProperties: getComplexity({
            type: "object",
            additionalProperties: { type: "object", properties: { str: { type: "string" } } },
        }),
        objectWithMoreComplexAdditionalProperties: getComplexity({
            type: "object",
            additionalProperties: { type: "object", properties: { str: { type: "string" }, nb: { type: "number" } } },
        }),
        objectWithStringProperty: getComplexity({ type: "object", properties: { str: { type: "string" } } }),
        objectWithRefProperty: getComplexity({ type: "object", properties: { reference: { $ref: "#/components/schemas/Basic" } } }),
        objectWithRefArrayProperty: getComplexity({
            type: "object",
            properties: { refArray: { type: "array", items: { $ref: "#/components/schemas/Basic" } } },
        }),
        objectWithTwoProperties: getComplexity({ type: "object", properties: { str: { type: "string" }, nb: { type: "number" } } }),
    };
    
    await assertSnapshot(t, results);

    await assertSnapshot(t, 
        getComplexity({
            type: "object",
            properties: {
                str: { type: "string" },
                nb: { type: "number" },
                nested: {
                    type: "object",
                    properties: {
                        nested_prop: { type: "boolean" },
                    },
                },
            },
        })
    );

    await assertSnapshot(t, 
        getComplexity({
            type: "array",
            items: {
                type: "object",
                properties: {
                    str: { type: "string" },
                },
            },
        })
    );

    await assertSnapshot(t, 
        getComplexity({
            type: "array",
            items: {
                type: "array",
                items: {
                    type: "string",
                },
            },
        })
    );

    await assertSnapshot(t, 
        getComplexity({
            type: "object",
            properties: {
                union: { oneOf: [{ type: "string" }] },
            },
        })
    );
    await assertSnapshot(t, 
        getComplexity({
            type: "object",
            properties: {
                union: { oneOf: [{ type: "string" }, { type: "number" }] },
            },
        })
    );

    await assertSnapshot(t, 
        getComplexity({
            type: "object",
            properties: {
                unionOrArrayOfUnion: { anyOf: [{ type: "string" }] },
            },
        })
    );
    await assertSnapshot(t, 
        getComplexity({
            type: "object",
            properties: {
                unionOrArrayOfUnion: { anyOf: [{ type: "string" }, { type: "number" }] },
            },
        })
    );

    await assertSnapshot(t, 
        getComplexity({
            type: "object",
            properties: {
                intersection: { allOf: [{ type: "string" }] },
            },
        })
    );
    await assertSnapshot(t, 
        getComplexity({
            type: "object",
            properties: {
                intersection: { allOf: [{ type: "string" }, { type: "number" }] },
            },
        })
    );
    await assertSnapshot(t, 
        getComplexity({
            type: "object",
            properties: {
                intersection: {
                    allOf: [{ type: "string" }, { type: "number" }, { type: "boolean" }],
                },
            },
        })
    );
    await assertSnapshot(t, 
        getComplexity({
            type: "object",
            properties: {
                intersection: {
                    allOf: [{ type: "string" }, { type: "number" }, { type: "boolean" }, { type: "null" }],
                },
            },
        })
    );
    await assertSnapshot(t, 
        getComplexity({
            type: "object",
            properties: {
                intersection: {
                    allOf: [
                        { type: "string" },
                        { type: "number" },
                        { type: "boolean" },
                        { type: "null" },
                        { type: "array" },
                    ],
                },
            },
        })
    );
    await assertSnapshot(t, 
        getComplexity({
            type: "object",
            properties: {
                intersection: {
                    allOf: [
                        { type: "string" },
                        { type: "number" },
                        { type: "boolean" },
                        { type: "null" },
                        { type: "array" },
                        { type: "object" },
                    ],
                },
            },
        })
    );
    await assertSnapshot(t, 
        getComplexity({
            type: "object",
            properties: {
                intersection: {
                    allOf: [
                        { type: "string" },
                        { type: "number" },
                        { type: "boolean" },
                        { type: "null" },
                        { type: "array" },
                        { type: "object" },
                        { type: "object" },
                    ],
                },
            },
        })
    );
    await assertSnapshot(t, 
        getComplexity({
            type: "object",
            properties: {
                intersection: {
                    allOf: [
                        { type: "string" },
                        { type: "number" },
                        { type: "boolean" },
                        { type: "null" },
                        { type: "array" },
                        { type: "object" },
                        {
                            type: "object",
                            properties: {
                                str: { type: "string" },
                            },
                        },
                    ],
                },
            },
        })
    );
    await assertSnapshot(t, 
        getComplexity({
            type: "object",
            properties: {
                intersection: {
                    allOf: [
                        { type: "string" },
                        { type: "number" },
                        { type: "boolean" },
                        { type: "null" },
                        { type: "array" },
                        { type: "object" },
                        {
                            type: "object",
                            properties: {
                                str: { type: "string" },
                                nb: { type: "number" },
                            },
                        },
                    ],
                },
            },
        })
    );

    await assertSnapshot(t, getComplexity({ type: "string", enum: ["aaa", "bbb", "ccc"] }));
    await assertSnapshot(t, getComplexity({ type: "number", enum: [1, 2, 3, null] }));
});
