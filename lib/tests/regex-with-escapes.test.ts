import { getZodSchema } from "../src/openApiToZod.ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

test("regex-with-escapes", async (t) => {
    await assertSnapshot(t, getZodSchema({schema: {
            type: "object",
            properties: {
                str: { 
                    type: "string",
                    pattern: "^/$"
                },
            }
        }}));
});
