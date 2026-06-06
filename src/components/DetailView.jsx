import React, { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:5000/api/v1';

const mockRooms = [
  {
    _id: '507f1f77bcf86cd799439021',
    roomNumber: '101A',
    type: 'Deluxe',
    description: 'Deluxe Ocean Suite. 45 sqm • King Bed • Ocean View • Private Balcony',
    pricePerNight: 450,
    bedType: 'King',
    size: 45,
    amenities: ['Ocean View', 'Private Balcony', 'King Bed'],
    images: [{ url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-ryRKGtL3Op35Dh1Ty84GNqFYNaHX8-eK_ogCboZ0iNFu0ZD6AL0fVWzHiNcBYWSqXXIgXP232zuJ8VRmhOb9gstaWFzcp9a_W7kQz2RIPdaCSBMIYtijhtiz4JA7J5bH4Qa_riLGaN_B1SBRH8QOcmIX-aAknm6F0E69RDfnCFhQtvfIDH3aBdcnUuL7Aev2oxi3vuz_INfDH2ruOKrDgP-wfTQlbwy-U3EiI4SaIwbhTx8FjEPoO4DPuPLfNfr_tj-fOm3sj5Mv' }]
  },
  {
    _id: '507f1f77bcf86cd799439022',
    roomNumber: '202B',
    type: 'Suite',
    description: 'Executive Horizon Studio. 72 sqm • King Bed • Panoramic View • Smart Concierge',
    pricePerNight: 680,
    bedType: 'King',
    size: 72,
    amenities: ['Panoramic View', 'Smart Concierge', 'King Bed'],
    images: [{ url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmNE5cANX4nEIODMd3lI_fILr_t6a2qnJ85NS5Y5C2T25zZIg4Bv2esuU4XJMnPohwoSU2BUum9eAC0o8AbARmQ_voIlTEkQH3MZR7a47-sECyPmKfQrUGNFh8gF_CoZ7epc9uc7LvFd3Y4fnyumsAkSTre68zevGQ05RCGiSC2GUvCQyZoeAV-sxjR5RLZN7UfrMeJy7ai8ZQyeoa7puSYD8XreoP6kHspxKcl-8DSZ_mjSQ11aovepQjE_yC7cic-9PBYiEB3BL_' }]
  },
  {
    _id: '507f1f77bcf86cd799439023',
    roomNumber: 'PH01',
    type: 'Suite',
    description: 'The Azure Penthouse. 120 sqm • Private Terrace • Butler Service • Premium Bar',
    pricePerNight: 1200,
    bedType: 'King',
    size: 120,
    amenities: ['Private Terrace', 'Butler Service', 'Premium Bar', 'King Bed'],
    images: [{ url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCi7-iyMZxr9arIQ51fcUY3PrxRDNKwfECYTqcoCKTV9HwWBnMnICyyRb5ipYdPgxGIyn-pfBGeA9mwHDMDYzRwQV4QeikFmc4ZKotxFOnlNic3wRjNqg1dzjRHv7Ib9_Fwmv0aTKpcfXiHBQmW7M-YsIAgtdHzD6JZz2hd-mXJmDDcdrZv_qD-SevexR5VEm6Gdaeqd1Yi-HwXps1ZPlR181IysEkmG5NNHcYRgjhs1S4QKpV8KkVDEFassH-ghx7I4lGT70xRMtSd' }]
  }
];

export default function DetailView({ hotel, onReserve, onBack, showToast }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState('2026-06-10');
  const [checkOut, setCheckOut] = useState('2026-06-15');
  const [guests, setGuests] = useState('2 Adults');
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const checkWishlistStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const found = data.data.some(item => item.hotel?._id === hotel._id);
        setIsWishlisted(found);
      }
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
    }
  };

  useEffect(() => {
    checkWishlistStatus();
  }, [hotel._id]);

  const handleToggleWishlist = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      showToast('Please sign in to add properties to your wishlist.', true);
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ hotelId: hotel._id })
      });
      const data = await response.json();
      if (data.success) {
        const toggled = data.data.toggled;
        setIsWishlisted(toggled);
        showToast(toggled ? 'Added to wishlist.' : 'Removed from wishlist.', false);
      } else {
        showToast(data.message || 'Failed to update wishlist.', true);
      }
    } catch (error) {
      showToast('Error updating wishlist.', true);
    }
  };

  // Fetch Rooms for this Hotel
  useEffect(() => {
    async function fetchRooms() {
      setIsLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/hotels/${hotel._id}/rooms`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
          setRooms(result.data);
          setSelectedRoom(result.data[0]); // Select first room by default
        } else {
          setRooms(mockRooms);
          setSelectedRoom(mockRooms[0]);
        }
      } catch (error) {
        console.warn('Backend connection failed, using mock room list.');
        setRooms(mockRooms);
        setSelectedRoom(mockRooms[0]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRooms();
  }, [hotel._id]);

  // Calculate duration in nights
  const getNightsCount = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;
  };

  const nights = getNightsCount();
  const pricePerNight = selectedRoom ? (selectedRoom.discountedPrice || selectedRoom.pricePerNight) : 0;
  const subtotal = pricePerNight * nights;
  const serviceFee = Math.round(subtotal * 0.06);
  const total = subtotal + serviceFee;

  const handleReserve = () => {
    if (!selectedRoom) {
      showToast('Please select a room to reserve.', true);
      return;
    }
    onReserve({
      hotel,
      room: selectedRoom,
      checkIn,
      checkOut,
      guests,
      nights,
      subtotal,
      serviceFee,
      total
    });
  };

  const images = hotel.images && hotel.images.length > 0 ? hotel.images : mockRooms[0].images;

  return (
    <main className="pt-[110px] pb-section-gap">
      {/* Back button */}
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 font-interactive text-interactive text-on-surface-variant hover:text-primary transition-colors py-2"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to Listings</span>
        </button>
      </div>

      {/* Masonry Image Gallery */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="masonry-grid overflow-hidden rounded-xl">
          <div className="masonry-item-main relative group overflow-hidden bg-surface-container-high">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={images[0]?.url} alt={hotel.name} />
          </div>
          <div className="relative group overflow-hidden bg-surface-container-high">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={images[1]?.url || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'} alt="Room detail" />
          </div>
          <div className="relative group overflow-hidden bg-surface-container-high">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={images[2]?.url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'} alt="Bathroom detail" />
          </div>
          <div className="relative group overflow-hidden col-span-1 md:col-span-2 bg-surface-container-high">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={images[3]?.url || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'} alt="Interior detail" />
          </div>
        </div>
      </section>

      {/* Main Details and Booking Sidebar */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mt-section-gap">
        <div className="flex flex-col lg:flex-row gap-gutter">
          
          {/* Left Column (Details) */}
          <div className="w-full lg:w-2/3 space-y-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-secondary-container text-on-secondary-container text-label-caps font-label-caps px-3 py-1 rounded-sm uppercase">Editor's Choice</span>
                <div className="flex text-secondary">
                  {[...Array(hotel.starRating || 5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-start mb-6 gap-4">
                <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg leading-tight">{hotel.name}</h1>
                <button
                  onClick={handleToggleWishlist}
                  className="w-12 h-12 bg-surface-container-low border border-outline-variant/30 rounded-full flex items-center justify-center text-error material-symbols-outlined cursor-pointer shadow-sm hover:bg-surface-container transition-colors flex-shrink-0"
                  style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  favorite
                </button>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl leading-relaxed">
                {hotel.description || 'Experience ultimate luxury in a pristine, secluded shoreline sanctuary carefully designed to maximize privacy, cleanliness, and peace.'}
              </p>
            </div>

            {/* Amenities Grid */}
            <div>
              <h3 className="font-headline-sm text-headline-sm mb-8 border-b border-outline-variant/30 pb-4">Premier Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {hotel.amenities && hotel.amenities.length > 0 ? (
                  hotel.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">
                          {amenity.toLowerCase().includes('pool') ? 'pool' : 
                           amenity.toLowerCase().includes('spa') ? 'spa' : 
                           amenity.toLowerCase().includes('dining') || amenity.toLowerCase().includes('food') ? 'restaurant' : 
                           amenity.toLowerCase().includes('gym') || amenity.toLowerCase().includes('fitness') ? 'fitness_center' : 
                           amenity.toLowerCase().includes('wifi') ? 'wifi' : 'check_circle'}
                        </span>
                      </div>
                      <span className="font-body-md text-body-md">{amenity}</span>
                    </div>
                  ))
                ) : (
                  ['Pool', 'Wellness Spa', 'Fine Dining', 'Gymnasium'].map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">
                          {idx === 0 ? 'pool' : idx === 1 ? 'spa' : idx === 2 ? 'restaurant' : 'fitness_center'}
                        </span>
                      </div>
                      <span className="font-body-md text-body-md">{amenity}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Available Residences */}
            <div>
              <h3 className="font-headline-sm text-headline-sm mb-8 border-b border-outline-variant/30 pb-4">Available Residences</h3>
              <div className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-6 text-on-surface-variant font-interactive">Loading residences...</div>
                ) : (
                  rooms.map(room => {
                    const isSelected = selectedRoom && selectedRoom._id === room._id;
                    const rImg = room.images && room.images.length > 0 ? room.images[0].url : 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';
                    return (
                      <div 
                        key={room._id} 
                        className={`group bg-surface-container-lowest border p-2 rounded-xl flex flex-col md:flex-row gap-6 transition-all hover:shadow-lg ${isSelected ? 'border-primary ring-1 ring-primary' : 'border-outline-variant'}`}
                      >
                        <div className="w-full md:w-64 h-48 overflow-hidden rounded-lg">
                          <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={rImg} alt={room.type} />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-2 pr-4">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="font-headline-sm text-headline-sm">{room.type} Suite ({room.roomNumber})</h4>
                              <span className="text-secondary font-bold text-lg">
                                {room.discountedPrice ? (
                                  <>
                                    <span className="line-through text-outline mr-2 text-sm">${room.pricePerNight}</span>
                                    <span>${room.discountedPrice} / night</span>
                                  </>
                                ) : (
                                  <span>${room.pricePerNight} / night</span>
                                )}
                              </span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                              {room.description || `${room.size || 40} sqm • ${room.bedType} Bed • Capacity: ${room.capacity?.adults || 2} Adults`}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-on-secondary-fixed-variant text-label-caps bg-secondary-fixed px-2 py-1 rounded">
                              {room.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                            <button 
                              className={`font-interactive text-interactive px-6 py-3 rounded transition-opacity ${isSelected ? 'bg-outline-variant text-on-surface cursor-default' : 'bg-primary text-on-primary hover:opacity-90'}`}
                              onClick={() => setSelectedRoom(room)}
                              disabled={isSelected}
                            >
                              {isSelected ? 'Selected' : 'Select Room'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Guest Experiences */}
            <div>
              <h3 className="font-headline-sm text-headline-sm mb-8 border-b border-outline-variant/30 pb-4">Guest Experiences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-surface-container-low rounded-lg italic">
                  <p className="font-body-md text-on-surface mb-4">"A transcendent stay. The attention to minimalist detail and the sheer quality of service at the Pavilion is unmatched. Truly the luxury of space."</p>
                  <div className="flex items-center gap-3 not-italic">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-bold">EM</div>
                    <div>
                      <p className="font-interactive text-interactive">Elena Moretti</p>
                      <p className="text-xs text-on-surface-variant">Stayed Dec 2023</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-surface-container-low rounded-lg italic">
                  <p className="font-body-md text-on-surface mb-4">"Waking up to the horizon in the Executive Studio was a life-changing experience. Every piece of furniture feels like art."</p>
                  <div className="flex items-center gap-3 not-italic">
                    <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center font-bold">JW</div>
                    <div>
                      <p className="font-interactive text-interactive">Julian West</p>
                      <p className="text-xs text-on-surface-variant">Stayed Jan 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Quick Reservation Sidebar Widget) */}
          <div className="w-full lg:w-1/3">
            <div className="sticky sticky-sidebar bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
              <h4 className="font-headline-sm text-headline-sm mb-6">Quick Reservation</h4>
              <div className="space-y-4 mb-8">
                <div className="flex flex-col gap-1 border-b border-outline-variant pb-4">
                  <label className="text-label-caps font-label-caps text-on-surface-variant">CHECK-IN</label>
                  <input 
                    className="bg-transparent border-none p-0 focus:ring-0 font-body-lg text-primary w-full" 
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1 border-b border-outline-variant pb-4">
                  <label className="text-label-caps font-label-caps text-on-surface-variant">CHECK-OUT</label>
                  <input 
                    className="bg-transparent border-none p-0 focus:ring-0 font-body-lg text-primary w-full" 
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1 border-b border-outline-variant pb-4">
                  <label className="text-label-caps font-label-caps text-on-surface-variant">GUESTS</label>
                  <select 
                    className="bg-transparent border-none p-0 focus:ring-0 font-body-lg text-primary w-full cursor-pointer"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    <option value="1 Adult">1 Adult</option>
                    <option value="2 Adults">2 Adults</option>
                    <option value="3 Adults">3 Adults</option>
                    <option value="4 Adults">4 Adults</option>
                  </select>
                </div>
              </div>

              {selectedRoom ? (
                <>
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between font-body-md">
                      <span className="text-on-surface-variant">${pricePerNight} x {nights} nights</span>
                      <span>${subtotal}</span>
                    </div>
                    <div className="flex justify-between font-body-md">
                      <span className="text-on-surface-variant">Service Fee (6%)</span>
                      <span>${serviceFee}</span>
                    </div>
                    <div className="flex justify-between font-body-lg font-bold border-t border-outline-variant pt-4 mt-4">
                      <span>Total Price</span>
                      <span>${total}</span>
                    </div>
                  </div>
                  <button 
                    className="w-full bg-primary text-on-primary py-4 rounded font-interactive text-interactive hover:bg-on-surface/90 transition-all shadow-md"
                    onClick={handleReserve}
                  >
                    Reserve Residence
                  </button>
                  <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-4">You won't be charged yet</p>
                </>
              ) : (
                <div className="text-center py-4 text-on-surface-variant">Please select a residence from the list to view reservation prices.</div>
              )}

              <div className="mt-8 pt-8 border-t border-outline-variant flex gap-4 items-center">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <span className="text-xs text-on-surface-variant">Sanchar Sati Guaranteed: Best price &amp; priority concierge.</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
