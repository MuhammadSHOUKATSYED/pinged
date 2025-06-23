'use client';

export default function HelpAndPrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-gray-800 dark:text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Help & Privacy Policy</h1>

      {/* Help Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Help & Support</h2>
        <p className="mb-4">
          Pinged is designed to help you connect and chat with others seamlessly. If you experience issues such as:
        </p>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Messages not sending or loading</li>
          <li>Profile updates not saving</li>
          <li>Follow/Unfollow features not working</li>
        </ul>
        <p>
          Please contact us at <a href="mailto:support@pinged.app" className="text-blue-600 underline">support@pinged.app</a>
        </p>
      </section>

      {/* Privacy Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Privacy Policy</h2>
        <p className="mb-4">
          At Pinged, your privacy is important to us. Here's how we handle your data:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Data Collection:</strong> We collect basic profile information, messages, and activity logs to operate the app.</li>
          <li><strong>Storage:</strong> Your data is securely stored and never sold to third parties.</li>
          <li><strong>Usage:</strong> Data is used solely to improve your experience and ensure app functionality.</li>
          <li><strong>Security:</strong> All user data is encrypted both in transit and at rest.</li>
        </ul>
        <p className="mt-4">
          By using Pinged, you agree to this privacy policy. If you have any concerns, please reach out to us directly.
        </p>
      </section>
    </div>
  );
}
