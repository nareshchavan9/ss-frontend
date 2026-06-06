import React, { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:5000/api/v1';

// Dynamic high-quality mock data for fallback
const mockHotels = [
  {
    _id: '507f1f77bcf86cd799439013',
    name: 'The Azure Pavilion',
    description: 'An architectural masterpiece nestled on the edge of the sapphire coast. The Azure Pavilion offers an unparalleled sanctuary where modernist design meets the raw beauty of the shoreline.',
    starRating: 5,
    averageRating: 4.9,
    totalReviews: 124,
    address: { city: 'North Malé Atoll', country: 'Maldives' },
    amenities: ['Pool', 'Spa', 'Fine Dining', 'Gym'],
    images: [{
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9Vyd3zQJN1bsCNKoybmYimsRCAq4TiAnKxiaqh1tcMlPVY7aNOPYRwgFXRbTaeSpkaMj8mB00aVDOhHB22Bof42UqGsjl1uLTw8In7Go72mHJqN37gl90Hbxv-kw1Cy6Y7Z7DA6bizRTOX4_vpsd92ctV-QwDIrbiF0YD-sAV57gIEaOJ-MfvrQR2vYq-RjXmZSDOMu5Jb7YHjKnyqOgemQr44H47whXskMTKjJDNIIohdAKKTu-dJKleALPZvf0TqDcgkz5ZIdmC',
      public_id: 'azure_main'
    }]
  },
  {
    _id: '507f1f77bcf86cd799439014',
    name: 'Ubud Jungle Sanctuary',
    description: 'A lush, tropical infinity pool overlooking a deep jungle ravine in Bali.',
    starRating: 5,
    averageRating: 4.8,
    totalReviews: 86,
    address: { city: 'Ubud', country: 'Bali' },
    amenities: ['Pool', 'Yoga Deck', 'Vegan Café', 'Spa'],
    images: [{
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTeSYgVJsR2M43ZeW5B9OXpbP3xjRfmrA3RntvlQmvv003SxSUaDtGkm0sZjP6oSOAeuUl9Xa05VXfOG6l-NyhDVWnIgjorGpQ9PZvDgnZG96jj24_zdoByQ19oMDjClv4BAxR94iMjtzUZfwCO8ljdytaAjpjZsl1DbeU2eFlv7_7j2YY1fCYQW6QEptQnjbQiRoLWToynGRm5dQJoLwK760EyJig41YmorlbSpvd88Yw8sZw4NDzTzyfgubq22E9OTlS9w4CegRz',
      public_id: 'ubud_main'
    }]
  },
  {
    _id: '507f1f77bcf86cd799439015',
    name: 'Kyoto Zen Ryokan',
    description: 'A traditional Zen garden ryokan featuring cedar pavilions and hot spring baths.',
    starRating: 4,
    averageRating: 4.7,
    totalReviews: 92,
    address: { city: 'Kyoto', country: 'Japan' },
    amenities: ['Onsen', 'Zen Garden', 'Tea Room', 'WiFi'],
    images: [{
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlq-dUnLZPnueEBM7ijYAofJ0D6gmR6EjQ8v2hdua-4yr4DhsbFLSm48lGWbxZK2cNZhrkWaKwlIiOQrALHLy2iwb12BN4nyyO5Font4z_jCsc1BP5dqWWfzwiL2Hmq_O1Skso3b_F53roZHVUg6SpYjRGWhdf-kMh98upPKR1b_QWZsGJpGec0LWB7QRu4k5nmVGOPo0P-Ps0nAui-slMY8AEyjMFMrIPMsJ0sPWidNuMwoFgBCMnTDpsfFrRjLqAxhhqAE5mJxtb',
      public_id: 'kyoto_main'
    }]
  }
];

export default function ExploreView({ onSelectHotel, showToast }) {
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [guests, setGuests] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState([]);

  const fetchWishlistIds = async () => {
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
        setWishlistedIds(data.data.map(item => item.hotel?._id).filter(Boolean));
      }
    } catch (error) {
      console.error('Failed to fetch wishlist ids:', error);
    }
  };

  useEffect(() => {
    fetchWishlistIds();
  }, []);

  const handleToggleWishlist = async (hotelId, e) => {
    if (e) e.stopPropagation();
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
        body: JSON.stringify({ hotelId })
      });
      const data = await response.json();
      if (data.success) {
        const toggled = data.data.toggled;
        if (toggled) {
          setWishlistedIds(prev => [...prev, hotelId]);
          showToast('Added to wishlist.', false);
        } else {
          setWishlistedIds(prev => prev.filter(id => id !== hotelId));
          showToast('Removed from wishlist.', false);
        }
      } else {
        showToast(data.message || 'Failed to update wishlist.', true);
      }
    } catch (error) {
      showToast('Error updating wishlist.', true);
    }
  };

  const handleSearch = async () => {
    const city = destination.trim();
    if (!city) {
      showToast('Please enter a destination to search.', true);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch(`${BACKEND_URL}/hotels?city=${encodeURIComponent(city)}`);
      const result = await response.json();

      if (result.success && result.data && result.data.hotels && result.data.hotels.length > 0) {
        setSearchResults(result.data.hotels);
      } else {
        const matches = mockHotels.filter(hotel => 
          hotel.address.city.toLowerCase().includes(city.toLowerCase()) ||
          hotel.address.country.toLowerCase().includes(city.toLowerCase())
        );
        setSearchResults(matches);
        if (matches.length === 0) {
          showToast(`No live stays found in "${city}". Showing available local catalog.`, false);
          setSearchResults(mockHotels);
        }
      }
    } catch (error) {
      console.warn('Backend connection failed, using mock catalog.');
      const matches = mockHotels.filter(hotel => 
        hotel.address.city.toLowerCase().includes(city.toLowerCase()) ||
        hotel.address.country.toLowerCase().includes(city.toLowerCase())
      );
      setSearchResults(matches.length > 0 ? matches : mockHotels);
    } finally {
      setIsSearching(false);
      setTimeout(() => {
        const section = document.getElementById('searchResultsSection');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleViewAllCollections = async () => {
    setIsSearching(true);
    setHasSearched(true);
    setDestination(''); // Clear search input to show we are viewing all

    try {
      const response = await fetch(`${BACKEND_URL}/hotels?limit=50`);
      const result = await response.json();

      if (result.success && result.data && result.data.hotels && result.data.hotels.length > 0) {
        setSearchResults(result.data.hotels);
      } else {
        setSearchResults(mockHotels);
      }
    } catch (error) {
      console.warn('Backend connection failed, using mock catalog.');
      setSearchResults(mockHotels);
    } finally {
      setIsSearching(false);
      setTimeout(() => {
        const section = document.getElementById('searchResultsSection');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <header className="relative h-[921px] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Mountain Resort" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCP4Dfw9sRdmCY0cdRsb_DQVbX1x4XaBmyHGXUnMxoS8VL5dvnK-vmxxsj8yfRtxTWjAuvoRnoq5VmqCtxVtpyIKODFYFhaaZxp1A_K0voNvebt2EttvZSVUOrHRWp9MEIOy7ZX8X8Auyb9-4fasIqk-AbxEtDOe9ky064Zo3XUndTWMjrBYO97GiLONUFEEL7G76Q6Pi88MgrOUYG5eswzfbf3DapQ6iPPqW_Vh5TPMIQuz15Srl2w0BZ6fuFFJ5wX8iBtsQ3lCaYB"
          />
          <div className="absolute inset-0 hero-gradient"></div>
        </div>
        <div className="relative z-10 w-full max-w-4xl px-margin-mobile text-center">
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-white mb-12 drop-shadow-lg">
            The Luxury of Space.
          </h1>
          {/* Search Interface */}
          <div className="bg-surface-container-lowest p-2 md:p-4 rounded-xl luxury-shadow flex flex-col md:flex-row items-stretch gap-2 transition-all duration-300 focus-within:scale-[1.01] focus-within:shadow-2xl">
            <div className="flex-1 flex flex-col items-start px-4 py-2 border-b md:border-b-0 md:border-r border-outline-variant/30 focus-within:bg-surface-container-low focus-within:ring-1 focus-within:ring-primary/10 rounded-lg transition-all duration-300">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Destination</span>
              <input 
                id="destinationInput" 
                className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-on-surface placeholder:text-outline outline-none" 
                placeholder="Where to next? (e.g. Goa, Kyoto)" 
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div className="flex-1 flex flex-col items-start px-4 py-2 border-b md:border-b-0 md:border-r border-outline-variant/30 focus-within:bg-surface-container-low focus-within:ring-1 focus-within:ring-primary/10 rounded-lg transition-all duration-300">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Check-in / Out</span>
              <input 
                id="datesInput" 
                className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-on-surface placeholder:text-outline outline-none" 
                placeholder="Add dates" 
                type="text"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
              />
            </div>
            <div className="flex-1 flex flex-col items-start px-4 py-2 focus-within:bg-surface-container-low focus-within:ring-1 focus-within:ring-primary/10 rounded-lg transition-all duration-300">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Guests</span>
              <input 
                id="guestsInput" 
                className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-on-surface placeholder:text-outline outline-none" 
                placeholder="How many?" 
                type="text"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>
            <button 
              id="searchBtn" 
              className="bg-primary text-white px-8 py-4 md:py-2 font-interactive text-interactive hover:opacity-90 transition-opacity rounded-lg cursor-pointer"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>
      </header>

      {/* Search Results Section */}
      <section 
        id="searchResultsSection" 
        className={`max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap border-b border-outline-variant/30 ${hasSearched ? '' : 'hidden'}`}
      >
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="font-label-caps text-label-caps text-secondary mb-2 block">Exclusive Matches</span>
            <h2 className="font-headline-md text-headline-md text-on-background">Search Results</h2>
          </div>
          <button 
            className="font-interactive text-interactive text-error border-b border-error pb-1"
            onClick={() => {
              setHasSearched(false);
              setDestination('');
            }}
          >
            Clear Results
          </button>
        </div>
        <div id="searchResultsGrid" className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {isSearching ? (
            <div className="col-span-full text-center py-12 text-on-surface-variant font-interactive">Finding the luxury of space...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map(hotel => {
              const imgUrl = hotel.images && hotel.images.length > 0 
                ? hotel.images[0].url 
                : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
              return (
                <div 
                  key={hotel._id} 
                  className="group cursor-pointer relative"
                  onClick={() => onSelectHotel(hotel)}
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-lg mb-4 bg-surface-container-high relative">
                    <img src={imgUrl} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-primary flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontSize: '14px' }}>star</span>
                      <span>{hotel.starRating} Stars</span>
                    </div>
                    <button
                      onClick={(e) => handleToggleWishlist(hotel._id, e)}
                      className="absolute top-4 left-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-error material-symbols-outlined cursor-pointer shadow-sm z-10"
                      style={{ fontVariationSettings: wishlistedIds.includes(hotel._id) ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </button>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline-sm text-lg text-on-background mb-1">{hotel.name}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant" style={{ fontSize: '16px' }}>location_on</span>
                        <span>{hotel.address.city}, {hotel.address.country}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-label-caps text-secondary block" style={{ fontSize: '10px' }}>Rating</span>
                      <span className="font-bold text-primary">{hotel.averageRating || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 text-on-surface-variant">No matching listings found. Try searching Kyoto or Goa!</div>
          )}
        </div>
      </section>

      {/* Featured Collections */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap border-b border-outline-variant/30">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="font-label-caps text-label-caps text-secondary mb-2 block">Curated Selections</span>
            <h2 className="font-headline-md text-headline-md text-on-background">Featured Collections</h2>
          </div>
          <button 
            className="hidden md:flex items-center gap-2 font-interactive text-interactive text-primary border-b border-primary pb-1 bg-transparent border-t-0 border-x-0 cursor-pointer outline-none"
            onClick={handleViewAllCollections}
          >
            View All Collections
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {mockHotels.map(hotel => {
            const isWishlisted = wishlistedIds.includes(hotel._id);
            return (
              <div key={hotel._id} className="group cursor-pointer relative" onClick={() => onSelectHotel(hotel)}>
                <div className="aspect-[4/5] overflow-hidden rounded-lg mb-4 relative bg-surface-container-high">
                  <img 
                    alt={hotel.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    src={hotel.images[0].url}
                  />
                  <button
                    onClick={(e) => handleToggleWishlist(hotel._id, e)}
                    className="absolute top-4 left-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-error material-symbols-outlined cursor-pointer shadow-sm z-10"
                    style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </button>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-background mb-1">{hotel.name}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{hotel.address.city}, {hotel.address.country}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="bg-surface-container-low py-section-gap">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-12 text-center">
            <span className="font-label-caps text-label-caps text-secondary mb-2 block">Global Inspiration</span>
            <h2 className="font-headline-md text-headline-md text-on-background">Trending Destinations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-gutter h-auto md:h-[800px]">
            <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-lg cursor-pointer">
              <img alt="Bali" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTeSYgVJsR2M43ZeW5B9OXpbP3xjRfmrA3RntvlQmvv003SxSUaDtGkm0sZjP6oSOAeuUl9Xa05VXfOG6l-NyhDVWnIgjorGpQ9PZvDgnZG96jj24_zdoByQ19oMDjClv4BAxR94iMjtzUZfwCO8ljdytaAjpjZsl1DbeU2eFlv7_7j2YY1fCYQW6QEptQnjbQiRoLWToynGRm5dQJoLwK760EyJig41YmorlbSpvd88Yw8sZw4NDzTzyfgubq22E9OTlS9w4CegRz"/>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                <h4 className="font-headline-md text-white">Ubud, Bali</h4>
                <p className="text-white/80 font-body-sm mt-2">124 Exclusive Stays</p>
              </div>
            </div>
            <div className="md:col-span-2 relative group overflow-hidden rounded-lg cursor-pointer h-[300px] md:h-auto">
              <img alt="Kyoto" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlq-dUnLZPnueEBM7ijYAofJ0D6gmR6EjQ8v2hdua-4yr4DhsbFLSm48lGWbxZK2cNZhrkWaKwlIiOQrALHLy2iwb12BN4nyyO5Font4z_jCsc1BP5dqWWfzwiL2Hmq_O1Skso3b_F53roZHVUg6SpYjRGWhdf-kMh98upPKR1b_QWZsGJpGec0LWB7QRu4k5nmVGOPo0P-Ps0nAui-slMY8AEyjMFMrIPMsJ0sPWidNuMwoFgBCMnTDpsfFrRjLqAxhhqAE5mJxtb"/>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h4 className="font-headline-sm text-white">Kyoto, Japan</h4>
                <p className="text-white/80 font-body-sm mt-1">86 Curated Ryokans</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-lg cursor-pointer h-[300px] md:h-auto">
              <img alt="Santorini" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRAOwY8eGHhRuGSQT-InYFS6ngh8LUB2aD6QVRQvfDIs_3N80oTV-P6W3Y77LpO8ZMhIInOanTnwOFNfoXymXrm0M3HpSEL9KqghmhLUTx7AGDF9Eq4WGgDZJALDaJG9rNoo0JRw1RbhuR1eLF6rHz9Ua7hLTcEf8k0EazR_0NlJRS2tTe1mKGrw4lqq3vRPWzE6Rwb4JCioZBhusH7l8mu6_-WgsIKZ-nsOxgcxZ59VG9ooiLhdGBqwGTGEG8_bQf7Lp-E6sURxbL"/>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h4 className="font-body-lg text-white font-bold">Santorini, Greece</h4>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-lg cursor-pointer h-[300px] md:h-auto">
              <img alt="Swiss Alps" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATmn0ZVTuqqxGe5ZYgE7QNmgtuGUXuJyjzaNHpb6mw8J6TtxrD1Lks3a1tP0H-y1m2n46CuMrIdsduwhcjoPCfgSJAtjdnSTbaER-5zrD0Hi41irORwMKz_TmxiCUJ1BQUxILyoA7WXL2X6C4Ysce7f4JzWCh1veB4zYNOJCJ_bXxu3Hz00mYsYEj-YcVe9SxY8D1-Hec1PvHqQQmVKepJ_MAjin6m01NG-z2zP_OKNCwEMh9hzNQBoitU4HrRWSm7JqKZHZaUw5I_"/>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h4 className="font-body-lg text-white font-bold">Zermatt, Switzerland</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
        <div className="flex flex-col md:flex-row gap-16">
          <div className="flex-1">
            <span className="font-label-caps text-label-caps text-secondary mb-4 block">The Sanchar Sati Way</span>
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-background mb-8">Service defined by silence and speed.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-12">We believe luxury is found in the details that go unnoticed—the seamless check-in, the perfectly tempered room, and the intuitive assistance of a personal concierge.</p>
            <button className="border border-primary text-primary px-10 py-4 font-interactive text-interactive hover:bg-primary hover:text-white transition-all">Learn About Membership</button>
          </div>
          <div className="flex-[1.5] grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="p-8 border border-outline-variant/30 rounded-lg luxury-shadow">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">concierge</span>
              <h3 className="font-headline-sm text-headline-sm text-on-background mb-4">24/7 Digital Concierge</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Instant access to local recommendations, private transport, and bespoke dining arrangements through our secure platform.</p>
            </div>
            <div className="p-8 border border-outline-variant/30 rounded-lg luxury-shadow">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">verified_user</span>
              <h3 className="font-headline-sm text-headline-sm text-on-background mb-4">Curated Quality</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Every property in our collection is personally inspected by our team to ensure it meets our rigorous standards for design and service.</p>
            </div>
            <div className="p-8 border border-outline-variant/30 rounded-lg luxury-shadow">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">loyalty</span>
              <h3 className="font-headline-sm text-headline-sm text-on-background mb-4">Member Perks</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Unlock complimentary upgrades, early check-ins, and late check-outs at any of our partner properties worldwide.</p>
            </div>
            <div className="p-8 border border-outline-variant/30 rounded-lg luxury-shadow bg-primary text-white">
              <span className="material-symbols-outlined text-white text-4xl mb-6">workspace_premium</span>
              <h3 className="font-headline-sm text-headline-sm mb-4">Carbon Neutral</h3>
              <p className="font-body-sm text-body-sm text-white/80">Every booking includes a contribution to global reforestation and sustainable energy projects at no extra cost to you.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
