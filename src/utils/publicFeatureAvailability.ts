// Temporary compliance hold while the Monnify KYC review is in progress.
export const PUBLIC_SHAREHOLDING_KYC_HOLD = true;
export const PUBLIC_WALLET_WITHDRAWAL_KYC_HOLD = true;

export const isPublicShareholdingAvailable = (investmentEnabled?: boolean): boolean =>
    !PUBLIC_SHAREHOLDING_KYC_HOLD && investmentEnabled === true;

export const isPublicWalletWithdrawalAvailable = (): boolean =>
    !PUBLIC_WALLET_WITHDRAWAL_KYC_HOLD;
