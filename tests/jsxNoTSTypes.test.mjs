import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// ---------------------------------------------------------------------------
// Regression guard: .jsx files are compiled with esbuild's `jsx` loader, which
// strips NO TypeScript. syntax like `useState<any>(null)` silently degrades to
// the comparison `useState < any > null`, producing `ReferenceError: any is
// not defined` at runtime (production outage, commit 10443df).
// Every .jsx file MUST be plain JSX — no TS generics, annotations, or casts.
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '..', 'src');

const requireCjs = createRequire(import.meta.url);
let esbuild = null;
try {
    esbuild = requireCjs('esbuild');
} catch {
    // esbuild not resolvable — tests below will fail loudly instead of skipping.
}

function findJsxFiles(dir) {
    const results = [];
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) {
            if (name === 'node_modules' || name === 'dist' || name === 'coverage') continue;
            results.push(...findJsxFiles(full));
        } else if (extname(name) === '.jsx') {
            results.push(full);
        }
    }
    return results;
}

const jsxFiles = findJsxFiles(srcDir);
assert.ok(jsxFiles.length > 0, `expected to find .jsx files under ${srcDir}`);

// Source-level check: TS built-in type keywords used as generic type arguments
// or type annotations are invalid in a .jsx file and will degrade or error.
const TS_SOURCE_RE =
    /<\s*(any|string|number|boolean|object|unknown|void|never|Record|Promise|Array)\b|:\s*(any|string|number|boolean|unknown|void|never)\s*(,|\}|\)|=)/;

// Post-transform check: esbuild's `jsx` loader preserves `<T>` comparisons
// verbatim (identifier `ident<T>`), so `any`/`string`/... appear as free
// identifiers instead of index/object keys.
const DEGRADED_TS_RE = /[A-Za-z_$][A-Za-z0-9_$]*<\s*(any|string|number|boolean|unknown|void|never|Record|Promise|Array)\b/;

test('jsx-no-ts: esbuild must be resolvable to run the guard', () => {
    assert.ok(esbuild, 'esbuild not resolvable from vtu-web; cannot verify .jsx compilation');
});

for (const file of jsxFiles) {
    const rel = relative(srcDir, file);
    const source = readFileSync(file, 'utf8');

    test(`jsx-no-ts: ${rel} has no TS type syntax in source`, () => {
        assert.ok(
            !TS_SOURCE_RE.test(source),
            `${rel} contains TypeScript type syntax (generics/annotations). esbuild's jsx loader will not strip it — move this file to .tsx`
        );
    });

    test(`jsx-no-ts: ${rel} compiles to JS with no degraded TS type identifiers`, async () => {
        const result = await esbuild.transform(source, { loader: 'jsx', format: 'esm' });
        const degraded = result.code.match(DEGRADED_TS_RE);
        assert.ok(
            !degraded,
            `${rel} compiled to \`${degraded ? degraded[0] : ''}\` — a comparison expression reading bare TS type identifiers. Use .tsx instead`
        );
    });
}