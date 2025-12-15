# Publishing to JSR

This package has been converted from a pnpm monorepo to a Deno package for publishing to JSR.

## Prerequisites

1. Ensure you have Deno installed
2. Have a JSR account and are logged in via `deno publish --dry-run` first

## Steps to Publish

1. **Test the CLI locally**:
   ```bash
   deno task cli --help
   deno task cli samples/v3.0/petstore.yaml -o output/test.ts
   ```

2. **Check the package**:
   ```bash
   deno publish --dry-run
   ```
   This will show you what will be published and check for any issues.

3. **Publish to JSR**:
   ```bash
   deno publish
   ```

## What's Included

The JSR package includes:
- `cli.ts` - The main CLI entry point
- `lib/src/**/*.ts` - All source files (excluding tests)
- `lib/src/templates/**/*.hbs` - Handlebars templates
- `README.md` - Documentation
- `deno.json` - Package configuration

## Changes Made for Deno Compatibility

1. **Updated imports**: All relative imports now include `.ts` extensions
2. **Node.js APIs replaced**: 
   - `node:fs` → `Deno.readTextFile()` / `Deno.writeTextFile()`
   - `node:path` → `@std/path`
   - `@liuli-util/fs-extra` → `@std/fs` (ensureDir)
3. **Fixed npm package imports**: 
   - `handlebars` - Changed to default import
   - `whence` - Changed to default import with `.sync()` method
4. **Added npm: specifiers**: All npm dependencies are mapped in `deno.json` imports

## Testing Before Publishing

Run the CLI against various OpenAPI samples:
```bash
deno task cli samples/v3.0/petstore.yaml -o output/petstore.ts
deno task cli samples/v3.1/your-spec.yaml -o output/your-spec.ts
```
