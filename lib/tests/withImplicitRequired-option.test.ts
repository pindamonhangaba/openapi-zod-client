import { getZodSchema } from "../src/openApiToZod.ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

test("withImplicitRequired-option", async (t) => {
    const result1 = getZodSchema({
        schema: {
            type: "object",
            properties: {
                str: { type: "string" },
                nested: {
                    additionalProperties: { type: "number" },
                },
            },
        },
    });
    await assertSnapshot(t, result1);
    
    const result2 = getZodSchema({
        schema: {
            type: "object",
            properties: {
                str: { type: "string" },
                nested: {
                    additionalProperties: { type: "number" },
                },
            },
        },
        options: {
            withImplicitRequiredProps: true,
        },
    });
    await assertSnapshot(t, result2);
});
