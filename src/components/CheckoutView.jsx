import React, { useState } from 'react';

export default function CheckoutView({ bookingDetails, onComplete, showToast }) {
  const {
    hotel,
    room,
    checkIn,
    checkOut,
    guests,
    nights,
    subtotal,
    serviceFee,
    total
  } = bookingDetails;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [requests, setRequests] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !cardNumber || !expiry || !cvv) {
      showToast('Please fill out all required guest and payment details.', true);
      return;
    }
    onComplete({ firstName, lastName, email, requests });
  };

  const hotelImg = hotel.images && hotel.images.length > 0 
    ? hotel.images[0].url 
    : 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80';

  return (
    <main className="pt-[120px] pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
      {/* Progress Indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-between md:justify-start md:gap-12 relative">
          <div className="absolute top-1/2 left-0 w-full md:w-[600px] h-[1px] bg-outline-variant -z-10 -translate-y-1/2"></div>
          <div className="flex items-center gap-3 bg-background pr-4">
            <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center font-interactive text-interactive text-primary bg-surface">1</div>
            <span className="font-interactive text-interactive text-primary font-bold hidden sm:block">Guest Info</span>
          </div>
          <div className="flex items-center gap-3 bg-background px-4">
            <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center font-interactive text-interactive text-primary bg-surface">2</div>
            <span className="font-interactive text-interactive text-primary font-bold hidden sm:block">Payment</span>
          </div>
          <div className="flex items-center gap-3 bg-background pl-4">
            <div className="w-8 h-8 rounded-full border-2 border-outline-variant flex items-center justify-center font-interactive text-interactive text-on-surface-variant bg-surface">3</div>
            <span className="font-interactive text-interactive text-on-surface-variant hidden sm:block">Confirmation</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left Side: Forms */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-10">
          
          {/* Guest Details */}
          <section>
            <div className="mb-6">
              <h2 className="font-headline-md text-headline-md text-on-background mb-2">Guest Details</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Please provide the contact details for the primary guest.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps uppercase text-on-surface-variant">First Name *</label>
                <input 
                  required
                  className="bg-transparent border-b border-outline py-2 font-body-md focus:border-primary focus:ring-0 transition-colors duration-300" 
                  placeholder="John" 
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps uppercase text-on-surface-variant">Last Name *</label>
                <input 
                  required
                  className="bg-transparent border-b border-outline py-2 font-body-md focus:border-primary focus:ring-0 transition-colors duration-300" 
                  placeholder="Doe" 
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-label-caps text-label-caps uppercase text-on-surface-variant">Email Address *</label>
                <input 
                  required
                  className="bg-transparent border-b border-outline py-2 font-body-md focus:border-primary focus:ring-0 transition-colors duration-300" 
                  placeholder="john.doe@example.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-label-caps text-label-caps uppercase text-on-surface-variant">Special Requests (Optional)</label>
                <textarea 
                  className="bg-transparent border-b border-outline py-2 font-body-md focus:border-primary focus:ring-0 transition-colors duration-300 resize-none" 
                  placeholder="High floor, extra towels, etc." 
                  rows="3"
                  value={requests}
                  onChange={(e) => setRequests(e.target.value)}
                ></textarea>
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="pt-8 border-t border-outline-variant/30">
            <div className="mb-6">
              <h2 className="font-headline-md text-headline-md text-on-background mb-2">Payment Method</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Your payment is secured with 256-bit encryption.</p>
            </div>
            <div className="space-y-4">
              <div className="p-4 border border-primary bg-surface-container-low flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-full border-4 border-primary bg-background"></div>
                  <div className="flex flex-col">
                    <span className="font-interactive text-interactive text-primary font-bold">Credit or Debit Card</span>
                    <div className="flex gap-2 mt-1">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">credit_card</span>
                      <span className="text-xs text-on-surface-variant">Visa, Mastercard, Amex</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Details fields */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-4">
                <div className="flex flex-col gap-2 md:col-span-4">
                  <label className="font-label-caps text-label-caps uppercase text-on-surface-variant">Card Number *</label>
                  <input 
                    required
                    className="bg-transparent border-b border-outline py-2 font-body-md focus:border-primary focus:ring-0 transition-colors duration-300" 
                    placeholder="0000 0000 0000 0000" 
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label-caps text-label-caps uppercase text-on-surface-variant">Expiry Date *</label>
                  <input 
                    required
                    className="bg-transparent border-b border-outline py-2 font-body-md focus:border-primary focus:ring-0 transition-colors duration-300" 
                    placeholder="MM/YY" 
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label-caps text-label-caps uppercase text-on-surface-variant">CVV *</label>
                  <input 
                    required
                    className="bg-transparent border-b border-outline py-2 font-body-md focus:border-primary focus:ring-0 transition-colors duration-300" 
                    placeholder="123" 
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Action button */}
          <div className="pt-6">
            <button type="submit" className="w-full md:w-auto px-12 py-4 bg-primary text-on-primary font-interactive text-interactive uppercase tracking-widest hover:bg-on-primary-fixed-variant transition-all duration-300">
              Complete Booking
            </button>
            <p className="mt-4 text-xs text-on-surface-variant text-center md:text-left">
              By clicking "Complete Booking", you agree to Lumina Stay's <a className="underline" href="#">Terms of Service</a> and <a className="underline" href="#">Privacy Policy</a>.
            </p>
          </div>

        </form>

        {/* Right Side: Booking Summary Sidebar */}
        <aside className="lg:col-span-5">
          <div className="sticky top-24 border border-outline-variant bg-surface-container-lowest shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] overflow-hidden rounded-xl">
            <div className="h-48 relative">
              <img alt={hotel.name} className="w-full h-full object-cover" src={hotelImg} />
              <div className="absolute top-4 right-4 bg-secondary text-on-secondary text-[10px] font-bold px-2 py-1 tracking-tighter rounded-sm">EDITOR'S CHOICE</div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-headline-sm text-headline-sm text-on-background">{hotel.name}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {hotel.address.city}, {hotel.address.country}
                </p>
              </div>
              <div className="flex flex-col gap-4 border-b border-outline-variant/30 pb-6 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Residence</span>
                  <span className="font-body-md text-body-md text-on-background font-semibold">{room.type} Suite</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Check-in</span>
                  <span className="font-body-md text-body-md text-on-background font-semibold">{checkIn}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Check-out</span>
                  <span className="font-body-md text-body-md text-on-background font-semibold">{checkOut}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Guests</span>
                  <span className="font-body-md text-body-md text-on-background font-semibold">{guests}</span>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-on-surface-variant">
                  <span className="font-body-md text-body-md">{nights} nights x ${(room.discountedPrice || room.pricePerNight).toFixed(2)}</span>
                  <span className="font-body-md text-body-md text-on-background">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span className="font-body-md text-body-md">Service fee</span>
                  <span className="font-body-md text-body-md text-on-background">${serviceFee.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-end pt-6 border-t border-outline-variant">
                <div>
                  <span className="font-headline-sm text-headline-sm text-primary">Total (USD)</span>
                </div>
                <div className="text-right">
                  <span className="font-headline-md text-headline-md text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-3 p-4 bg-surface-container rounded-lg">
                <span className="material-symbols-outlined text-secondary">verified_user</span>
                <div className="flex flex-col">
                  <span className="font-interactive text-interactive text-secondary font-bold">Price Match Guarantee</span>
                  <span className="text-xs text-on-surface-variant">Found it cheaper? We'll match the price.</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
