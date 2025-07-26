import React from 'react';
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - DreamfinityX AI Platform',
  description: 'Read our terms of service and user agreement for DreamfinityX AI image generation platform. Understand your rights and responsibilities.',
  keywords: 'terms of service, user agreement, AI platform terms, privacy policy, user rights',
  robots: 'index, follow',
  openGraph: {
    title: 'Terms of Service - DreamfinityX AI Platform',
    description: 'Read our terms of service and user agreement for DreamfinityX AI image generation platform.',
    url: 'https://dreamfinityx.com/terms',
    type: 'website',
  },
  alternates: {
    canonical: 'https://dreamfinityx.com/terms',
  },
}

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4 text-gray-700">
        Welcome to DreamfinityX. By using our platform, you agree to the following terms and conditions. Please read them carefully.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">1. Acceptance of Terms</h2>
      <p className="mb-4 text-gray-700">
        By accessing or using DreamfinityX, you agree to be bound by these Terms of Service and all applicable laws and regulations.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">2. User Responsibilities</h2>
      <p className="mb-4 text-gray-700">
        You are responsible for your use of the platform and for any content you create or share. Do not use the service for unlawful or harmful activities.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">3. Intellectual Property</h2>
      <p className="mb-4 text-gray-700">
        All content and services provided by DreamfinityX are protected by intellectual property laws. You may not copy, modify, or distribute any part of the platform without permission.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">4. Privacy</h2>
      <p className="mb-4 text-gray-700">
        Please review our Privacy Policy to understand how we collect, use, and protect your information.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">5. Changes to Terms</h2>
      <p className="mb-4 text-gray-700">
        We may update these Terms of Service from time to time. Continued use of the platform constitutes acceptance of the revised terms.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">6. Contact</h2>
      <p className="mb-4 text-gray-700">
        If you have any questions about these terms, please contact us at zeta@myowncoach.online.
      </p>
    </main>
  );
} 