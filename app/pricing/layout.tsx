import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing Plans - AI Image Generation Credits | DreamfinityX',
  description: 'Choose from flexible pricing plans for AI image generation and editing. Monthly subscriptions and credit packages available. Professional AI tools at affordable prices.',
  keywords: 'AI image generation pricing, AI art pricing, image editing credits, subscription plans, AI tools cost',
  robots: 'index, follow',
  openGraph: {
    title: 'Pricing Plans - AI Image Generation Credits | DreamfinityX',
    description: 'Choose from flexible pricing plans for AI image generation and editing. Monthly subscriptions and credit packages available.',
    url: 'https://dreamfinityx.com/pricing',
    type: 'website',
  },
  alternates: {
    canonical: 'https://dreamfinityx.com/pricing',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 