import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ExploreView from './components/ExploreView';
import DetailView from './components/DetailView';
import CheckoutView from './components/CheckoutView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import DashboardView from './components/DashboardView';
import AboutView from './components/AboutView';
import ContactView from './components/ContactView';

const BACKEND_URL = 'http://localhost:5000/api/v1';

export default function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('currentPage') || 'explore';
  });
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('dashboardActiveTab') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('dashboardActiveTab', activeTab);
  }, [activeTab]);
  const [selectedHotel, setSelectedHotel] = useState(() => {
    const saved = localStorage.getItem('selectedHotel');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [bookingDetails, setBookingDetails] = useState(() => {
    const saved = localStorage.getItem('bookingDetails');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  // Auth state - initialized synchronously from localStorage to preserve page states on refresh
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('accessToken') || '';
  });

  const [broadcasts, setBroadcasts] = useState([]);

  const fetchBroadcasts = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setBroadcasts([]);
        return;
      }
      const response = await fetch(`${BACKEND_URL}/auth/broadcasts`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBroadcasts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch broadcasts:', error);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchBroadcasts();
      const interval = setInterval(fetchBroadcasts, 30000);
      return () => clearInterval(interval);
    } else {
      setBroadcasts([]);
    }
  }, [user, token]);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', isError: false });

  // Save page state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  // Persist selected hotel details
  useEffect(() => {
    if (selectedHotel) {
      localStorage.setItem('selectedHotel', JSON.stringify(selectedHotel));
    } else {
      localStorage.removeItem('selectedHotel');
    }
  }, [selectedHotel]);

  // Persist active booking details
  useEffect(() => {
    if (bookingDetails) {
      localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
    } else {
      localStorage.removeItem('bookingDetails');
    }
  }, [bookingDetails]);

  const showToast = (message, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast({ show: false, message: '', isError: false });
    }, 4000);
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        setToken(data.data.accessToken);
        showToast('Welcome back to Sanchar Sati!');
        setCurrentPage('dashboard');
      } else {
        showToast(data.message || 'Login failed.', true);
      }
    } catch (error) {
      showToast('Unable to connect to auth server.', true);
    }
  };

  const handleRegister = async (name, email, password, role) => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await response.json();

      if (data.success) {
        showToast('Registration successful! Please sign in.');
        setCurrentPage('login');
      } else {
        showToast(data.message || 'Registration failed.', true);
      }
    } catch (error) {
      showToast('Unable to connect to auth server.', true);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('dashboardActiveTab');
    setActiveTab('dashboard');
    setUser(null);
    setToken('');
    showToast('Signed out successfully.');
    setCurrentPage('explore');
    setSelectedHotel(null);
    setBookingDetails(null);
  };
  const handleSelectHotel = (hotel) => {
    setSelectedHotel(hotel);
    setCurrentPage('detail');
  };

  const handleReserve = (details) => {
    setBookingDetails(details);
    setCurrentPage('checkout');
  };

  const handleCompleteBooking = async (guestDetails) => {
    try {
      const response = await fetch(`${BACKEND_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hotel: selectedHotel._id,
          room: bookingDetails.room._id,
          firstName: guestDetails.firstName,
          lastName: guestDetails.lastName,
          email: guestDetails.email,
          checkIn: bookingDetails.checkIn,
          checkOut: bookingDetails.checkOut,
          guests: bookingDetails.guests,
          nights: bookingDetails.nights,
          subtotal: bookingDetails.subtotal,
          serviceFee: bookingDetails.serviceFee,
          total: bookingDetails.total,
          requests: guestDetails.requests || ''
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Booking completed successfully! Confirmation email has been sent.');
        setCurrentPage('explore');
        setBookingDetails(null);
        setSelectedHotel(null);
      } else {
        showToast(data.message || 'Failed to complete booking.', true);
      }
    } catch (error) {
      showToast('Error connecting to server to complete booking.', true);
    }
  };

  // Condition to decide whether to hide standard navbar & footer (for transactional pages)
  const isAuthPage = currentPage === 'login' || currentPage === 'register';

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-body-md antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Toast Notification */}
      <div 
        id="toastNotification" 
        className={`fixed top-24 right-8 z-50 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-xl luxury-shadow flex items-center gap-3 transition-all duration-300 transform ${toast.show ? 'toast-active' : 'opacity-0 pointer-events-none -translate-y-8'}`}
      >
        <span className={`material-symbols-outlined ${toast.isError ? 'text-error' : 'text-secondary-fixed-dim'}`}>
          {toast.isError ? 'error' : 'check_circle'}
        </span>
        <span className="font-body-sm text-sm">{toast.message}</span>
      </div>
      {/* Navigation Header - hidden on login/register transactional pages */}
      {!isAuthPage && (
        <Navbar 
          user={user} 
          currentPage={currentPage}
          onNavigate={setCurrentPage} 
          onLogout={handleLogout} 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
      {!isAuthPage && broadcasts.length > 0 && (
        <div className="fixed top-[73px] left-0 w-full h-[36px] bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300 border-b border-red-100 dark:border-red-950/30 overflow-hidden marquee-container select-none z-40 shadow-sm flex items-center">
          <div className="animate-marquee font-semibold inline-flex items-center gap-12 text-xs h-full">
            {broadcasts.map((b) => (
              <span key={b._id} className="inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-red-600">campaign</span>
                <span>{b.message}</span>
              </span>
            ))}
            {/* Duplicate to ensure continuous scrolling if only one message */}
            {broadcasts.length === 1 && (
              <span className="inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-red-600">campaign</span>
                <span>{broadcasts[0].message}</span>
              </span>
            )}
          </div>
        </div>
      )}
      {/* Dynamic Content Views */}
      <div className="flex-grow">
        {currentPage === 'explore' && (
          <ExploreView 
            onSelectHotel={handleSelectHotel} 
            showToast={showToast} 
          />
        )}
        {currentPage === 'detail' && (
          <DetailView 
            hotel={selectedHotel} 
            onReserve={handleReserve} 
            onBack={() => setCurrentPage('explore')} 
            showToast={showToast} 
          />
        )}
        {currentPage === 'checkout' && (
          <CheckoutView 
            bookingDetails={bookingDetails} 
            onComplete={handleCompleteBooking} 
            showToast={showToast} 
          />
        )}
        {currentPage === 'login' && (
          <LoginView 
            onLogin={handleLogin} 
            onNavigate={setCurrentPage} 
          />
        )}
        {currentPage === 'register' && (
          <RegisterView 
            onRegister={handleRegister} 
            onNavigate={setCurrentPage} 
          />
        )}
        {currentPage === 'dashboard' && (
          <DashboardView 
            user={user} 
            onNavigate={setCurrentPage} 
            showToast={showToast} 
            onUpdateUser={(updatedUser) => {
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }}
            onBroadcastSent={fetchBroadcasts}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
        {currentPage === 'about' && (
          <AboutView />
        )}
        {currentPage === 'contact' && (
          <ContactView showToast={showToast} />
        )}
      </div>

      {/* Footer - only rendered on the explore page */}
      {currentPage === 'explore' && <Footer />}
    </div>
  );
}
