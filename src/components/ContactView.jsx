import React, { useState } from 'react';

export default function ContactView({ showToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      showToast('Thank you for reaching out! Our concierge team will contact you shortly.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1500);
  };

  return (
    <main className="pt-[110px] pb-section-gap bg-background text-on-background">
      {/* Hero Header */}
      <section className="relative h-[280px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Scenic coastline" 
            className="w-full h-full object-cover" 
            src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1920&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1c30]/65 to-[#0b1c30]/35"></div>
        </div>
        <div className="relative z-10 w-full max-w-4xl px-margin-mobile text-center text-white">
          <span className="font-label-caps text-label-caps text-secondary-fixed-dim uppercase tracking-[0.2em] mb-4 block">Concierge Support</span>
          <h1 className="font-display-lg text-4xl md:text-5xl font-bold tracking-tight mb-2">
            Get in Touch
          </h1>
          <p className="font-body-md text-white/80 max-w-lg mx-auto">
            Have questions about a stay or interest in our membership program? We are here to assist 24/7.
          </p>
        </div>
      </section>

      {/* Main Content: Info & Form */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-12">
            <div className="space-y-6">
              <div>
                <span className="font-label-caps text-label-caps text-secondary mb-2 block">Direct Channels</span>
                <h2 className="font-display-lg text-2xl md:text-3xl font-bold text-on-background">Connect with our hosts.</h2>
              </div>
              <p className="font-body-md text-on-surface-variant leading-relaxed">
                Whether you need assistance modifying a booking, requesting bespoke dining plans, or setting up a corporate stay, our operations team is at your disposal.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">mail</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm uppercase font-label-caps text-on-surface-variant">Email</h4>
                  <p className="text-on-surface font-medium text-sm mt-1">concierge@luminastay.com</p>
                  <p className="text-xs text-on-surface-variant">Response within 10 minutes</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">call</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm uppercase font-label-caps text-on-surface-variant">Hotline</h4>
                  <p className="text-on-surface font-medium text-sm mt-1">+1 (800) 555-0199</p>
                  <p className="text-xs text-on-surface-variant">Available 24/7 for members</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm uppercase font-label-caps text-on-surface-variant">Headquarters</h4>
                  <p className="text-on-surface font-medium text-sm mt-1">Lumina Stay Inc.</p>
                  <p className="text-xs text-on-surface-variant">Prinsengracht 268, 1016 HJ Amsterdam</p>
                </div>
              </div>
            </div>

            {/* Social channels */}
            <div className="pt-6 border-t border-outline-variant/30 flex gap-6 text-on-surface-variant text-sm">
              <a href="#" className="hover:text-primary transition-colors">Instagram</a>
              <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            </div>
          </div>

          {/* Right Column: Glass Form Card */}
          <div className="lg:col-span-7 flex">
            <div className="w-full bg-white border border-outline-variant/40 rounded-2xl p-8 shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="font-headline-sm text-xl font-bold mb-1">Send a Message</h3>
                <p className="text-xs text-on-surface-variant mb-6">Complete the form below to initiate contact with our global team.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-label-caps text-on-surface-variant block" htmlFor="contact_name">Full Name *</label>
                    <input 
                      id="contact_name"
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Evelyn Thorne"
                      className="w-full bg-surface-container-low border border-outline-variant/40 rounded-full py-2.5 px-4 text-xs text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-label-caps text-on-surface-variant block" htmlFor="contact_email">Email Address *</label>
                    <input 
                      id="contact_email"
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.thorne@concierge.com"
                      className="w-full bg-surface-container-low border border-outline-variant/40 rounded-full py-2.5 px-4 text-xs text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-label-caps text-on-surface-variant block" htmlFor="contact_subject">Subject *</label>
                  <input 
                    id="contact_subject"
                    type="text" 
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Membership Inquiry / Private Villa Booking"
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-full py-2.5 px-4 text-xs text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-label-caps text-on-surface-variant block" htmlFor="contact_message">Message *</label>
                  <textarea 
                    id="contact_message"
                    required
                    rows="5"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your requirements in detail..."
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-2xl py-3 px-4 text-xs text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary text-on-primary py-3 rounded-full font-interactive text-xs uppercase tracking-wider hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer shadow-sm mt-4"
                >
                  {isSubmitting ? 'Sending Request...' : 'Send Inquiry'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
