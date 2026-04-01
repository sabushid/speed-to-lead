import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re all set!</h1>
        <p className="text-gray-600 mb-6">
          We&apos;ve received your information and our AI is reaching out to you right now.
          Check your phone for a text message!
        </p>
        <div className="space-y-3 text-left bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-green-500 font-bold">1.</span>
            <span className="text-sm text-gray-700">SMS sent to your phone</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-blue-500 font-bold">2.</span>
            <span className="text-sm text-gray-700">AI voice call in ~30 seconds</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-purple-500 font-bold">3.</span>
            <span className="text-sm text-gray-700">Follow-up email in ~1 minute</span>
          </div>
        </div>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition"
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
