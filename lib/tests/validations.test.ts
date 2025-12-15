import { getZodSchema } from "../src/openApiToZod.ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

test("validations", async (t) => {
    const result = getZodSchema({
        schema: {
            type: "object",
            properties: {
                str: { type: "string" },
                strWithLength: { type: "string", minLength: 3, maxLength: 3 },
                strWithMin: { type: "string", minLength: 3 },
                strWithMax: { type: "string", maxLength: 3 },
                strWithPattern: { type: "string", pattern: "/^[a-z]+$/" },
                strWithPatternWithSlash: { type: "string", pattern: "/abc/def/ghi/" },
                email: { type: "string", format: "email" },
                hostname: { type: "string", format: "hostname" },
                url: { type: "string", format: "uri" },
                uuid: { type: "string", format: "uuid" },
                //
                number: { type: "number" },
                int: { type: "integer" },
                intWithMin: { type: "integer", minimum: 3 },
                intWithMax: { type: "integer", maximum: 3 },
                intWithMinAndMax: { type: "integer", minimum: 3, maximum: 3 },
                intWithExclusiveMinTrue: { type: "integer", minimum: 3, exclusiveMinimum: true },
                intWithExclusiveMinFalse: { type: "integer", minimum: 3, exclusiveMinimum: false },
                intWithExclusiveMin: { type: "integer", exclusiveMinimum: 3 },
                intWithExclusiveMaxTrue: { type: "integer", maximum: 3, exclusiveMaximum: true },
                intWithExclusiveMaxFalse: { type: "integer", maximum: 3, exclusiveMaximum: false },
                intWithExclusiveMax: { type: "integer", exclusiveMaximum: 3 },
                intWithMultipleOf: { type: "integer", multipleOf: 3 },
                //
                bool: { type: "boolean" },
                //
                array: { type: "array", items: { type: "string" } },
                arrayWithMin: { type: "array", items: { type: "string" }, minItems: 3 },
                arrayWithMax: { type: "array", items: { type: "string" }, maxItems: 3 },
                arrayWithFormat: { type: "array", items: { type: "string", format: "uuid" } },
                // TODO ?
                // arrayWithUnique: { type: "array", items: { type: "string" }, uniqueItems: true },
                //
                object: { type: "object", properties: { str: { type: "string" } } },
                objectWithRequired: { type: "object", properties: { str: { type: "string" } }, required: ["str"] },
                // TODO ?
                // objectWithMin: { type: "object", properties: { str: { type: "string" } }, minProperties: 3 },
                // objectWithMax: { type: "object", properties: { str: { type: "string" } }, maxProperties: 3 },
                //
                oneOf: { oneOf: [{ type: "string" }, { type: "number" }] },
                anyOf: { anyOf: [{ type: "string" }, { type: "number" }] },
                allOf: { allOf: [{ type: "string" }, { type: "number" }] },
                nested: {
                    additionalProperties: { type: "number" },
                },
                nestedNullable: {
                    additionalProperties: { type: "number", nullable: true },
                },
            },
        },
        options: {
            withImplicitRequiredProps: true,
        },
    });
    await assertSnapshot(t, result);
});
