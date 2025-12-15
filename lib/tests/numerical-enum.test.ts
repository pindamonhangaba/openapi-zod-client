import type { OpenAPIObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { generateZodClientFromOpenAPI } from "../src/index.ts";

// https://github.com/astahmer/openapi-zod-client/issues/49
test("numerical-enum-support", async (t) => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "Numerical enums",
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
                            },
                        },
                        {
                            in: "query",
                            name: "bar",
                            schema: {
                                type: "number",
                                enum: [1.2, 34, -56.789],
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
