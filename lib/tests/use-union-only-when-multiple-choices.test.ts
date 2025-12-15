import { getZodSchema } from "../src/openApiToZod.ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

test("use-union-only-when-multiple-choices", async (t) => {
    const result = getZodSchema({
        schema: {
            type: "object",
            properties: {
                singleOneOf: { oneOf: [{ type: "string" }] },
                multipleOneOf: { oneOf: [{ type: "string" }, { type: "number" }] },
                //
                singleAnyOf: { anyOf: [{ type: "string" }] },
                multipleAnyOf: { anyOf: [{ type: "string" }, { type: "number" }] },
                //
                singleAllOf: { allOf: [{ type: "string" }] },
                multipleAllOf: { allOf: [{ type: "string" }, { type: "number" }] },
            },
        },
    });
    await assertSnapshot(t, result);
});
