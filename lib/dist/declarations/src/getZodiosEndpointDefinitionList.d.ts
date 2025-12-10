import type { ZodiosEndpointDefinition } from "@franklin-ai/zodios";
import type { OpenAPIObject } from "openapi3-ts";
import type { TemplateContext } from "./template-context.js";
export declare const getZodiosEndpointDefinitionList: (doc: OpenAPIObject, options?: TemplateContext["options"]) => {
    endpoints: EndpointDefinitionWithRefs[];
    issues: {
        ignoredFallbackResponse: string[];
        ignoredGenericError: string[];
    };
    refsDependencyGraph: Record<string, Set<string>>;
    deepDependencyGraph: Record<string, Set<string>>;
    resolver: import("./makeSchemaResolver.js").DocumentResolver;
    zodSchemaByName: Record<string, string>;
    schemaByName: Record<string, string>;
    schemasByName: Record<string, string[]>;
};
export type EndpointDefinitionWithRefs = Omit<ZodiosEndpointDefinition<any>, "response" | "parameters" | "errors" | "description"> & {
    response: string;
    description?: string | undefined;
    parameters: Array<Omit<Required<ZodiosEndpointDefinition<any>>["parameters"][number], "schema"> & {
        schema: string;
    }>;
    errors: Array<Omit<Required<ZodiosEndpointDefinition<any>>["errors"][number], "schema"> & {
        schema: string;
    }>;
    responses?: Array<{
        statusCode: string;
        schema: string;
        description?: string;
    }>;
};
