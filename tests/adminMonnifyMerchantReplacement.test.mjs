import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => readFileSync(join(root, relative), 'utf8');

test('SuperAdmin Monnify replacement uses dedicated confirmed endpoints', () => {
    const service = read('src/services/admin/adminPaymentGatewayService.ts');
    const page = read('src/pages/admin/finance/AdminPaymentGatewaysPage.tsx');

    assert.match(service, /replace-monnify-merchant/);
    assert.match(service, /confirmation: 'replace-monnify-merchant'/);
    assert.match(service, /test-monnify-checkout/);
    assert.match(page, /Current SuperAdmin Password/);
    assert.match(page, /intentional merchant replacement/);
    assert.match(page, /without changing the current default gateway/);
    assert.match(page, /replacement remains inactive/);
    assert.match(page, /isTrustedHostedCheckoutUrl\(result\.authorizationUrl \|\| '', 'monnify', 'sandbox\.monnify\.com'\)/);
    assert.match(page, /rel="noopener noreferrer"/);
    assert.match(page, /PAYMENT_INITIALIZATION_AMBIGUOUS/);
    assert.match(page, /Do not retry this checkout/);
    assert.match(page, /Checkout was initialized with an unsafe response\. Do not retry/);
    assert.match(page, /The checkout response was lost\. Do not retry/);
    assert.match(page, /emptyReplacementCredentials/);
});

test('normal wallet funding remains amount-only with no gateway test override', () => {
    const wallet = read('src/services/wallet/walletService.ts');
    assert.match(wallet, /API\.post\("\/wallet\/fund", \{ amount \}\)/);
    assert.doesNotMatch(
        wallet.slice(wallet.indexOf('export async function initWalletFunding')),
        /gatewayCode\s*:/,
    );
});
