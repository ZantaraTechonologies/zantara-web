import React from "react";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-800">1. Introduction</h2>
                    <p>
                        **DahaTech** is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal data.
                    </p>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-800">2. Information We Collect</h2>
                    <p>
                        We collect personal information such as your name, email address, phone number, billing information, and transaction data.
                    </p>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-800">3. Data Usage</h2>
                    <p>
                        Your data is used to process payments, communicate with you about services, and improve your experience.
                    </p>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-800">4. Data Retention</h2>
                    <p>
                        We retain your data for as long as necessary to provide services or as required by law.
                    </p>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-800">5. User Rights</h2>
                    <p>
                        You have the right to access, correct, and delete your data. You can also opt-out of marketing communications at any time.
                    </p>
                </section>

                <section className="mt-6">
                    <h2 className="text-2xl font-semibold text-gray-800">6. Data Security</h2>
                    <p>
                        We implement strong security measures to protect your data, but we cannot guarantee 100% security.
                    </p>
                </section>

                <footer className="mt-8 text-center text-gray-500">
                    <p>Last updated: March 2023</p>
                </footer>
            </div>
        </div>
    );
};

export default PrivacyPolicy;