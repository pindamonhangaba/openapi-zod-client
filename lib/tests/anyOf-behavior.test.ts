import { describe, test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { z } from "zod";
import { makeSchemaResolver } from "../src/makeSchemaResolver.ts";
import { getZodSchema } from "../src/openApiToZod.ts";
import { asComponentSchema } from "../src/utils.ts";
import { CodeMeta } from "../src/CodeMeta.ts";
import { OpenAPIObject } from "openapi3-ts";
import { generateZodClientFromOpenAPI } from "../src/generateZodClientFromOpenAPI.ts";

// the schemas and fixtures used in these tests are modified from examples here: https://swagger.io/docs/specification/data-models/oneof-anyof-allof-not/#anyof

type Validator = <T>(zod: typeof z, input: T) => T;

function createValidator(zodSchema: CodeMeta) {
    return new Function("z", "input", `return ${zodSchema}.parse(input)`) as Validator;
}

const fixtures = {
    petByAge: { age: 4 },
    petByType: { pet_type: "Cat" },
    petByAgeAndType: {
        nickname: "Fido",
        pet_type: "Dog",
        age: 4,
    },
    invalid: {
        nickname: "Mr. Paws",
        hunts: false,
    },
};

describe("anyOf behavior", () => {
    test("adds passthrough() to objects", async (t) => {
        const zodSchema = getZodSchema({
            schema: {
                anyOf: [
                    {
                        type: "object",
                        properties: {
                            age: {
                                type: "integer",
                            },
                            nickname: {
                                type: "string",
                            },
                        },
                        required: ["age"],
                    },
                    {
                        type: "object",
                        properties: {
                            pet_type: {
                                type: "string",
                                enum: ["Cat", "Dog"],
                            },
                            hunts: {
                                type: "boolean",
                            },
                        },
                        required: ["pet_type"],
                    },
                ],
            },
        });

        await assertSnapshot(t, zodSchema);

        const validator = createValidator(zodSchema);
        expect(validator(z, fixtures.petByAge)).toEqual(fixtures.petByAge);
        expect(validator(z, fixtures.petByType)).toEqual(fixtures.petByType);
        expect(validator(z, fixtures.petByAgeAndType)).toEqual(fixtures.petByAgeAndType);
        expect(() => validator(z, fixtures.invalid)).toThrow();
    });

    test("handles mixes of primitive types and objects", async (t) => {
        const zodSchema = getZodSchema({
            schema: {
                anyOf: [
                    {
                        type: "object",
                        properties: {
                            age: {
                                type: "integer",
                            },
                            nickname: {
                                type: "string",
                            },
                        },
                        required: ["age"],
                    },
                    {
                        type: "object",
                        properties: {
                            pet_type: {
                                type: "string",
                                enum: ["Cat", "Dog"],
                            },
                            hunts: {
                                type: "boolean",
                            },
                        },
                        required: ["pet_type"],
                    },
                    { type: "number" },
                ],
            },
        });

        await assertSnapshot(t, zodSchema);

        const validator = createValidator(zodSchema);
        expect(validator(z, fixtures.petByAge)).toEqual(fixtures.petByAge);
        expect(validator(z, fixtures.petByType)).toEqual(fixtures.petByType);
        expect(validator(z, fixtures.petByAgeAndType)).toEqual(fixtures.petByAgeAndType);
        expect(() => validator(z, fixtures.invalid)).toThrow();
        expect(validator(z, 1)).toEqual(1);
    });

    test("handles an array of types", async (t) => {
        const zodSchema = getZodSchema({
            schema: {
                anyOf: [
                    {
                        type: ["number", "boolean"],
                    },
                    {
                        type: "object",
                        properties: {
                            age: {
                                type: "integer",
                            },
                            nickname: {
                                type: "string",
                            },
                        },
                        required: ["age"],
                    },
                    {
                        type: "object",
                        properties: {
                            pet_type: {
                                type: "string",
                                enum: ["Cat", "Dog"],
                            },
                            hunts: {
                                type: "boolean",
                            },
                        },
                        required: ["pet_type"],
                    },
                    { type: "string" },
                ],
            },
        });

        await assertSnapshot(t, zodSchema);

        const validator = createValidator(zodSchema);
        expect(validator(z, fixtures.petByAge)).toEqual(fixtures.petByAge);
        expect(validator(z, fixtures.petByType)).toEqual(fixtures.petByType);
        expect(validator(z, fixtures.petByAgeAndType)).toEqual(fixtures.petByAgeAndType);
        expect(() => validator(z, fixtures.invalid)).toThrow();
        expect(validator(z, 1)).toEqual(1);
        expect(validator(z, "hello")).toEqual("hello");
        expect(validator(z, true)).toEqual(true);
    });

    test("handles $refs", async (t) => {
        const openApiDoc: OpenAPIObject = {
            openapi: "3.0.2",
            info: {
                title: "anyOf with refs",
                version: "v1",
            },
            paths: {
                "/test": {
                    get: {
                        parameters: [
                            {
                                name: "anyOfRef",
                                schema: {
                                    anyOf: [
                                        { $ref: "#/components/schemas/PetByAge" },
                                        { $ref: "#/components/schemas/PetByType" },
                                    ],
                                },
                                in: "query",
                            },
                        ],
                    },
                },
            },
            components: {
                schemas: {
                    PetByAge: {
                        type: "object",
                        properties: {
                            age: {
                                type: "integer",
                            },
                            nickname: {
                                type: "string",
                            },
                        },
                        required: ["age"],
                    },
                    PetByType: {
                        type: "object",
                        properties: {
                            pet_type: {
                                type: "string",
                                enum: ["Cat", "Dog"],
                            },
                            hunts: {
                                type: "boolean",
                            },
                        },
                        required: ["pet_type"],
                    },
                },
            },
        };

        const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
        await assertSnapshot(t, output);
    });
});
