import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Script from 'next/script'
import { Locale } from '@/lib/i18n/config'
import { Dictionary } from '@/lib/i18n/dictionaries'

interface SEOContentProps {
  locale: Locale
  dictionary: Dictionary
}

export default function SEOContent({ locale, dictionary }: SEOContentProps) {
  // Type assertion for dictionary to include seo properties
  const dict = dictionary as any
  // JSON-LD structured data for nail designs
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'item': {
          '@type': 'CreativeWork',
          'name': 'Elegant French Manicure with Floral Accents',
          'image': 'https://ainails.pro/images/featured_nail_french.png',
          'description': 'Professional nail art design with delicate white tips and pink flower patterns',
          'creator': {
            '@type': 'Organization',
            'name': 'AInails'
          },
          'datePublished': '2023-08-01'
        }
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'item': {
          '@type': 'CreativeWork',
          'name': 'Trendy Geometric Nail Art with Bold Patterns',
          'image': 'https://ainails.pro/images/featured_nail_geometric.png',
          'description': 'Modern manicure featuring abstract shapes in vibrant colors',
          'creator': {
            '@type': 'Organization',
            'name': 'AInails'
          },
          'datePublished': '2023-08-15'
        }
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'item': {
          '@type': 'CreativeWork',
          'name': 'Luxury Gradient Ombré Nails with Rhinestone Accents',
          'image': 'https://ainails.pro/images/featured_nail_ombre.png',
          'description': 'Premium salon-quality manicure with smooth color transition and sparkle details',
          'creator': {
            '@type': 'Organization',
            'name': 'AInails'
          },
          'datePublished': '2023-09-01'
        }
      },
      {
        '@type': 'ListItem',
        'position': 4,
        'item': {
          '@type': 'CreativeWork',
          'name': 'Minimalist Nude Nails with Artistic Line Work',
          'image': 'https://ainails.pro/images/featured_nail_minimalist.png',
          'description': 'Contemporary nail art combining natural tones with delicate hand-drawn elements',
          'creator': {
            '@type': 'Organization',
            'name': 'AInails'
          },
          'datePublished': '2023-09-15'
        }
      }
    ]
  };

  return (
    <section className="py-20 bg-gray-50">
      {/* Structured data for SEO */}
      <Script
        id="nail-designs-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* AI Nails Introduction */}
        <div className="mb-16 bg-white p-8 rounded-lg shadow-lg border border-gray-100">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            <span className="text-pink-600">✨</span> 
            {dict?.seo?.title || 'AI Nails: Generate Stunning Nail Designs with AI'}
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 mb-8">
            <p className="text-xl mb-6">
              {dict?.seo?.introduction || 
                'Welcome to AI Nails, your ultimate destination for AI-powered nail art inspiration. Whether you\'re a nail artist, salon owner, or just exploring creative styles, our AI nail design tool helps you create trendy, personalized nail looks in seconds.'}
            </p>
            
            <h3 className="text-2xl font-semibold text-pink-600 mt-8 mb-4">
              🖌 {dict?.seo?.whatIsTitle || 'What Is AI Nails?'}
            </h3>
            <p className="mb-6">
              {dict?.seo?.whatIsDescription || 
                'AI Nails is an intelligent nail art generator that uses advanced artificial intelligence to generate beautiful and realistic nail designs based on your preferences. From minimalistic nails to bold chrome looks, our AI covers every style, color, and pattern imaginable.'}
            </p>
            
            <h3 className="text-2xl font-semibold text-pink-600 mt-8 mb-4">
              💅 {dict?.seo?.whyUseTitle || 'Why Use AI for Nail Design?'}
            </h3>
            <ul className="mb-6 list-disc pl-6">
              <li className="mb-2">{dict?.seo?.benefits?.instant || 'Get instant AI-generated nail ideas tailored to your style'}</li>
              <li className="mb-2">{dict?.seo?.benefits?.discover || 'Discover thousands of unique AI nail designs'}</li>
              <li className="mb-2">{dict?.seo?.benefits?.save || 'Save time and money—no more endless Pinterest scrolling'}</li>
              <li className="mb-2">{dict?.seo?.benefits?.perfect || 'Perfect for salons, social media content, or trying new looks at home'}</li>
            </ul>
          </div>
        </div>

        {/* Featured Nail Designs Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            {dict?.seo?.featuredTitle || 'Featured Nail Art Designs'}
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 mb-8">
            <p className="text-xl mb-6">
              {dict?.seo?.featuredDescription || 
                'Explore our collection of stunning nail art designs, showcasing the versatility and creativity of our AI nail art generator. Each design represents different styles and techniques in modern nail artistry, providing inspiration for your next manicure.'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                src: '/images/featured_nail_french.png',
                title: 'Elegant French Manicure',
                subtitle: 'Floral Accents & White Tips',
                description: 'This elegant nail design features a classic French manicure with a modern twist, incorporating delicate floral patterns and soft pink tones.',
                badge: 'French Manicure',
                badgeColor: 'bg-pink-100 text-pink-800'
              },
              {
                src: '/images/featured_nail_geometric.png',
                title: 'Geometric Pattern Nails',
                subtitle: 'Bold & Vibrant Designs',
                description: 'This trendy nail art showcases bold geometric patterns in vibrant colors, creating a modern and eye-catching manicure.',
                badge: 'Geometric Art',
                badgeColor: 'bg-purple-100 text-purple-800'
              },
              {
                src: '/images/featured_nail_ombre.png',
                title: 'Luxury Gradient Ombré',
                subtitle: 'Rhinestone Accented Design',
                description: 'This premium nail design features a smooth color gradient with rhinestone accents, creating a luxurious look.',
                badge: 'Luxury Design',
                badgeColor: 'bg-blue-100 text-blue-800'
              },
              {
                src: '/images/featured_nail_minimalist.png',
                title: 'Minimalist Nude Nails',
                subtitle: 'Artistic Line Work Detail',
                description: 'This contemporary nail art combines natural nude tones with delicate hand-drawn line work.',
                badge: 'Minimalist Style',
                badgeColor: 'bg-amber-100 text-amber-800'
              }
            ].map((design, index) => (
              <Card key={index} className="border-0 shadow-lg overflow-hidden">
                <div className="aspect-square relative">
                  <img 
                    src={design.src}
                    alt={design.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold">{design.title}</h3>
                    <p className="text-white/80 text-sm">{design.subtitle}</p>
                  </div>
                </div>
                <CardContent>
                  <p className="text-gray-700 text-sm mt-2">{design.description}</p>
                  <Badge className={`mt-3 ${design.badgeColor}`}>{design.badge}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main SEO Content Section - RESTORED */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            {dict?.seo?.mainTitle || 'AI Nail Art Generator: Revolutionizing Nail Design Creation'}
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-xl mb-6">
              {dict?.seo?.mainDescription || 
                'Our AI nail art generator represents the cutting edge of nail design technology, combining artificial intelligence with creative nail art techniques to deliver stunning, personalized nail designs. Whether you\'re a professional nail artist seeking inspiration or a beauty enthusiast exploring nail art trends, our platform provides the tools you need to create exceptional nail designs.'}
            </p>
            
            <p className="mb-6">
              {dict?.seo?.mainContent?.paragraph1 || 
                'The nail art generator utilizes advanced machine learning algorithms to understand your style preferences and create unique nail designs that match your personality. From classic French manicures to bold geometric patterns, our AI nail design technology can generate thousands of variations, ensuring you never run out of nail art ideas.'}
            </p>
            
            <p className="mb-6">
              {dict?.seo?.mainContent?.paragraph2 || 
                'Professional nail artists are increasingly turning to AI nail art tools to streamline their workflow and offer clients more design options. Our nail design generator helps artists create custom nail art quickly, allowing them to focus on perfecting their technique and providing exceptional service.'}
            </p>
          </div>
        </div>

        {/* Feature Grid - EXPANDED TO 6 CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">
                {dict?.seo?.features?.advanced || 'Advanced Nail Art AI'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {dict?.seo?.features?.advancedDesc || 
                  'Our sophisticated AI nail art generator uses deep learning to create professional-quality nail designs. The system analyzes current nail art trends and generates innovative nail design ideas that are both fashionable and unique.'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">
                {dict?.seo?.features?.custom || 'Custom Nail Design Creation'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {dict?.seo?.features?.customDesc || 
                  'Create personalized nail art designs tailored to your style preferences. Our nail design generator considers color schemes, patterns, and occasions to produce perfect nail art for any event or mood.'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">
                {dict?.seo?.features?.professional || 'Professional Nail Art Tools'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {dict?.seo?.features?.professionalDesc || 
                  'Access professional-grade nail art tools and nail design software that rival industry standards. Our platform provides nail artists with the technology they need to create stunning nail designs efficiently.'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">
                {dict?.seo?.features?.inspiration || 'Nail Art Inspiration Gallery'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {dict?.seo?.features?.inspirationDesc || 
                  'Browse thousands of nail art designs and nail design ideas created by our AI. Find inspiration for your next nail art project or discover new nail art trends to try.'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">
                {dict?.seo?.features?.education || 'Nail Art Education Resources'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {dict?.seo?.features?.educationDesc || 
                  'Learn advanced nail art techniques and nail design principles through our comprehensive tutorials. Master the art of creating beautiful nail designs with expert guidance and AI assistance.'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">
                {dict?.seo?.features?.business || 'Nail Art Business Solutions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {dict?.seo?.features?.businessDesc || 
                  'Grow your nail art business with our professional tools and resources. Our platform helps nail artists streamline their workflow and offer clients innovative nail design services.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section - RESTORED */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {dict?.seo?.faq?.title || 'Frequently Asked Questions About AI Nail Art Generation'}
          </h3>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {dict?.seo?.faq?.questions?.howWorks?.question || 'How does the AI nail art generator work?'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {dict?.seo?.faq?.questions?.howWorks?.answer || 
                    'Our AI nail art generator uses advanced machine learning algorithms to analyze thousands of nail designs and create unique nail art based on your preferences. The system considers color theory, current nail art trends, and design principles to generate professional-quality nail designs.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {dict?.seo?.faq?.questions?.customize?.question || 'Can I customize the generated nail designs?'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {dict?.seo?.faq?.questions?.customize?.answer || 
                    'Absolutely! Our nail design generator allows you to customize colors, patterns, and styles to create personalized nail art. You can modify any aspect of the generated nail art designs to match your exact preferences.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {dict?.seo?.faq?.questions?.professional?.question || 'Is the AI nail art suitable for professional use?'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {dict?.seo?.faq?.questions?.professional?.answer || 
                    'Yes! Professional nail artists use our AI nail art tools to create custom designs for clients. The generated nail designs meet industry standards and can be adapted for various nail art techniques and applications.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {dict?.seo?.faq?.questions?.trends?.question || 'How often are new nail art trends added?'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {dict?.seo?.faq?.questions?.trends?.answer || 
                    'Our nail art generator is continuously updated with the latest nail art trends and nail design ideas. We monitor fashion trends and beauty industry developments to ensure our AI creates relevant and fashionable nail designs.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section - ENHANCED */}
        <div className="bg-white p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            {dict?.seo?.cta?.title || 'Why Choose Our AI Nail Art Generator?'}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                {dict?.seo?.cta?.forArtists || 'For Nail Artists'}
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li>• {dict?.seo?.cta?.artistBenefits?.designs || 'Access to thousands of nail art designs'}</li>
                <li>• {dict?.seo?.cta?.artistBenefits?.tools || 'Professional nail art tools and resources'}</li>
                <li>• {dict?.seo?.cta?.artistBenefits?.workflow || 'Streamlined nail design workflow'}</li>
                <li>• {dict?.seo?.cta?.artistBenefits?.trends || 'Latest nail art trends and techniques'}</li>
                <li>• {dict?.seo?.cta?.artistBenefits?.business || 'Business growth opportunities'}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                {dict?.seo?.cta?.forEnthusiasts || 'For Beauty Enthusiasts'}
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li>• {dict?.seo?.cta?.enthusiastBenefits?.personalized || 'Personalized nail art ideas'}</li>
                <li>• {dict?.seo?.cta?.enthusiastBenefits?.easy || 'Easy-to-use nail design generator'}</li>
                <li>• {dict?.seo?.cta?.enthusiastBenefits?.trendy || 'Trendy nail art designs'}</li>
                <li>• {dict?.seo?.cta?.enthusiastBenefits?.educational || 'Educational nail art resources'}</li>
                <li>• {dict?.seo?.cta?.enthusiastBenefits?.affordable || 'Affordable nail art solutions'}</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-pink-50 rounded-lg">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              {dict?.seo?.cta?.finalTitle || 'Start Creating Beautiful Nail Art Today'}
            </h4>
            <p className="text-gray-700">
              {dict?.seo?.cta?.finalDescription || 
                'Join thousands of nail artists and beauty enthusiasts who are already using our AI nail art generator to create stunning nail designs. Experience the future of nail art creation with cutting-edge nail design technology that makes beautiful nail art accessible to everyone.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}