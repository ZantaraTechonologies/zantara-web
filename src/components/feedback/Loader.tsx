// src/components/Loader.tsx
import React from "react";

export default function Loader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-blue-600 font-semibold text-lg">Loading, please wait...</p>
        </div>
    );
}
