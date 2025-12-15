import type { OpenAPIObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { generateZodClientFromOpenAPI } from "../src/index.ts";

// https://github.com/astahmer/openapi-zod-client/issues/61
test("enum-min-max", async (t) => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "enums min max",
        },
        paths: {
            "/sample": {
                get: {
                    parameters: [
                        {
                            in: "query",
                            name: "foo",
                            schema: {
                                type: "integer",
                                enum: [1, -2, 3],
                                minimum: 4,
                                maximum: 10,
                            },
                        },
                        {
                            in: "query",
                            name: "bar",
                            schema: {
                                type: "string",
                                enum: ["Dogs", "Cats", "Mice"],
                                minLength: 4,
                            },
                        },
                    ],
                    responses: {
                        "200": {
                            description: "resoponse",
                        },
                    },
                },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    await assertSnapshot(t, output);
});
