import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPIObject, SchemaObject } from "openapi3-ts";
import { get } from "pastable/server";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph.ts";
import { topologicalSort } from "./topologicalSort.ts";
import { asComponentSchema } from "./utils.ts";

test("petstore.yaml", async (t) => {
    const openApiDoc = (await SwaggerParser.parse("./samples/v3.0/petstore.yaml")) as OpenAPIObject;
    const getSchemaByRef = (ref: string) => get(openApiDoc, ref.replace("#/", "").replaceAll("/", ".")) as SchemaObject;
    const { refsDependencyGraph: result, deepDependencyGraph } = getOpenApiDependencyGraph(
        Object.keys(openApiDoc.components?.schemas || {}).map((name) => asComponentSchema(name)),
        getSchemaByRef
    );
    await assertSnapshot(t, {
        refsDependencyGraph: result,
        topologicalSortRefs: topologicalSort(result),
        deepDependencyGraph,
        topologicalSortDeep: topologicalSort(deepDependencyGraph),
    });
});

test("complex relations", async (t) => {
    const schemas = {
        Basic: { type: "object", properties: { prop: { type: "string" }, second: { type: "number" } } },
        WithNested: { type: "object", properties: { nested: { type: "string" }, nestedRef: { $ref: "DeepNested" } } },
        ObjectWithArrayOfRef: {
            type: "object",
            properties: {
                exampleProp: { type: "string" },
                another: { type: "number" },
                link: { type: "array", items: { $ref: "WithNested" } },
                someReference: { $ref: "Basic" },
            },
        },
        DeepNested: { type: "object", properties: { deep: { type: "boolean" } } },
        Root: {
            type: "object",
            properties: {
                str: { type: "string" },
                reference: {
                    $ref: "ObjectWithArrayOfRef",
                },
                inline: {
                    type: "object",
                    properties: {
                        nested_prop: { type: "boolean" },
                    },
                },
                another: { $ref: "WithNested" },
                basic: { $ref: "Basic" },
                differentPropSameRef: { $ref: "Basic" },
            },
        },
    } as Record<string, SchemaObject>;

    const getSchemaByRef = (ref: string) => schemas[ref]!;
    const { refsDependencyGraph: result, deepDependencyGraph } = getOpenApiDependencyGraph(
        Object.keys(schemas),
        getSchemaByRef
    );
    await assertSnapshot(t, {
        refsDependencyGraph: result,
        topologicalSortRefs: topologicalSort(result),
        deepDependencyGraph,
        topologicalSortDeep: topologicalSort(deepDependencyGraph),
    });
});

test("recursive relations", async (t) => {
    const UserWithFriends = {
        type: "object",
        properties: {
            name: { type: "string" },
            parent: { $ref: "UserWithFriends" },
            friends: { type: "array", items: { $ref: "Friend" } },
            bestFriend: { $ref: "Friend" },
        },
    } as SchemaObject;

    const Friend = {
        type: "object",
        properties: {
            nickname: { type: "string" },
            user: { $ref: "UserWithFriends" },
            circle: { type: "array", items: { $ref: "Friend" } },
        },
    } as SchemaObject;
    const schemas = { UserWithFriends, Friend } as Record<string, SchemaObject>;

    const getSchemaByRef = (ref: string) => schemas[ref]!;
    const { refsDependencyGraph: result, deepDependencyGraph } = getOpenApiDependencyGraph(
        Object.keys(schemas),
        getSchemaByRef
    );
    await assertSnapshot(t, {
        refsDependencyGraph: result,
        topologicalSortRefs: topologicalSort(result),
        deepDependencyGraph,
        topologicalSortDeep: topologicalSort(deepDependencyGraph),
    });
});

test("recursive relations along with some basics schemas", async (t) => {
    const schemas = {
        UserWithFriends: {
            type: "object",
            properties: {
                name: { type: "string" },
                parent: { $ref: "UserWithFriends" },
                friends: { type: "array", items: { $ref: "Friend" } },
                bestFriend: { $ref: "Friend" },
                withNested: { $ref: "WithNested" },
            },
        },
        Friend: {
            type: "object",
            properties: {
                nickname: { type: "string" },
                user: { $ref: "UserWithFriends" },
                circle: { type: "array", items: { $ref: "Friend" } },
                basic: { $ref: "Basic" },
            },
        },
        Basic: { type: "object", properties: { prop: { type: "string" }, second: { type: "number" } } },
        WithNested: { type: "object", properties: { nested: { type: "string" }, nestedRef: { $ref: "DeepNested" } } },
        ObjectWithArrayOfRef: {
            type: "object",
            properties: {
                exampleProp: { type: "string" },
                another: { type: "number" },
                link: { type: "array", items: { $ref: "WithNested" } },
                someReference: { $ref: "Basic" },
            },
        },
        DeepNested: { type: "object", properties: { deep: { type: "boolean" } } },
        Root: {
            type: "object",
            properties: {
                str: { type: "string" },
                reference: {
                    $ref: "ObjectWithArrayOfRef",
                },
                inline: {
                    type: "object",
                    properties: {
                        nested_prop: { type: "boolean" },
                    },
                },
                another: { $ref: "WithNested" },
                basic: { $ref: "Basic" },
                differentPropSameRef: { $ref: "Basic" },
            },
        },
    } as Record<string, SchemaObject>;

    const getSchemaByRef = (ref: string) => schemas[ref]!;
    const { refsDependencyGraph: result, deepDependencyGraph } = getOpenApiDependencyGraph(
        Object.keys(schemas),
        getSchemaByRef
    );
    await assertSnapshot(t, {
        refsDependencyGraph: result,
        topologicalSortRefs: topologicalSort(result),
        deepDependencyGraph,
        topologicalSortDeep: topologicalSort(deepDependencyGraph),
    });
});
