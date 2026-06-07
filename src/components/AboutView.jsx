import React from 'react';

export default function AboutView() {
  return (
    <main className="pt-[110px] pb-section-gap bg-background text-on-background">
      {/* Hero Header */}
      <section className="relative h-[380px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Luxury Resort Lobby" 
            className="w-full h-full object-cover" 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1c30]/65 to-[#0b1c30]/30"></div>
        </div>
        <div className="relative z-10 w-full max-w-4xl px-margin-mobile text-center text-white">
          <span className="font-label-caps text-label-caps text-secondary-fixed-dim uppercase tracking-[0.2em] mb-4 block">The Lumina Way</span>
          <h1 className="font-display-lg text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Service Defined by Silence and Speed.
          </h1>
          <p className="font-body-md text-white/80 max-w-xl mx-auto">
            We curate spaces where travelers find the ultimate luxury: tranquility, impeccable design, and seamless hospitality.
          </p>
        </div>
      </section>

      {/* Philosophy & Story */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="font-label-caps text-label-caps text-secondary mb-3 block">Our Heritage</span>
            <h2 className="font-display-lg text-3xl md:text-4xl mb-6">Redefining modern travel since 2026.</h2>
            <div className="space-y-4 font-body-md text-on-surface-variant leading-relaxed">
              <p>
                Lumina Stay was born out of a simple realization: in an increasingly connected and noisy world, the true luxury is space and silence. We set out to build a curated network of properties that act as sanctuaries for the senses.
              </p>
              <p>
                Every villa, ryokan, and pavilion in our collection is handpicked and undergoes a rigorous inspection process. We do not just evaluate the bed thread count; we measure the alignment of the design, the tranquility of the environment, and the speed of our local concierge operations.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
            <img 
              alt="Zen Garden" 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-surface-container-low py-16">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <p className="font-display-lg text-4xl md:text-5xl text-primary font-bold">50+</p>
              <p className="font-label-caps text-xs text-on-surface-variant uppercase">Global Destinations</p>
            </div>
            <div className="space-y-2">
              <p className="font-display-lg text-4xl md:text-5xl text-primary font-bold">250+</p>
              <p className="font-label-caps text-xs text-on-surface-variant uppercase">Curated Stays</p>
            </div>
            <div className="space-y-2">
              <p className="font-display-lg text-4xl md:text-5xl text-primary font-bold">99.4%</p>
              <p className="font-label-caps text-xs text-on-surface-variant uppercase">Concierge SLA</p>
            </div>
            <div className="space-y-2">
              <p className="font-display-lg text-4xl md:text-5xl text-primary font-bold">4.92</p>
              <p className="font-label-caps text-xs text-on-surface-variant uppercase">Average Guest Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team/Values Grid */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
        <div className="text-center mb-12">
          <span className="font-label-caps text-label-caps text-secondary mb-3 block">Our Standards</span>
          <h2 className="font-display-lg text-3xl">Built on unyielding principles.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 border border-outline-variant/30 rounded-xl bg-white shadow-sm space-y-4">
            <span className="material-symbols-outlined text-primary text-3xl">workspace_premium</span>
            <h3 className="font-headline-sm text-lg font-bold">Aesthetic Purity</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              We partner exclusively with architectural masterpieces that respect local traditions while offering modern, clean geometries.
            </p>
          </div>
          <div className="p-8 border border-outline-variant/30 rounded-xl bg-white shadow-sm space-y-4">
            <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
            <h3 className="font-headline-sm text-lg font-bold">Impeccable Privacy</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              All properties are situated in quiet residential zones or deep natural pockets, guaranteeing uninterrupted personal space.
            </p>
          </div>
          <div className="p-8 border border-outline-variant/30 rounded-xl bg-white shadow-sm space-y-4">
            <span className="material-symbols-outlined text-primary text-3xl">concierge</span>
            <h3 className="font-headline-sm text-lg font-bold">Digital Concierge</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              From premium transport bookings to local restaurant reservations, our team responds to guest requests within 10 minutes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
