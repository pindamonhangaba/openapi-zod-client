import { getZodSchema } from "../src/openApiToZod.ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

test("kebab-case-in-props", async (t) => {
    const result = getZodSchema({
        schema: {
            type: "object",
            properties: {
                lowercase: { type: "string" },
                "kebab-case": { type: "number" },
            },
        },
    });
    await assertSnapshot(t, result);
});
