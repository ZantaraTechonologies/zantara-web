import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  isPublicShareholdingAvailable,
  isPublicWalletWithdrawalAvailable,
  PUBLIC_SHAREHOLDING_KYC_HOLD,
  PUBLIC_WALLET_WITHDRAWAL_KYC_HOLD,
} from '../src/utils/publicFeatureAvailability.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readSource = (...parts) => readFileSync(join(root, 'src', ...parts), 'utf8');

test('Monnify KYC hold disables public shareholding even when the backend setting is enabled', () => {
  assert.equal(PUBLIC_SHAREHOLDING_KYC_HOLD, true);
  assert.equal(isPublicShareholdingAvailable(true), false);
  assert.equal(isPublicShareholdingAvailable(false), false);
});

test('Monnify KYC hold disables public wallet withdrawal', () => {
  assert.equal(PUBLIC_WALLET_WITHDRAWAL_KYC_HOLD, true);
  assert.equal(isPublicWalletWithdrawalAvailable(), false);
});

test('public shareholding and wallet withdrawal routes are guarded', () => {
  const routes = readSource('routes', 'AppRoutes.jsx');

  assert.match(routes, /path="investments" element={<PublicShareholdingRoute><InvestmentPage \/><\/PublicShareholdingRoute>}/);
  assert.match(routes, /path="investments\/withdraw" element={<PublicShareholdingRoute><InvestmentWithdrawPage \/><\/PublicShareholdingRoute>}/);
  assert.match(routes, /return isAvailable \? children : <Navigate to="\/app" replace \/>/);
  assert.match(routes, /isPublicWalletWithdrawalAvailable\(\) \? children : <Navigate to="\/app" replace \/>/);
  assert.match(routes, /path="wallet\/withdraw" element={<PublicWalletWithdrawalRoute><UserWithdrawPage \/><\/PublicWalletWithdrawalRoute>}/);
});

test('wallet withdrawal navigation is hidden while wallet funding and VTU routes remain available', () => {
  const dashboard = readSource('pages', 'user', 'UserDashboardPage.tsx');
  const routes = readSource('routes', 'AppRoutes.jsx');

  assert.match(dashboard, /walletWithdrawalAvailable && \(\s*<Link to="\/app\/wallet\/withdraw"/);
  assert.match(routes, /path="wallet\/fund" element={<UserFundWalletPage \/>}/);
  assert.match(routes, /path="wallet\/linked-accounts" element={<UserLinkedAccountsPage \/>}/);
  assert.match(routes, /path="wallet\/virtual-account" element={<UserVirtualAccountPage \/>}/);
  assert.match(routes, /path="services" element={<ServicesPage \/>}/);
  for (const service of ['data', 'broadband', 'airtime', 'electricity', 'cable', 'exam-pins']) {
    assert.match(routes, new RegExp(`path="services\\/${service}"`));
  }
});

test('public navigation is availability-gated and admin shareholder access remains routed', () => {
  const navbar = readSource('components', 'navigation', 'Navbar.jsx');
  const dashboardLayout = readSource('layouts', 'user', 'DashboardLayout.jsx');
  const routes = readSource('routes', 'AppRoutes.jsx');
  const investmentHook = readSource('hooks', 'useInvestment.ts');

  assert.match(navbar, /isPublicShareholdingAvailable &&/);
  assert.match(dashboardLayout, /isPublicShareholdingAvailable/);
  assert.match(investmentHook, /summary\.data\?\.settings\?\.investmentEnabled/);
  assert.match(routes, /path="shareholders" element={<AdminShareholdersPage \/>}/);
});
