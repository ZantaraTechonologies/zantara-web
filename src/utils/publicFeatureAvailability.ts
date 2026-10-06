// Temporary compliance hold while the Monnify KYC review is in progress.
export const PUBLIC_SHAREHOLDING_KYC_HOLD = true;

export const isPublicShareholdingAvailable = (investmentEnabled?: boolean): boolean =>
    !PUBLIC_SHAREHOLDING_KYC_HOLD && investmentEnabled === true;
