/**
 * Hero Section Router Test Page
 *
 * Temporary page for testing Story 17.1 router implementation.
 * Demonstrates all three layout variants and edge cases.
 *
 * DELETE AFTER: Story 17.5 (Fixture Integration) is complete
 */

import HeroSection from '@/components/sections/HeroSection';

export default function TestHeroPage() {
  return (
    <main className="w-full">
      {/* Header */}
      <section className="p-8 bg-surface-primary border-b border-border-default">
        <h1 className="text-3xl font-bold text-text-primary mb-4">
          Hero Section Router Test Page
        </h1>
        <p className="text-text-secondary mb-2">
          Story 17.1: Hero Router Refactor - Manual Testing
        </p>
        <p className="text-text-muted text-sm">
          Each section below demonstrates a different layout variant.
        </p>
      </section>

      {/* Test 1: Centered Layout */}
      <section className="py-section border-b border-border-default">
        <div className="px-container mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            Test 1: layout="centered"
          </h2>
          <p className="text-text-secondary text-sm">
            Should delegate to HeroCentered (currently shows HeroContent)
          </p>
        </div>
        <HeroSection
          title="Grand Luxury Hotel"
          tagline="Experience Elegance"
          headline="Welcome to a world of refined luxury and impeccable service"
          description="Nestled in the heart of the city, our hotel offers an unforgettable experience."
          variant={{
            layout: 'centered',
            style: 'elegant',
            overlay: 'gradient',
            height: 'large'
          }}
          primaryCTA={{ text: 'Explore Rooms', href: '#rooms' }}
          secondaryCTA={{ text: 'View Amenities', href: '#amenities' }}
          image="https://images.unsplash.com/photo-1570213489059-0aac6626cade?auto=format&fit=crop&q=80&w=1920"
        />
      </section>

      {/* Test 2: Split Layout */}
      <section className="py-section border-b border-border-default">
        <div className="px-container mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            Test 2: layout="split"
          </h2>
          <p className="text-text-secondary text-sm">
            Should delegate to HeroSplit (currently shows stub message)
          </p>
        </div>
        <HeroSection
          title="Urban Business Hotel"
          tagline="Stay Productive"
          headline="Modern comfort for the discerning business traveler"
          description="Designed for productivity, perfected for relaxation."
          variant={{
            layout: 'split',
            style: 'modern',
            overlay: 'none',
            height: 'medium'
          }}
          primaryCTA={{ text: 'Book Now', href: '#booking' }}
          secondaryCTA={{ text: 'View Rooms', href: '#rooms' }}
          image="https://images.unsplash.com/photo-1566073771259-6a8506099925?auto=format&fit=crop&q=80&w=1920"
        />
      </section>

      {/* Test 3: Minimal Layout */}
      <section className="py-section border-b border-border-default">
        <div className="px-container mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            Test 3: layout="minimal"
          </h2>
          <p className="text-text-secondary text-sm">
            Should delegate to HeroMinimal (currently shows stub message)
          </p>
        </div>
        <HeroSection
          title="Budget Stay Hostel"
          tagline="Simple. Clean. Affordable."
          headline="Your home away from home"
          description="Experience the city without breaking the bank."
          variant={{
            layout: 'minimal',
            style: 'minimal',
            overlay: 'none',
            height: 'small'
          }}
          primaryCTA={{ text: 'Check Availability', href: '#booking' }}
          image="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1920"
        />
      </section>

      {/* Test 4: Legacy Fullscreen (Backward Compatibility) */}
      <section className="py-section border-b border-border-default">
        <div className="px-container mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            Test 4: layout="fullscreen" (Legacy - Should Fall Back to Centered)
          </h2>
          <p className="text-text-secondary text-sm">
            Should convert to centered layout + fullscreen height
          </p>
        </div>
        <HeroSection
          title="The Azure Boutique"
          tagline="Where Dreams Meet the Aegean"
          headline="Experience unparalleled luxury in the heart of Santorini"
          variant={{
            layout: 'fullscreen' as any, // Deprecated value
            style: 'elegant',
            overlay: 'gradient',
            height: 'fullscreen'
          }}
          primaryCTA={{ text: 'Explore Suites', href: '#rooms' }}
          secondaryCTA={{ text: 'Reserve Now', href: '#booking' }}
          image="https://images.unsplash.com/photo-1570213489059-0aac6626fade?auto=format&fit=crop&q=80&w=1920"
        />
      </section>

      {/* Test 5: Unknown Layout (Fallback) */}
      <section className="py-section border-b border-border-default">
        <div className="px-container mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            Test 5: layout="unknown" (Should Fall Back to Centered)
          </h2>
          <p className="text-text-secondary text-sm">
            Should gracefully fall back to centered layout
          </p>
        </div>
        <HeroSection
          title="Fallback Test"
          headline="This should still render"
          variant={{
            layout: 'unknown' as any,
            style: 'classic',
            overlay: 'none',
            height: 'medium'
          }}
          primaryCTA={{ text: 'Continue', href: '/' }}
          image="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1920"
        />
      </section>

      {/* Test 6: No Layout Specified (Default) */}
      <section className="py-section">
        <div className="px-container mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            Test 6: No layout specified (Should Default to Centered)
          </h2>
          <p className="text-text-secondary text-sm">
            Should default to centered layout
          </p>
        </div>
        <HeroSection
          title="Default Layout Test"
          headline="This uses the default centered layout"
          variant={{
            style: 'bold',
            overlay: 'light',
            height: 'medium'
          }}
          primaryCTA={{ text: 'Get Started', href: '/start' }}
          image="https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=1920"
        />
      </section>
    </main>
  );
}
