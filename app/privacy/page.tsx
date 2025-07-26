import React from 'react';
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - DreamfinityX AI Platform',
  description: 'Read our privacy policy to understand how DreamfinityX collects, uses, and protects your personal information and data.',
  keywords: 'privacy policy, data protection, personal information, AI platform privacy, user data, cookies',
  robots: 'index, follow',
  openGraph: {
    title: 'Privacy Policy - DreamfinityX AI Platform',
    description: 'Read our privacy policy to understand how DreamfinityX collects, uses, and protects your personal information.',
    url: 'https://dreamfinityx.com/privacy',
    type: 'website',
  },
  alternates: {
    canonical: 'https://dreamfinityx.com/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-6 text-gray-700">
        <strong>Last updated:</strong> {new Date().toLocaleDateString()}
      </p>
      <p className="mb-6 text-gray-700">
        At DreamfinityX, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our AI image generation and editing platform.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
      <h3 className="text-xl font-medium mt-6 mb-3">Personal Information</h3>
      <p className="mb-4 text-gray-700">
        When you create an account or use our services, we may collect:
      </p>
      <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1">
        <li>Email address</li>
        <li>Profile information (username, avatar)</li>
        <li>Payment information (processed securely through Stripe)</li>
        <li>Usage preferences and settings</li>
      </ul>

      <h3 className="text-xl font-medium mt-6 mb-3">Usage Information</h3>
      <p className="mb-4 text-gray-700">
        We automatically collect information about how you use our platform:
      </p>
      <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1">
        <li>Generated images and prompts</li>
        <li>Feature usage patterns</li>
        <li>Device information and IP address</li>
        <li>Browser type and version</li>
        <li>Pages visited and time spent on our platform</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
      <p className="mb-4 text-gray-700">
        We use your information to:
      </p>
      <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1">
        <li>Provide and improve our AI image generation services</li>
        <li>Process payments and manage your account</li>
        <li>Personalize your experience and provide customer support</li>
        <li>Analyze usage patterns to enhance our platform</li>
        <li>Send important updates and service notifications</li>
        <li>Comply with legal obligations and prevent fraud</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">3. Information Sharing</h2>
      <p className="mb-4 text-gray-700">
        We do not sell, rent, or share your personal information with third parties except:
      </p>
      <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1">
        <li><strong>Service Providers:</strong> We work with trusted partners (like Stripe for payments, Supabase for database services) who help us operate our platform</li>
        <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
        <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of our business</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
      <p className="mb-4 text-gray-700">
        We implement industry-standard security measures to protect your data:
      </p>
      <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1">
        <li>Encryption in transit and at rest</li>
        <li>Regular security audits and updates</li>
        <li>Access controls and authentication</li>
        <li>Secure payment processing through Stripe</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights and Choices</h2>
      <p className="mb-4 text-gray-700">
        You have the right to:
      </p>
      <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1">
        <li>Access and update your personal information</li>
        <li>Delete your account and associated data</li>
        <li>Opt out of marketing communications</li>
        <li>Request a copy of your data</li>
        <li>Restrict or object to certain processing activities</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">6. Cookies and Tracking</h2>
      <p className="mb-4 text-gray-700">
        We use cookies and similar technologies to:
      </p>
      <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1">
        <li>Remember your preferences and settings</li>
        <li>Analyze website traffic and usage patterns</li>
        <li>Provide personalized content and advertisements</li>
        <li>Improve our services and user experience</li>
      </ul>
      <p className="mb-4 text-gray-700">
        You can control cookies through your browser settings, but some features may not work properly if you disable them.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">7. Third-Party Services</h2>
      <p className="mb-4 text-gray-700">
        Our platform integrates with third-party services:
      </p>
      <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1">
        <li><strong>OpenAI/Azure OpenAI:</strong> For AI image generation and processing</li>
        <li><strong>Stripe:</strong> For payment processing</li>
        <li><strong>Supabase:</strong> For database and authentication services</li>
        <li><strong>Google Analytics:</strong> For website analytics</li>
      </ul>
      <p className="mb-4 text-gray-700">
        These services have their own privacy policies, and we encourage you to review them.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">8. Children&apos;s Privacy</h2>
      <p className="mb-4 text-gray-700">
        Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">9. International Data Transfers</h2>
      <p className="mb-4 text-gray-700">
        Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to This Privacy Policy</h2>
      <p className="mb-4 text-gray-700">
        We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
      <p className="mb-4 text-gray-700">
        If you have any questions about this Privacy Policy or our data practices, please contact us at:
      </p>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-700">
          <strong>Email:</strong> zeta@myowncoach.online<br/>
          <strong>Website:</strong> https://dreamfinityx.com
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          This Privacy Policy is effective as of the date stated above and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.
        </p>
      </div>
    </main>
  );
} 