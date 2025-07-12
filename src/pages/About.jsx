// 📄 About.jsx – VoxaMail Legal & Info Page
import React from "react";
import Navbar from "../components/Navbar";

const About = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      <div className="px-6 py-10 max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">About VoxaMail</h1>
          <p className="text-gray-500 text-sm">Your Gmail. Smarter. Safer. Simpler.</p>
        </header>

        <nav className="flex justify-center gap-6 mb-8 text-sm text-indigo-600 font-medium underline">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Use</a>
          <a href="#contact">Contact</a>
        </nav>

        <section id="privacy" className="space-y-2 mb-10">
          <h2 className="text-2xl font-semibold text-indigo-600">🔐 Privacy Policy</h2>
          <p>
            VoxaMail uses secure Google OAuth authentication to access your Gmail account only with your explicit consent. 
            We do <strong>not</strong> store, sell, or share your personal data or email content. 
            All actions (reading, sending, managing emails) happen securely and only when you initiate them.
          </p>
          <p>
            You can revoke our access anytime from your <a href="https://myaccount.google.com/permissions" target="_blank" className="underline text-blue-600">Google account permissions</a> page.
          </p>
        </section>

        <section id="terms" className="space-y-2 mb-10">
          <h2 className="text-2xl font-semibold text-indigo-600">📄 Terms of Use</h2>
          <p>
            VoxaMail is provided “as-is” as a productivity tool. By using the app, you agree to:
          </p>
          <ul className="list-disc list-inside ml-4 text-sm text-gray-700">
            <li>Use VoxaMail responsibly and ethically.</li>
            <li>Allow access to your Gmail only for personal automation purposes.</li>
            <li>Acknowledge that VoxaMail does not assume liability for misuse or data loss.</li>
          </ul>
        </section>

        <section id="contact" className="space-y-2">
          <h2 className="text-2xl font-semibold text-indigo-600">📬 Contact</h2>
          <p>
            For support, feedback, or partnership inquiries, email us at:
          </p>
          <p className="font-medium text-indigo-700">voxa.team@gmail.com</p>
        </section>
      </div>

      <footer className="text-center text-xs text-gray-400 pb-6 mt-10">
        &copy; {new Date().getFullYear()} VoxaMail. All rights reserved.
      </footer>
    </div>
  );
};

export default About;
