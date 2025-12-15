import type { SchemaObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

import { getZodSchema } from "./openApiToZod.ts";
import type { CodeMetaData, ConversionTypeContext } from "./CodeMeta.ts";
import { makeSchemaResolver } from "./makeSchemaResolver.ts";
import { asComponentSchema } from "./utils.ts";

const makeSchema = (schema: SchemaObject) => schema;
const getSchemaAsZodString = (schema: SchemaObject, meta?: CodeMetaData | undefined) =>
    getZodSchema({ schema: makeSchema(schema), meta }).toString();

test("getSchemaAsZodString", async (t) => {
    const results = {
        null: getSchemaAsZodString({ type: "null" }),
        nullEnum: getSchemaAsZodString({ type: "null", enum: ["Dogs", "Cats", "Mice"] }),
        boolean: getSchemaAsZodString({ type: "boolean" }),
        string: getSchemaAsZodString({ type: "string" }),
        number: getSchemaAsZodString({ type: "number" }),
        integer: getSchemaAsZodString({ type: "integer" }),
        arrayString: getSchemaAsZodString({ type: "array", items: { type: "string" } }),
        object: getSchemaAsZodString({ type: "object" }),
        objectStr: getSchemaAsZodString({ type: "object", properties: { str: { type: "string" } } }),
        objectStr2: getSchemaAsZodString({ type: "object", properties: { str: { type: "string" } } }),
        objectNb: getSchemaAsZodString({ type: "object", properties: { nb: { type: "integer" } } }),
        objectPaMin: getSchemaAsZodString({ type: "object", properties: { pa: { type: "number", minimum: 0 } } }),
        objectPaMinMax: getSchemaAsZodString({ type: "object", properties: { pa: { type: "number", minimum: 0, maximum: 100 } } }),
        objectMl: getSchemaAsZodString({ type: "object", properties: { ml: { type: "string", minLength: 0 } } }),
        objectDt: getSchemaAsZodString({ type: "object", properties: { dt: { type: "string", format: "date-time" } } }),
        objectNested: getSchemaAsZodString({
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
        }),
        arrayObject: getSchemaAsZodString({
            type: "array",
            items: {
                type: "object",
                properties: {
                    str: { type: "string" },
                },
            },
        }),
        arrayArray: getSchemaAsZodString({
            type: "array",
            items: {
                type: "array",
                items: {
                    type: "string",
                },
            },
        }),
        objectUnion: getSchemaAsZodString({
            type: "object",
            properties: {
                union: { oneOf: [{ type: "string" }, { type: "number" }] },
            },
        }),
        objectOneOfDiscriminator: getSchemaAsZodString({
            type: "object",
            oneOf: [
                {
                    type: "object",
                    required: ["type", "a"],
                    properties: {
                        type: {
                            type: "string",
                            enum: ["a"],
                        },
                        a: {
                            type: "string",
                        },
                    },
                },
                {
                    type: "object",
                    required: ["type", "b"],
                    properties: {
                        type: {
                            type: "string",
                            enum: ["b"],
                        },
                        b: {
                            type: "string",
                        },
                    },
                },
            ],
            discriminator: { propertyName: "type" },
        }),
        objectOneOfAllOfSingle: getSchemaAsZodString({
            type: "object",
            oneOf: [
                {
                    type: "object",
                    allOf: [
                        {
                            type: "object",
                            required: ["type", "a"],
                            properties: {
                                type: {
                                    type: "string",
                                    enum: ["a"],
                                },
                                a: {
                                    type: "string",
                                },
                            },
                        }
                    ]
                },
                {
                    type: "object",
                    allOf: [
                        {
                            type: "object",
                            required: ["type", "b"],
                            properties: {
                                type: {
                                    type: "string",
                                    enum: ["b"],
                                },
                                b: {
                                    type: "string",
                                },
                            },
                        },
                    ]
                }
            ],
            discriminator: { propertyName: "type" },

        }),
        objectOneOfAllOfMultiple: getSchemaAsZodString({
            type: "object",
            oneOf: [
                {
                    type: "object",
                    allOf: [
                        {
                            type: "object",
                            required: ["type", "a"],
                            properties: {
                                type: {
                                    type: "string",
                                    enum: ["a"],
                                },
                                a: {
                                    type: "string",
                                },
                            },
                        },
                        {
                            type: "object",
                            required: ["type", "c"],
                            properties: {
                                type: {
                                    type: "string",
                                    enum: ["c"],
                                },
                                c: {
                                    type: "string",
                                },
                            },
                        },
                    ]
                },
                {
                    type: "object",
                    allOf: [
                        {
                            type: "object",
                            required: ["type", "b"],
                            properties: {
                                type: {
                                    type: "string",
                                    enum: ["b"],
                                },
                                b: {
                                    type: "string",
                                },
                            },
                        },
                        {
                            type: "object",
                            required: ["type", "d"],
                            properties: {
                                type: {
                                    type: "string",
                                    enum: ["d"],
                                },
                                d: {
                                    type: "string",
                                },
                            },
                        },
                    ]
                }
            ],
            discriminator: { propertyName: "type" },

        }),
        objectAnyOf: getSchemaAsZodString({
            type: "object",
            properties: {
                anyOfExample: { anyOf: [{ type: "string" }, { type: "number" }] },
            },
        }),
        objectIntersection: getSchemaAsZodString({
            type: "object",
            properties: {
                intersection: { allOf: [{ type: "string" }, { type: "number" }] },
            },
        }),
        stringEnum: getSchemaAsZodString({ type: "string", enum: ["aaa", "bbb", "ccc"] }),
        numberEnumNull: getSchemaAsZodString({ type: "number", enum: [1, 2, 3, null] }),
        numberEnumSingle: getSchemaAsZodString({ type: "number", enum: [1] }),
        stringEnumSingle: getSchemaAsZodString({ type: "string", enum: ["aString"] }),
    };
    await assertSnapshot(t, results);
});

test("getSchemaWithChainableAsZodString", async (t) => {
    const results = {
        nullableTrue: getSchemaAsZodString({ type: "string", nullable: true }),
        nullableFalse: getSchemaAsZodString({ type: "string", nullable: false }),
        nullableFalseRequired: getSchemaAsZodString({ type: "string", nullable: false }, { isRequired: true }),
        nullableTrueRequired: getSchemaAsZodString({ type: "string", nullable: true }, { isRequired: true }),
    };
    await assertSnapshot(t, results);
});

test("CodeMeta with missing ref", async (t) => {
    const ctx: ConversionTypeContext = {
        resolver: makeSchemaResolver({ components: { schemas: {} } } as any),
        zodSchemaByName: {},
        schemaByName: {},
    };

    expect(() =>
        getZodSchema({
            schema: makeSchema({
                type: "object",
                properties: {
                    str: { type: "string" },
                    reference: {
                        $ref: "Example",
                    },
                    inline: {
                        type: "object",
                        properties: {
                            nested_prop: { type: "boolean" },
                        },
                    },
                },
            }),
            ctx,
        })
    ).toThrow("Schema Example not found");
});

test("CodeMeta with ref", async (t) => {
    const schemas = {
        Example: {
            type: "object",
            properties: {
                exampleProp: { type: "string" },
                another: { type: "number" },
            },
        },
    } as Record<string, SchemaObject>;
    const ctx: ConversionTypeContext = {
        resolver: makeSchemaResolver({ components: { schemas } } as any),
        zodSchemaByName: {},
        schemaByName: {},
    };
    Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));

    const code = getZodSchema({
        schema: makeSchema({
            type: "object",
            properties: {
                str: { type: "string" },
                reference: {
                    $ref: "#/components/schemas/Example",
                },
                inline: {
                    type: "object",
                    properties: {
                        nested_prop: { type: "boolean" },
                    },
                },
            },
        }),
        ctx,
    });
    await assertSnapshot(t, {
        codeString: code.toString(),
        children: code.children,
    });
});

test("CodeMeta with nested refs", async (t) => {
    const schemas = {
        Basic: { type: "object", properties: { prop: { type: "string" }, second: { type: "number" } } },
        WithNested: {
            type: "object",
            properties: { nested: { type: "string" }, nestedRef: { $ref: "#/components/schemas/DeepNested" } },
        },
        ObjectWithArrayOfRef: {
            type: "object",
            properties: {
                exampleProp: { type: "string" },
                another: { type: "number" },
                link: { type: "array", items: { $ref: "#/components/schemas/WithNested" } },
                someReference: { $ref: "#/components/schemas/Basic" },
            },
        },
        DeepNested: { type: "object", properties: { deep: { type: "boolean" } } },
    } as Record<string, SchemaObject>;
    const ctx: ConversionTypeContext = {
        resolver: makeSchemaResolver({ components: { schemas } } as any),
        zodSchemaByName: {},
        schemaByName: {},
    };
    Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));

    const code = getZodSchema({
        schema: makeSchema({
            type: "object",
            properties: {
                str: { type: "string" },
                reference: {
                    $ref: "#/components/schemas/ObjectWithArrayOfRef",
                },
                inline: {
                    type: "object",
                    properties: {
                        nested_prop: { type: "boolean" },
                    },
                },
                another: { $ref: "#components/schemas/WithNested" },
                basic: { $ref: "#/components/schemas/Basic" },
                differentPropSameRef: { $ref: "#/components/schemas/Basic" },
            },
        }),
        ctx,
    });
    await assertSnapshot(t, {
        codeString: code.toString(),
        children: code.children,
        ctx,
    });
});
