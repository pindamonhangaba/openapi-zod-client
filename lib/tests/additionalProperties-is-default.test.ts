import { describe, test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
// Note: Deno usually requires explicit file extensions. 
// You might need to change '../src' to '../src/mod.ts' or '../src/index.ts'
import { getZodSchema } from "../src/index.ts"; 

// see: https://swagger.io/docs/specification/data-models/data-types/#free-form
describe("additional-properties", () => {
    test("plain free-form object", () => {
        const schema = getZodSchema({
            schema: {
                type: "object",
            },
        });

        expect(schema.codeString).toBe("z.object({}).partial().passthrough()");
    });

    test("additionalProperties is true", () => {
        const schema = getZodSchema({
            schema: {
                type: "object",
                additionalProperties: true,
            },
        });

        expect(schema.codeString).toBe("z.object({}).partial().passthrough()");
    });

    test("additionalProperties is empty object", () => {
        const schema = getZodSchema({
            schema: {
                type: "object",
                // empty object is equivalent to true according to swagger docs above
                additionalProperties: {},
            },
        });

        expect(schema.codeString).toBe("z.object({}).partial().passthrough()");
    });

    test("additional properties opt-out", () => {
        const additionalPropertiesOptOut = getZodSchema({
            schema: {
                type: "object",
                additionalProperties: false,
            },
        });

        expect(additionalPropertiesOptOut.codeString).toBe("z.object({}).partial()");
    });

    test("object with some properties", () => {
        const schema = getZodSchema({
            schema: {
                type: "object",
                properties: {
                    foo: { type: "string" },
                    bar: { type: "number" },
                },
            },
        });

        expect(schema.codeString).toBe(
            "z.object({ foo: z.string(), bar: z.number() }).partial().passthrough()"
        );
    });
});