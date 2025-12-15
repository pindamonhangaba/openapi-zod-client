import type { SchemaObject, SchemasObject } from "openapi3-ts";
import { describe, test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import {
    getOpenApiDependencyGraph,
    getZodClientTemplateContext,
    getZodiosEndpointDefinitionList,
    getZodSchema,
} from "../src/index.ts";
import { generateZodClientFromOpenAPI } from "../src/generateZodClientFromOpenAPI.ts";
import { topologicalSort } from "../src/topologicalSort.ts";
import type { ConversionTypeContext } from "../src/CodeMeta.ts";
import { makeSchemaResolver } from "../src/makeSchemaResolver.ts";
import { asComponentSchema } from "../src/utils.ts";

// TODO recursive inline response/param ?

const makeOpenApiDoc = (schemas: SchemasObject, responseSchema: SchemaObject) => ({
    openapi: "3.0.3",
    info: { title: "Swagger Petstore - OpenAPI 3.0", version: "1.0.11" },
    paths: {
        "/example": {
            get: {
                operationId: "getExample",
                responses: {
                    "200": { description: "OK", content: { "application/json": { schema: responseSchema } } },
                },
            },
        },
    },
    components: { schemas },
});

describe("recursive-schema", () => {
    const UserSchema = {
        type: "object",
        properties: {
            name: { type: "string" },
            parent: { $ref: "#/components/schemas/User" },
        },
    } as SchemaObject;

    test("indirect single recursive", async (t) => {
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
        const ctx: ConversionTypeContext = {
            zodSchemaByName: {},
            schemaByName: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));
        await assertSnapshot(t, getZodSchema({ schema: schemas.Root, ctx }));
        await assertSnapshot(t, ctx);

        const openApiDoc = makeOpenApiDoc(schemas, schemas.Root);
        const depsGraph = getOpenApiDependencyGraph(
            Object.keys(ctx.zodSchemaByName).map((name) => asComponentSchema(name)),
            ctx.resolver.getSchemaByRef
        );
        await assertSnapshot(t, depsGraph);

        await assertSnapshot(t, topologicalSort(depsGraph.refsDependencyGraph));

        const prettyOutput = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });
        await assertSnapshot(t, prettyOutput);
    });

    const ObjectWithRecursiveArray = {
        type: "object",
        properties: {
            isInsideObjectWithRecursiveArray: { type: "boolean" },
            array: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/ObjectWithRecursiveArray",
                },
            },
        },
    } as SchemaObject;
    const schemas2 = { ObjectWithRecursiveArray };
    const ResponseSchema = {
        type: "object",
        properties: {
            recursiveRef: {
                $ref: "#/components/schemas/ObjectWithRecursiveArray",
            },
            basic: { type: "number" },
        },
    } as SchemaObject;

    test("recursive array", async (t) => {
        const ctx: ConversionTypeContext = {
            zodSchemaByName: {},
            schemaByName: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));
        await assertSnapshot(t, getZodSchema({ schema: ResponseSchema, ctx }));
        await assertSnapshot(t, ctx);

        await assertSnapshot(t, getZodiosEndpointDefinitionList(makeOpenApiDoc(schemas2, ResponseSchema)));
    });

    test("direct recursive", async (t) => {
        const ctx: ConversionTypeContext = {
            zodSchemaByName: {},
            schemaByName: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));
        await assertSnapshot(t, getZodSchema({ schema: UserSchema, ctx }));
        await assertSnapshot(t, ctx);
    });

    const UserWithFriends = {
        type: "object",
        properties: {
            name: { type: "string" },
            parent: { $ref: "#/components/schemas/UserWithFriends" },
            friends: { type: "array", items: { $ref: "#/components/schemas/Friend" } },
            bestFriend: { $ref: "#/components/schemas/Friend" },
        },
    } as SchemaObject;

    const Friend = {
        type: "object",
        properties: {
            nickname: { type: "string" },
            user: { $ref: "#/components/schemas/UserWithFriends" },
            circle: { type: "array", items: { $ref: "#/components/schemas/Friend" } },
        },
    } as SchemaObject;
    const schemas = { User: UserSchema, UserWithFriends, Friend, ResponseSchema, ObjectWithRecursiveArray };

    test("multiple recursive in one root schema", async (t) => {
        const ctx: ConversionTypeContext = {
            zodSchemaByName: {},
            schemaByName: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));
        await assertSnapshot(t,
            getZodSchema({
                schema: {
                    type: "object",
                    properties: {
                        recursiveUser: {
                            $ref: "#/components/schemas/UserWithFriends",
                        },
                        basic: { type: "number" },
                    },
                },
                ctx,
            })
        );
        await assertSnapshot(t, ctx);

        const openApiDoc = makeOpenApiDoc(schemas, {
            type: "object",
            properties: {
                someUser: {
                    $ref: "#/components/schemas/UserWithFriends",
                },
                someProp: { type: "boolean" },
            },
        });

        await assertSnapshot(t, getZodiosEndpointDefinitionList(openApiDoc));

        const templateCtx = getZodClientTemplateContext(openApiDoc);
        await assertSnapshot(t, templateCtx);

        const prettyOutput = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });
        await assertSnapshot(t, prettyOutput);
    });

    test("recursive schema with $ref to another simple schema should still generate and output that simple schema and its dependencies", async (t) => {
        const Playlist = {
            type: "object",
            properties: {
                name: { type: "string" },
                author: { $ref: "#/components/schemas/Author" },
                songs: { type: "array", items: { $ref: "#/components/schemas/Song" } },
            },
        } as SchemaObject;

        const Song = {
            type: "object",
            properties: {
                name: { type: "string" },
                duration: { type: "number" },
                in_playlists: { type: "array", items: { $ref: "#/components/schemas/Playlist" } },
            },
        } as SchemaObject;

        const Author = {
            type: "object",
            properties: {
                name: { type: "string" },
                mail: { type: "string" },
                settings: { $ref: "#/components/schemas/Settings" },
            },
        } as SchemaObject;
        const Settings = {
            type: "object",
            properties: {
                theme_color: { type: "string" },
            },
        } as SchemaObject;
        const schemas = { Playlist, Song, Author, Settings };

        const ctx: ConversionTypeContext = {
            zodSchemaByName: {},
            schemaByName: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));

        const RootSchema = {
            type: "object",
            properties: {
                playlist: { $ref: "#/components/schemas/Playlist" },
                by_author: { $ref: "#/components/schemas/Author" },
            },
        } as SchemaObject;
        await assertSnapshot(t, getZodSchema({ schema: RootSchema, ctx }));
        await assertSnapshot(t, ctx);

        const openApiDoc = makeOpenApiDoc(schemas, RootSchema);
        const prettyOutput = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });
        await assertSnapshot(t, prettyOutput);
    });
});
