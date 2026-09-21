import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const receiptPage = readFileSync(join(root, 'src', 'pages', 'user', 'ReceiptPage.tsx'), 'utf8');

test('receipt continues to pass all public site settings into the canonical receipt model', () => {
    assert.match(receiptPage, /displayName:\s*settings\.SITE_NAME/);
    assert.match(receiptPage, /logo:\s*settings\.SITE_LOGO/);
    assert.match(receiptPage, /supportEmail:\s*settings\.SUPPORT_EMAIL/);
    assert.match(receiptPage, /supportPhone:\s*settings\.SUPPORT_PHONE/);
    assert.match(receiptPage, /website:\s*settings\.SITE_URL/);
    assert.match(receiptPage, /<SiteLogo\s+src=\{brand\.logo\}\s+siteName=\{brand\.displayName\}/);
});
