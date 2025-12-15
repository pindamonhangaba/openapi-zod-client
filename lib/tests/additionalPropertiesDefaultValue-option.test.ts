import { getZodSchema } from "../src/openApiToZod.ts";
import { test } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

test("additionalPropertiesDefaultValue-option", async (t) => {
    await assertSnapshot(t,
        getZodSchema({
            schema: {
                type: "object",
                properties: {
                    str: { type: "string" },
                },
            },
        })
    );
    await assertSnapshot(t,
        getZodSchema({
            schema: {
                type: "object",
                properties: {
                    str: { type: "string" },
                },
            },
            options: {
                additionalPropertiesDefaultValue: true
            }
        })
    );
    await assertSnapshot(t,
        getZodSchema({
            schema: {
                type: "object",
                properties: {
                    str: { type: "string" },
                },
            },
            options: {
                additionalPropertiesDefaultValue: { type: "number" }
            }
        })
    );
    await assertSnapshot(t,
        getZodSchema({
            schema: {
                type: "object",
                properties: {
                    str: { type: "string" },
                },
            },
            options: {
                additionalPropertiesDefaultValue: false
            }
        })
    );
});
