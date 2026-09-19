import type {
    BuySharesRequest,
    InvestmentWithdrawalRequest,
    RedeemInvestmentRequest,
    ReinvestDividendsRequest,
    ShareExitRequest,
} from '../../src/services/investment/investmentService';

const buy: BuySharesRequest = { qty: 2, pin: '1234' };
const exit: ShareExitRequest = { qty: 1, pin: '1234' };
const reinvest: ReinvestDividendsRequest = { qty: 1, pin: '1234' };
const redeem: RedeemInvestmentRequest = { amount: 500, source: 'dividend', pin: '1234' };
const withdraw: InvestmentWithdrawalRequest = {
    amount: 500,
    source: 'referral',
    bankName: 'Test Bank',
    accountNumber: '0123456789',
    accountName: 'Test User',
    pin: '1234',
};

void [buy, exit, reinvest, redeem, withdraw];

// @ts-expect-error Protected internal purchases must require a transaction PIN.
const buyWithoutPin: BuySharesRequest = { qty: 2 };
// @ts-expect-error Protected withdrawals must require a transaction PIN.
const withdrawalWithoutPin: InvestmentWithdrawalRequest = {
    amount: 500,
    source: 'dividend',
    bankName: 'Test Bank',
    accountNumber: '0123456789',
    accountName: 'Test User',
};

void [buyWithoutPin, withdrawalWithoutPin];
