import type { OpenAPIObject } from "openapi3-ts";
import { test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { generateZodClientFromOpenAPI } from "../src/index.ts";

// https://github.com/astahmer/openapi-zod-client/issues/49
test("missing-zod-chains-on-z-object-with-refs-props", async (t) => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.0",
        info: { title: "Schema test", version: "1.0.0" },
        paths: {
            "/user/add": {
                post: {
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/AddUser" } } },
                    },
                    responses: { "200": { description: "foo" } },
                },
            },
            "/user/recover": {
                post: {
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: "#/components/schemas/PasswordReminder" } } },
                    },
                    responses: { "200": { description: "bar" } },
                },
            },
        },
        components: {
            schemas: {
                Password: { type: "string", pattern: "/(PasswordRegex)/", minLength: 16, maxLength: 255 },
                Email: { type: "string", pattern: "/(EmailRegex)/", minLength: 6, maxLength: 255 },
                AddUser: {
                    required: ["email", "password"],
                    properties: {
                        email: { $ref: "#/components/schemas/Email" },
                        password: { $ref: "#/components/schemas/Password" },
                    },
                },
                PasswordReminder: {
                    required: ["email"],
                    properties: { email: { $ref: "#/components/schemas/Email" } },
                },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    await assertSnapshot(t, output);
});
