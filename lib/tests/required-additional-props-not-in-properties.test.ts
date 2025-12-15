import { getZodSchema } from "../src/openApiToZod.ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

test("required-additional-props-not-in-properties", async (t) => {
    const result = getZodSchema({
        schema: {
            properties: {
                name: {
                    type: "string"
                },
                email: {
                    type: "string"
                },
            },
            required: ['name', 'email', 'phone'],
        },
    });
    await assertSnapshot(t, result);
});
