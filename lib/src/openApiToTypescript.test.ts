import {getTypescriptFromOpenApi, TsConversionContext} from "./openApiToTypescript.ts";

import type {SchemaObject, SchemasObject} from "openapi3-ts";
import {ts} from "tanu";
import {describe, test} from "jsr:@std/testing/bdd";
import {expect} from "jsr:@std/expect";
import {assertSnapshot} from "jsr:@std/testing/snapshot";
import {makeSchemaResolver} from "./makeSchemaResolver.ts";
import {asComponentSchema} from "./utils.ts";
import type {TemplateContext} from "./template-context.ts";
import type {OpenAPIV3} from "openapi-types";

const makeSchema = (schema: SchemaObject | OpenAPIV3.SchemaObject) => schema as SchemaObject;
const getSchemaAsTsString = (schema: SchemaObject, meta?: { name: string }, options?: TemplateContext["options"]) =>
    printTs(getTypescriptFromOpenApi({ schema: makeSchema(schema), meta, options }) as ts.Node);

const file = ts.createSourceFile("", "", ts.ScriptTarget.ESNext, true);
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const printTs = (node: ts.Node) => printer.printNode(ts.EmitHint.Unspecified, node, file);

test("getSchemaAsTsString", async (t) => {
    const results = {
        null: getSchemaAsTsString({ type: "null" }),
        boolean: getSchemaAsTsString({ type: "boolean" }),
        string: getSchemaAsTsString({ type: "string" }),
        number: getSchemaAsTsString({ type: "number" }),
        integer: getSchemaAsTsString({ type: "integer" }),
        unknown: getSchemaAsTsString({}),
        nullType: getSchemaAsTsString({ type: "null" }, { name: "nullType" }),
        booleanType: getSchemaAsTsString({ type: "boolean" }, { name: "booleanType" }),
        stringType: getSchemaAsTsString({ type: "string" }, { name: "stringType" }),
        numberType: getSchemaAsTsString({ type: "number" }, { name: "numberType" }),
        integerType: getSchemaAsTsString({ type: "integer" }, { name: "integerType" }),
        unknownType: getSchemaAsTsString({}, { name: "unknownType" }),
        arrayString: getSchemaAsTsString({ type: "array", items: { type: "string" } }),
        emptyObject: getSchemaAsTsString({ type: "object" }, { name: "EmptyObject" }),
        basicObject: getSchemaAsTsString({ type: "object", properties: { str: { type: "string" } } }, { name: "BasicObject" }),
        basicObject2: getSchemaAsTsString(
            { type: "object", properties: { str: { type: "string" }, nb: { type: "number" } } },
            { name: "BasicObject2" }
        ),
        allPropertiesRequired: getSchemaAsTsString(
            {
                type: "object",
                properties: { str: { type: "string" }, nb: { type: "number" } },
                required: ["str", "nb"],
            },
            { name: "AllPropertiesRequired" }
        ),
        someOptionalProps: getSchemaAsTsString(
            { type: "object", properties: { str: { type: "string" }, nb: { type: "number" } }, required: ["str"] },
            { name: "SomeOptionalProps" }
        ),
        objectWithNestedProp: getSchemaAsTsString(
            {
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
            },
            { name: "ObjectWithNestedProp" }
        ),
        objectWithAdditionalPropsNb: getSchemaAsTsString(
            { type: "object", properties: { str: { type: "string" } }, additionalProperties: { type: "number" } },
            { name: "ObjectWithAdditionalPropsNb" }
        ),
        objectWithNestedRecordBoolean: getSchemaAsTsString(
            {
                type: "object",
                properties: { str: { type: "string" } },
                additionalProperties: { type: "object", properties: { prop: { type: "boolean" } } },
            },
            { name: "ObjectWithNestedRecordBoolean" }
        ),
        arrayObject: getSchemaAsTsString({
            type: "array",
            items: {
                type: "object",
                properties: {
                    str: { type: "string" },
                },
            },
        }),
        arrayArray: getSchemaAsTsString({
            type: "array",
            items: {
                type: "array",
                items: {
                    type: "string",
                },
            },
        }),
        objectWithEnum: getSchemaAsTsString(
            {
                type: "object",
                properties: {
                    enumprop: { type: "string", enum: ["aaa", "bbb", "ccc"] },
                },
            },
            { name: "ObjectWithEnum" }
        ),
        stringEnumInline: getSchemaAsTsString({ type: "string", enum: ["aaa", "bbb", "ccc"] }),
        stringEnum: getSchemaAsTsString({ type: "string", enum: ["aaa", "bbb", "ccc"] }, { name: "StringENum" }),
        objectWithUnion: getSchemaAsTsString(
            {
                type: "object",
                properties: {
                    union: { oneOf: [{ type: "string" }, { type: "number" }] },
                },
            },
            { name: "ObjectWithUnion" }
        ),
        oneOfInline: getSchemaAsTsString({ oneOf: [{ type: "string" }, { type: "number" }] }),
        stringOrNumber: getSchemaAsTsString({ oneOf: [{ type: "string" }, { type: "number" }] }, { name: "StringOrNumber" }),
        allOfInline: getSchemaAsTsString({ allOf: [{ type: "string" }, { type: "number" }] }),
        stringAndNumber: getSchemaAsTsString({ allOf: [{ type: "string" }, { type: "number" }] }, { name: "StringAndNumber" }),
        nullableAnyOf: getSchemaAsTsString({ nullable: true, anyOf: [{ type: "string" }, { type: "number" }] }),
        nullableOneOf: getSchemaAsTsString({ nullable: true, oneOf: [{ type: "string" }, { type: "number" }] }),
        nullableOneOfNamed: getSchemaAsTsString({ nullable: true, oneOf: [{ type: "string" }, { type: "number" }] }, { name: "StringOrNumber" }),
        nullableAllOf: getSchemaAsTsString({ nullable: true, allOf: [{ type: "string" }, { type: "number" }] }),
        nullableAllOfNamed: getSchemaAsTsString({ nullable: true, allOf: [{ type: "string" }, { type: "number" }] }, { name: "StringAndNumber" }),
        nullableAnyOf2: getSchemaAsTsString({ nullable: true, anyOf: [{ type: "string" }, { type: "number" }] }),
        stringAndNumberMaybeMultiple: getSchemaAsTsString(
            { anyOf: [{ type: "string" }, { type: "number" }] },
            { name: "StringAndNumberMaybeMultiple" }
        ),
        objectWithArrayUnion: getSchemaAsTsString(
            {
                type: "object",
                properties: {
                    unionOrArrayOfUnion: { anyOf: [{ type: "string" }, { type: "number" }] },
                },
            },
            { name: "ObjectWithArrayUnion" }
        ),
        objectWithIntersection: getSchemaAsTsString(
            {
                type: "object",
                properties: {
                    intersection: { allOf: [{ type: "string" }, { type: "number" }] },
                },
            },
            { name: "ObjectWithIntersection" }
        ),
        stringEnumInline2: getSchemaAsTsString({ type: "string", enum: ["aaa", "bbb", "ccc"] }),
        numberEnum: getSchemaAsTsString({ type: "number", enum: [1, 2, 3] }),
        category: getSchemaAsTsString(
            {
                type: "object",
                required: ["propNumber", "propString", "propBoolean"],
                properties: {
                    propNumber: {
                        type: ["number"],
                        nullable: true,
                    },
                    propString: {
                        type: ["string"],
                        nullable: true,
                    },
                    propBoolean: {
                        type: ["boolean"],
                        nullable: true,
                    },
                },
            },
            { name: "Category" }
        ),
    };
    await assertSnapshot(t, results);
});

describe("getSchemaAsTsString with context", () => {
    test("with ref", async (t) => {
        const schemas = {
            Root: {
                type: "object",
                properties: {
                    str: { type: "string" },
                    nb: { type: "number" },
                    nested: { $ref: "#/components/schemas/Nested" },
                },
            },
            Nested: {
                type: "object",
                properties: {
                    nested_prop: { type: "boolean" },
                },
            },
        } as SchemasObject;

        const ctx: TsConversionContext = {
            nodeByRef: {},
            visitedsRefs: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));
        await assertSnapshot(t, printTs(getTypescriptFromOpenApi({ schema: schemas["Root"]!, meta: { name: "Root" }, ctx }) as ts.Node));
    });

    test("with multiple nested refs", async (t) => {
        const schemas = {
            Root2: {
                type: "object",
                properties: {
                    str: { type: "string" },
                    nb: { type: "number" },
                    nested: { $ref: "#/components/schemas/Nested2" },
                },
            },
            Nested2: {
                type: "object",
                properties: {
                    nested_prop: { type: "boolean" },
                    deeplyNested: { $ref: "#/components/schemas/DeeplyNested" },
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

        const ctx: TsConversionContext = {
            nodeByRef: {},
            visitedsRefs: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));
        await assertSnapshot(t,
            printTs(getTypescriptFromOpenApi({ schema: schemas["Root2"]!, meta: { name: "Root2" }, ctx }) as ts.Node)
        );
    });

    test("with indirect recursive ref", async (t) => {
        const schemas = {
            Root3: {
                type: "object",
                properties: {
                    str: { type: "string" },
                    nb: { type: "number" },
                    nested: { $ref: "#/components/schemas/Nested3" },
                    arrayOfNested: { type: "array", items: { $ref: "#/components/schemas/Nested3" } },
                },
            },
            Nested3: {
                type: "object",
                properties: {
                    nested_prop: { type: "boolean" },
                    backToRoot: { $ref: "#/components/schemas/Root3" },
                },
            },
        } as SchemasObject;

        const ctx: TsConversionContext = {
            nodeByRef: {},
            visitedsRefs: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));

        await assertSnapshot(t,
            printTs(
                getTypescriptFromOpenApi({
                    schema: schemas["Root3"]!,
                    meta: { name: "Root3", $ref: "#/components/schemas/Root3" },
                    ctx,
                }) as ts.Node
            )
        );
    });

    test("with direct (self) recursive ref", async (t) => {
        const schemas = {
            Root4: {
                type: "object",
                properties: {
                    str: { type: "string" },
                    nb: { type: "number" },
                    self: { $ref: "#/components/schemas/Root4" },
                    nested: { $ref: "#/components/schemas/Nested4" },
                    arrayOfSelf: { type: "array", items: { $ref: "#/components/schemas/Root4" } },
                },
            },
            Nested4: {
                type: "object",
                properties: {
                    nested_prop: { type: "boolean" },
                    backToRoot: { $ref: "#/components/schemas/Root4" },
                },
            },
        } as SchemasObject;

        const ctx: TsConversionContext = {
            nodeByRef: {},
            visitedsRefs: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));
        const result = getTypescriptFromOpenApi({
            schema: schemas["Root4"]!,
            meta: { name: "Root4", $ref: "#/components/schemas/Root4" },
            ctx,
        }) as ts.Node;

        await assertSnapshot(t, printTs(result));
    });

    test("same schemas as openApiToZod", async (t) => {
        const schemas = {
            User: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    middle: { $ref: "#/components/schemas/Middle" },
                },
            },
            Middle: {
                type: "object",
                properties: {
                    user: { $ref: "#/components/schemas/User" },
                },
            },
            Root: {
                type: "object",
                properties: {
                    recursive: {
                        $ref: "#/components/schemas/User",
                    },
                    basic: { type: "number" },
                },
            },
        } as SchemasObject;

        const ctx: TsConversionContext = {
            nodeByRef: {},
            visitedsRefs: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));
        const result = getTypescriptFromOpenApi({
            schema: schemas["Root"]!,
            meta: { name: "Root", $ref: "#/components/schemas/Root" },
            ctx,
        }) as ts.Node;

        await assertSnapshot(t, printTs(result));
    });

    test("anyOf with refs", async (t) => {
        const schemas = {
            User: {
                type: "object",
                properties: {
                    name: { type: "string" },
                },
            },
            Member: {
                type: "object",
                properties: {
                    name: { type: "string" },
                },
            },
            Root: {
                type: "object",
                properties: {
                    user: { oneOf: [{ $ref: "#/components/schemas/User" }, { $ref: "#/components/schemas/Member" }] },
                    users: {
                        type: "array",
                        items: {
                            anyOf: [{ $ref: "#/components/schemas/User" }, { $ref: "#/components/schemas/Member" }],
                        },
                    },
                    basic: { type: "number" },
                },
            },
        } as SchemasObject;

        const ctx: TsConversionContext = {
            nodeByRef: {},
            visitedsRefs: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));
        const result = getTypescriptFromOpenApi({
            schema: schemas["Root"]!,
            meta: { name: "Root", $ref: "#/components/schemas/Root" },
            ctx,
        }) as ts.Node;

        await assertSnapshot(t, printTs(result));
    });
});

test("getSchemaAsTsString with readonly", async (t) => {
    const options: TemplateContext['options'] = {
        allReadonly: true
    };
    const results = {
        null: getSchemaAsTsString({ type: "null" }, undefined, options),
        boolean: getSchemaAsTsString({ type: "boolean" }, undefined, options),
        string: getSchemaAsTsString({ type: "string" }, undefined, options),
        number: getSchemaAsTsString({ type: "number" }, undefined, options),
        integer: getSchemaAsTsString({ type: "integer" }, undefined, options),
        unknown: getSchemaAsTsString({}, undefined, options),
        nullType: getSchemaAsTsString({ type: "null" }, { name: "nullType" }, options),
        booleanType: getSchemaAsTsString({ type: "boolean" }, { name: "booleanType" }, options),
        stringType: getSchemaAsTsString({ type: "string" }, { name: "stringType" }, options),
        numberType: getSchemaAsTsString({ type: "number" }, { name: "numberType" }, options),
        integerType: getSchemaAsTsString({ type: "integer" }, { name: "integerType" }, options),
        unknownType: getSchemaAsTsString({}, { name: "unknownType" }, options),
        arrayString: getSchemaAsTsString({ type: "array", items: { type: "string" } }, undefined, options),
        emptyObject: getSchemaAsTsString({ type: "object" }, { name: "EmptyObject" }, options),
        basicObject: getSchemaAsTsString({ type: "object", properties: { str: { type: "string" } } }, { name: "BasicObject" }, options),
        basicObject2: getSchemaAsTsString(
            { type: "object", properties: { str: { type: "string" }, nb: { type: "number" } } },
            { name: "BasicObject2" },
            options
        ),
        allPropertiesRequired: getSchemaAsTsString(
            {
                type: "object",
                properties: { str: { type: "string" }, nb: { type: "number" } },
                required: ["str", "nb"],
            },
            { name: "AllPropertiesRequired" },
            options
        ),
        someOptionalProps: getSchemaAsTsString(
            { type: "object", properties: { str: { type: "string" }, nb: { type: "number" } }, required: ["str"] },
            { name: "SomeOptionalProps" },
            options
        ),
        objectWithNestedProp: getSchemaAsTsString(
            {
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
            },
            { name: "ObjectWithNestedProp" },
            options
        ),
        objectWithAdditionalPropsNb: getSchemaAsTsString(
            { type: "object", properties: { str: { type: "string" } }, additionalProperties: { type: "number" } },
            { name: "ObjectWithAdditionalPropsNb" },
            options
        ),
        objectWithNestedRecordBoolean: getSchemaAsTsString(
            {
                type: "object",
                properties: { str: { type: "string" } },
                additionalProperties: { type: "object", properties: { prop: { type: "boolean" } } },
            },
            { name: "ObjectWithNestedRecordBoolean" },
            options
        ),
        arrayObject: getSchemaAsTsString({
            type: "array",
            items: {
                type: "object",
                properties: {
                    str: { type: "string" },
                },
            },
        }, undefined, options),
        arrayArray: getSchemaAsTsString({
            type: "array",
            items: {
                type: "array",
                items: {
                    type: "string",
                },
            },
        }, undefined, options),
        objectWithEnum: getSchemaAsTsString(
            {
                type: "object",
                properties: {
                    enumprop: { type: "string", enum: ["aaa", "bbb", "ccc"] },
                },
            },
            { name: "ObjectWithEnum" },
            options
        ),
        stringEnumInline: getSchemaAsTsString({ type: "string", enum: ["aaa", "bbb", "ccc"] }, undefined, options),
        stringEnum: getSchemaAsTsString({ type: "string", enum: ["aaa", "bbb", "ccc"] }, { name: "StringENum" }, options),
        objectWithUnion: getSchemaAsTsString(
            {
                type: "object",
                properties: {
                    union: { oneOf: [{ type: "string" }, { type: "number" }] },
                },
            },
            { name: "ObjectWithUnion" },
            options
        ),
        oneOfInline: getSchemaAsTsString({ oneOf: [{ type: "string" }, { type: "number" }] }, undefined, options),
        stringOrNumber: getSchemaAsTsString({ oneOf: [{ type: "string" }, { type: "number" }] }, { name: "StringOrNumber" }, options),
        allOfInline: getSchemaAsTsString({ allOf: [{ type: "string" }, { type: "number" }] }, undefined, options),
        stringAndNumber: getSchemaAsTsString({ allOf: [{ type: "string" }, { type: "number" }] }, { name: "StringAndNumber" }, options),
        nullableAnyOf: getSchemaAsTsString({ nullable: true, anyOf: [{ type: "string" }, { type: "number" }] }, undefined, options),
        nullableOneOf: getSchemaAsTsString({ nullable: true, oneOf: [{ type: "string" }, { type: "number" }] }, undefined, options),
        nullableOneOfNamed: getSchemaAsTsString({ nullable: true, oneOf: [{ type: "string" }, { type: "number" }] }, { name: "StringOrNumber" }, options),
        nullableAllOf: getSchemaAsTsString({ nullable: true, allOf: [{ type: "string" }, { type: "number" }] }, undefined, options),
        nullableAllOfNamed: getSchemaAsTsString({ nullable: true, allOf: [{ type: "string" }, { type: "number" }] }, { name: "StringAndNumber" }, options),
        nullableAnyOf2: getSchemaAsTsString({ nullable: true, anyOf: [{ type: "string" }, { type: "number" }] }, undefined, options),
        stringAndNumberMaybeMultiple: getSchemaAsTsString(
            { anyOf: [{ type: "string" }, { type: "number" }] },
            { name: "StringAndNumberMaybeMultiple" },
            options
        ),
        objectWithArrayUnion: getSchemaAsTsString(
            {
                type: "object",
                properties: {
                    unionOrArrayOfUnion: { anyOf: [{ type: "string" }, { type: "number" }] },
                },
            },
            { name: "ObjectWithArrayUnion" },
            options
        ),
        objectWithIntersection: getSchemaAsTsString(
            {
                type: "object",
                properties: {
                    intersection: { allOf: [{ type: "string" }, { type: "number" }] },
                },
            },
            { name: "ObjectWithIntersection" },
            options
        ),
        stringEnumInline2: getSchemaAsTsString({ type: "string", enum: ["aaa", "bbb", "ccc"] }, undefined, options),
        numberEnum: getSchemaAsTsString({ type: "number", enum: [1, 2, 3] }, undefined, options),
        category: getSchemaAsTsString(
            {
                type: "object",
                required: ["propNumber", "propString", "propBoolean"],
                properties: {
                    propNumber: {
                        type: ["number"],
                        nullable: true,
                    },
                    propString: {
                        type: ["string"],
                        nullable: true,
                    },
                    propBoolean: {
                        type: ["boolean"],
                        nullable: true,
                    },
                },
            },
            { name: "Category" },
            options
        ),
    };
    await assertSnapshot(t, results);
});
