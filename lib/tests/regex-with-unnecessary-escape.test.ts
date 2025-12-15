import { getZodSchema } from "../src/openApiToZod.ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

test("regex-with-unnecessary-escape fails", async (t) => {
    // This is what it should produce, but to prioritize escaping forward slashes without an unnecessary escape,
    // we leave this is failing for now.
    // '"z.object({ str: z.string().regex(/^\\/\\/$/) }).partial().passthrough()"'
    await assertSnapshot(t, getZodSchema({schema: {
            type: "object",
            properties: {
                str: { 
                    type: "string",
                    pattern: "^\\/$"
                },
            }
        }}));
});
