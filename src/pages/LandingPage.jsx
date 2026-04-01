import React from "react";
import Navbar from "../components/navigation/Navbar";
import Footer from "../components/common/Footer";

// Homepage Sections
import HeroSection from "../components/landing/HeroSection";
import ServicesGrid from "../components/landing/ServicesGrid";
import WhyChooseUs from "../components/landing/WhyChooseUs";
import HowItWorks from "../components/landing/HowItWorks";
import ReferralPromo from "../components/landing/ReferralPromo";
import SecurityTrust from "../components/landing/SecurityTrust";
import FinalCTA from "../components/landing/FinalCTA";

export default function ZantaraLanding() {
    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans overflow-x-hidden">
            {/* Global Navbar */}
            <Navbar />

            {/* 1. Hero Section */}
            <HeroSection />

            {/* 2. Services Overview Section */}
            <ServicesGrid />

            {/* 3. Why Choose Zantara Section */}
            <WhyChooseUs />

            {/* 4. How It Works Section */}
            <HowItWorks />

            {/* 5. Referral / Rewards Highlight */}
            <ReferralPromo />

            {/* 6. Security / Trust / Compliance Section */}
            <SecurityTrust />

            {/* 7. Final CTA Section */}
            <FinalCTA />

            {/* 8. Global Footer */}
            <Footer />
        </div>
    );
}
