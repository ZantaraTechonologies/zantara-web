// Funding-return banner copy, isolated in a pure TS module so it can be
// unit-tested without rendering React.
//
// Truthfulness contract (notification-hardening audit):
//   - A `?funded=` query parameter is NEVER an authority. The success banner
//     must not claim "your wallet has been credited"; only the backend verify
//     result and the fetched balance are authoritative.
//   - The success banner therefore reports that payment details were received
//     and that the wallet credit is being confirmed / shown in the balance.

export const FUNDED_SUCCESS_TEXT =
    'Payment details received — confirming your wallet credit. Your current balance is shown below.';

export const FUNDED_FAILED_TEXT =
    'Payment could not be verified. If funds were deducted, contact support.';