import { getZodClientTemplateContext } from "../src/index.ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

test("handle-refs-without-var-name", async (t) => {
    const result = getZodClientTemplateContext({
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/something": {
                get: {
                    operationId: "getSomething",
                    responses: {
                        "200": {
                            content: {
                                "application/json": {
                                    schema: { type: "array", items: { $ref: "#/components/schemas/Basic" } },
                                },
                            },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                Basic: { type: "object" },
            },
        },
    });
    await assertSnapshot(t, result);
});
