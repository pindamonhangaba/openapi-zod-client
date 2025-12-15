import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIObject } from "openapi3-ts";
import * as path from "@std/path";
import { getZodiosEndpointDefinitionList } from "../src/index.ts";
import { test } from "jsr:@std/testing/bdd";
import { assertSnapshot } from "jsr:@std/testing/snapshot";

test("ref-in-another-file", async (t) => {
    const openApiDoc = (await SwaggerParser.bundle(
        path.join(path.dirname(path.fromFileUrl(import.meta.url)), "ref-in-another-file", "partial.yaml")
    )) as OpenAPIObject;
    const endpoints = getZodiosEndpointDefinitionList(openApiDoc);
    await assertSnapshot(t, endpoints);
});