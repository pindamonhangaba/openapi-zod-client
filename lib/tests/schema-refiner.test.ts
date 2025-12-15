import { isReferenceObject } from "openapi3-ts";
import { getZodSchema } from "../src/openApiToZod.ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

test("schema-refiner", async (t) => {
    const result = getZodSchema({
        schema: {
            properties: {
                name: {
                    type: "string",
                },
                email: {
                    type: "string",
                },
            },
        },
        options: {
            schemaRefiner(schema) {
                if (isReferenceObject(schema) || !schema.properties) {
                    return schema;
                }

                if (!schema.required && schema.properties) {
                    for (const key in schema.properties) {
                        const prop = schema.properties[key];

                        if (!isReferenceObject(prop)) {
                            prop.nullable = true;
                        }
                    }
                }

                return schema;
            },
        },
    });
    await assertSnapshot(t, result);
});
