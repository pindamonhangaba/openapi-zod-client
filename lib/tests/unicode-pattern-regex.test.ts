import { getZodSchema } from "../src/index.ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { getZodChain } from "../src/openApiToZod.ts";
import { SchemaObject } from "openapi3-ts";

test("unicode-pattern-regex", async (t) => {
    const schema: SchemaObject = {
        type: "string",
        pattern: "\\p{L}+",
    };
    const schemaWithSlashes: SchemaObject = {
        type: "string",
        pattern: "/\\p{L}+/",
    };
    const schemaWithComplexUnicodePattern: SchemaObject = {
        type: "string",
        pattern: "$|^[\\p{L}\\d]+[\\p{L}\\d\\s.&()\\*'',-;#]*|$",
    };
    const schemaWithSlashU: SchemaObject = {
        type: "string",
        pattern: "\\u{1F600}+",
    }
    
    const result1 = getZodSchema({ schema: schema }) + getZodChain({ schema });
    await assertSnapshot(t, result1);
    
    const result2 = getZodSchema({ schema: schemaWithSlashes }) + getZodChain({ schema: schemaWithSlashes });
    await assertSnapshot(t, result2);
    
    const result3 = getZodSchema({ schema: schemaWithComplexUnicodePattern }) + getZodChain({ schema: schemaWithComplexUnicodePattern });
    await assertSnapshot(t, result3);
    
    const result4 = getZodSchema({ schema: schemaWithSlashU }) + getZodChain({ schema: schemaWithSlashU });
    await assertSnapshot(t, result4);
});
