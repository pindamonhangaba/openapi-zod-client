import { getZodSchema } from "../src/openApiToZod.ts";
import { test } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

test("infer-as-object-when-only-properties-set", async (t) => {
    const result = getZodSchema({
        schema: {
            properties: {
                str: { type: "string" },
                nested: {
                    additionalProperties: { type: "number" },
                },
            },
        },
    });
    await assertSnapshot(t, result);
});
