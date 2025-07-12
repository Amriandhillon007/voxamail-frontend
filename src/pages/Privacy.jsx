import React from 'react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 px-6 py-12 flex items-center justify-center">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-3xl w-full border border-gray-200">
        <h1 className="text-4xl font-bold text-blue-700 mb-6">Privacy Policy</h1>

        <p className="text-gray-700 leading-relaxed">
          VoxaMail is committed to safeguarding your privacy. This Privacy Policy outlines how
          we handle your data, including your email content, voice interactions, and account
          information. Our goal is simple: enable powerful automation without compromising trust.
        </p>

        <h2 className="mt-6 text-xl font-semibold text-gray-800">What We Access</h2>
        <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
          <li>Your Gmail inbox content (read-only, when authorized)</li>
          <li>Your voice commands and transcription requests</li>
          <li>Your email address for identity verification</li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold text-gray-800">What We Don’t Do</h2>
        <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
          <li>We never store your email data on our servers</li>
          <li>We do not sell or share your personal data</li>
          <li>We do not access your Gmail unless explicitly authorized</li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold text-gray-800">Your Control</h2>
        <p className="text-gray-700 mt-2">
          You may revoke Gmail access or delete your session data anytime. VoxaMail ensures full
          transparency in how your information is used and offers in-app controls to manage access.
        </p>

        <h2 className="mt-6 text-xl font-semibold text-gray-800">Third-Party Services</h2>
        <p className="text-gray-700 mt-2">
          We may use third-party providers (e.g. Google APIs, Azure TTS) to deliver features,
          but your data is never shared beyond the purpose of delivering core functionality.
        </p>

        <p className="text-xs text-gray-400 mt-10">
          You can update this policy in <code>pages/Privacy.jsx</code>.
        </p>
      </div>
    </div>
  );
}
