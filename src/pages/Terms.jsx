// ✅ TermsPage.jsx
import React from "react";

export default function TermsPage() {
  return (
    <div className="min-h-screen px-8 py-16 bg-gray-50 text-gray-800">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-700">Terms of Service</h1>

        <p className="mb-4 text-sm text-gray-600">
          Last updated: July 3, 2025
        </p>

        <p className="mb-6">
          By using VoxaMail, you agree to comply with and be bound by the following terms and conditions of use. These terms govern your access to and use of our AI-powered Gmail assistant services.
        </p>

        <h2 className="text-xl font-semibold mb-2">1. Use of Service</h2>
        <p className="mb-6">
          You may use VoxaMail only for lawful purposes and in accordance with these Terms. You agree not to misuse our service to send spam, abuse the AI functionality, or violate Gmail's usage policy.
        </p>

        <h2 className="text-xl font-semibold mb-2">2. User Authentication</h2>
        <p className="mb-6">
          You are responsible for maintaining the confidentiality of your authentication credentials and are fully responsible for all activities that occur under your account.
        </p>

        <h2 className="text-xl font-semibold mb-2">3. Privacy and Data</h2>
        <p className="mb-6">
          VoxaMail processes your Gmail content securely and never shares your data with third parties. Refer to our Privacy Policy for more details.
        </p>

        <h2 className="text-xl font-semibold mb-2">4. Intellectual Property</h2>
        <p className="mb-6">
          All intellectual property related to VoxaMail, including code, design, and AI systems, are owned by the creators. Users may not reproduce, copy, or distribute any part of the platform.
        </p>

        <h2 className="text-xl font-semibold mb-2">5. Changes to Terms</h2>
        <p className="mb-6">
          We may update these Terms from time to time. Continued use of VoxaMail after any changes indicates acceptance of the new terms.
        </p>

        <p className="mt-10 text-sm text-gray-500">
          If you have any questions about these Terms, please contact us via the feedback section on the home page.
        </p>
      </div>
    </div>
  );
}