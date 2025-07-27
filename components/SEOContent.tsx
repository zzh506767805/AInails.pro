import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Script from 'next/script'

export default function SEOContent() {
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
        {/* 新增加的SEO文案 */}
        <div className="mb-16 bg-white p-8 rounded-lg shadow-lg border border-gray-100">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            <span className="text-pink-600">✨</span> AI Nails: Generate Stunning Nail Designs with AI
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 mb-8">
            <p className="text-xl mb-6">
              Welcome to AI Nails, your ultimate destination for AI-powered nail art inspiration. Whether you're a nail artist, salon owner, 
              or just exploring creative styles, our AI nail design tool helps you create trendy, personalized nail looks in seconds.
            </p>
            
            <h3 className="text-2xl font-semibold text-pink-600 mt-8 mb-4">
              🖌 What Is AI Nails?
            </h3>
            <p className="mb-6">
              AI Nails is an intelligent nail art generator that uses advanced artificial intelligence to generate beautiful 
              and realistic nail designs based on your preferences. From minimalistic nails to bold chrome looks, our AI covers 
              every style, color, and pattern imaginable.
            </p>
            
            <h3 className="text-2xl font-semibold text-pink-600 mt-8 mb-4">
              💅 Why Use AI for Nail Design?
            </h3>
            <ul className="mb-6 list-disc pl-6">
              <li className="mb-2">Get instant AI-generated nail ideas tailored to your style</li>
              <li className="mb-2">Discover thousands of unique AI nail designs</li>
              <li className="mb-2">Save time and money—no more endless Pinterest scrolling</li>
              <li className="mb-2">Perfect for salons, social media content, or trying new looks at home</li>
            </ul>
            
            <h3 className="text-2xl font-semibold text-pink-600 mt-8 mb-4">
              🌈 Explore Nail Art Styles
            </h3>
            <p className="mb-3">
              With AI Nails, you can explore styles such as:
            </p>
            <ul className="mb-6 list-disc pl-6">
              <li className="mb-2">French tips, chrome nails, and gradient ombre</li>
              <li className="mb-2">Kawaii, 3D, holographic, and minimalist nail art</li>
              <li className="mb-2">Seasonal themes: summer nails, holiday nails, and more</li>
            </ul>
            
           
          </div>
        </div>

        {/* Featured Nail Designs Section - NEW */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Featured Nail Art Designs
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 mb-8">
            <p className="text-xl mb-6">
              Explore our collection of stunning nail art designs, showcasing the versatility and creativity 
              of our <strong>AI nail art generator</strong>. Each design represents different styles and techniques 
              in modern nail artistry, providing inspiration for your next manicure.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="aspect-square relative">
                <img 
                  src="/images/featured_nail_french.png"
                  alt="Elegant French manicure with floral accents - Professional nail art design with delicate white tips and pink flower patterns"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold">Elegant French Manicure</h3>
                  <p className="text-white/80 text-sm">Floral Accents & White Tips</p>
                </div>
              </div>
              <CardContent>
                <p className="text-gray-700 text-sm mt-2">
                  This <strong>elegant nail design</strong> features a classic French manicure with a modern twist, 
                  incorporating delicate floral patterns and soft pink tones for a sophisticated look perfect for 
                  weddings and formal events.
                </p>
                <Badge className="mt-3 bg-pink-100 text-pink-800">French Manicure</Badge>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="aspect-square relative">
                <img 
                  src="/images/featured_nail_geometric.png"
                  alt="Trendy geometric nail art with bold patterns - Modern manicure featuring abstract shapes in vibrant colors"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold">Geometric Pattern Nails</h3>
                  <p className="text-white/80 text-sm">Bold & Vibrant Designs</p>
                </div>
              </div>
              <CardContent>
                <p className="text-gray-700 text-sm mt-2">
                  This <strong>trendy nail art</strong> showcases bold geometric patterns in vibrant colors, 
                  creating a modern and eye-catching manicure that makes a statement. Perfect for those who 
                  want to express their creativity and follow current <strong>nail art trends</strong>.
                </p>
                <Badge className="mt-3 bg-purple-100 text-purple-800">Geometric Art</Badge>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="aspect-square relative">
                <img 
                  src="/images/featured_nail_ombre.png"
                  alt="Luxury gradient ombré nails with rhinestone accents - Premium salon-quality manicure with smooth color transition and sparkle details"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold">Luxury Gradient Ombré</h3>
                  <p className="text-white/80 text-sm">Rhinestone Accented Design</p>
                </div>
              </div>
              <CardContent>
                <p className="text-gray-700 text-sm mt-2">
                  This <strong>premium nail design</strong> features a smooth color gradient with rhinestone accents, 
                  creating a luxurious and glamorous look. The professional-quality ombré effect transitions 
                  seamlessly between complementary colors for an elegant finish.
                </p>
                <Badge className="mt-3 bg-blue-100 text-blue-800">Luxury Design</Badge>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="aspect-square relative">
                <img 
                  src="/images/featured_nail_minimalist.png"
                  alt="Minimalist nude nails with artistic line work - Contemporary nail art combining natural tones with delicate hand-drawn elements"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold">Minimalist Nude Nails</h3>
                  <p className="text-white/80 text-sm">Artistic Line Work Detail</p>
                </div>
              </div>
              <CardContent>
                <p className="text-gray-700 text-sm mt-2">
                  This <strong>contemporary nail art</strong> combines natural nude tones with delicate hand-drawn 
                  line work, creating a sophisticated minimalist design. Perfect for professionals seeking an 
                  elegant yet subtle <strong>nail design</strong> for everyday wear.
                </p>
                <Badge className="mt-3 bg-amber-100 text-amber-800">Minimalist Style</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* SEO Rich Content Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            AI Nail Art Generator: Revolutionizing Nail Design Creation
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-xl mb-6">
              Our <strong>AI nail art generator</strong> represents the cutting edge of <strong>nail design technology</strong>, 
              combining artificial intelligence with creative nail art techniques to deliver stunning, 
              personalized nail designs. Whether you're a professional nail artist seeking inspiration 
              or a beauty enthusiast exploring <strong>nail art trends</strong>, our platform provides the tools 
              you need to create exceptional nail designs.
            </p>
            
            <p className="mb-6">
              The <strong>nail art generator</strong> utilizes advanced machine learning algorithms to understand 
              your style preferences and create unique nail designs that match your personality. 
              From classic French manicures to bold geometric patterns, our <strong>AI nail design</strong> 
              technology can generate thousands of variations, ensuring you never run out of 
              <strong>nail art ideas</strong>.
            </p>
            
            <p className="mb-6">
              Professional nail artists are increasingly turning to <strong>AI nail art tools</strong> to 
              streamline their workflow and offer clients more design options. Our <strong>nail design generator</strong> 
              helps artists create custom nail art quickly, allowing them to focus on perfecting their 
              technique and providing exceptional service.
            </p>
          </div>
        </div>

        {/* Feature Grid with SEO Keywords */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Advanced Nail Art AI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our sophisticated <strong>AI nail art generator</strong> uses deep learning to create 
                professional-quality nail designs. The system analyzes current <strong>nail art trends</strong> 
                and generates innovative <strong>nail design ideas</strong> that are both fashionable and unique.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Custom Nail Design Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create personalized <strong>nail art designs</strong> tailored to your style preferences. 
                Our <strong>nail design generator</strong> considers color schemes, patterns, and occasions 
                to produce perfect nail art for any event or mood.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Professional Nail Art Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Access professional-grade <strong>nail art tools</strong> and <strong>nail design software</strong> 
                that rival industry standards. Our platform provides nail artists with the technology 
                they need to create stunning nail designs efficiently.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Nail Art Inspiration Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Browse thousands of <strong>nail art designs</strong> and <strong>nail design ideas</strong> 
                created by our AI. Find inspiration for your next nail art project or discover new 
                <strong>nail art trends</strong> to try.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Nail Art Education Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Learn advanced <strong>nail art techniques</strong> and <strong>nail design principles</strong> 
                through our comprehensive tutorials. Master the art of creating beautiful nail designs 
                with expert guidance and AI assistance.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Nail Art Business Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Grow your <strong>nail art business</strong> with our professional tools and resources. 
                Our platform helps nail artists streamline their workflow and offer clients innovative 
                <strong>nail design services</strong>.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* SEO FAQ Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions About AI Nail Art Generation
          </h3>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does the AI nail art generator work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our <strong>AI nail art generator</strong> uses advanced machine learning algorithms to analyze 
                  thousands of nail designs and create unique nail art based on your preferences. The system 
                  considers color theory, current <strong>nail art trends</strong>, and design principles to 
                  generate professional-quality nail designs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I customize the generated nail designs?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Absolutely! Our <strong>nail design generator</strong> allows you to customize colors, patterns, 
                  and styles to create personalized nail art. You can modify any aspect of the generated 
                  <strong>nail art designs</strong> to match your exact preferences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is the AI nail art suitable for professional use?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! Professional nail artists use our <strong>AI nail art tools</strong> to create custom 
                  designs for clients. The generated nail designs meet industry standards and can be 
                  adapted for various nail art techniques and applications.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How often are new nail art trends added?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our <strong>nail art generator</strong> is continuously updated with the latest 
                  <strong>nail art trends</strong> and <strong>nail design ideas</strong>. We monitor fashion 
                  trends and beauty industry developments to ensure our AI creates relevant and 
                  fashionable nail designs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SEO Rich Footer Content */}
        <div className="bg-white p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Why Choose Our AI Nail Art Generator?
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">For Nail Artists</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Access to thousands of <strong>nail art designs</strong></li>
                <li>• Professional <strong>nail art tools</strong> and resources</li>
                <li>• Streamlined <strong>nail design</strong> workflow</li>
                <li>• Latest <strong>nail art trends</strong> and techniques</li>
                <li>• Business growth opportunities</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">For Beauty Enthusiasts</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Personalized <strong>nail art ideas</strong></li>
                <li>• Easy-to-use <strong>nail design generator</strong></li>
                <li>• Trendy <strong>nail art designs</strong></li>
                <li>• Educational nail art resources</li>
                <li>• Affordable nail art solutions</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-pink-50 rounded-lg">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              Start Creating Beautiful Nail Art Today
            </h4>
            <p className="text-gray-700">
              Join thousands of nail artists and beauty enthusiasts who are already using our 
              <strong>AI nail art generator</strong> to create stunning nail designs. Experience the future 
              of nail art creation with cutting-edge <strong>nail design technology</strong> that makes 
              beautiful nail art accessible to everyone.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 