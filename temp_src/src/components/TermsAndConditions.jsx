import React from "react";

const TermsAndConditions = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-800">1. Introduction</h2>
                    <p>
                        **DahaTech** provides a collection of online services, including data bundles, airtime, bill payments, and more. By using our services, you agree to the following Terms and Conditions ("Agreement").
                    </p>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-800">2. User Responsibilities</h2>
                    <p>
                        You agree not to engage in fraudulent transactions, create multiple accounts, or post harmful content.
                    </p>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-800">3. Privacy and Data Protection</h2>
                    <p>
                        By using our services, you agree to the collection and processing of your personal data as described in our Privacy Policy.
                    </p>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-800">4. Limitation of Liability</h2>
                    <p>
                        **DahaTech** is not liable for any damages caused by service interruptions, system errors, or other unforeseen issues.
                    </p>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-800">5. Dispute Resolution</h2>
                    <p>
                        Any disputes will be governed by the laws of Nigeria and resolved through arbitration.
                    </p>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-800">6. Contact Information</h2>
                    <p>
                        For any questions or concerns, you can contact us at support@dahatech.ng or call +234 800 000 0000.
                    </p>
                </section>

                <footer className="mt-8 text-center text-gray-500">
                    <p>Last updated: March 2023</p>
                </footer>
            </div>
        </div>
    );
};

export default TermsAndConditions;