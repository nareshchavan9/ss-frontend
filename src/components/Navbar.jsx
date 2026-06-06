import React from 'react';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

export default function Navbar({ 
  user, 
  currentPage,
  onNavigate, 
  onLogout,
  activeTab,
  setActiveTab
}) {
  const getLinkClass = (page) => {
    const isActive = currentPage === page;
    return `font-interactive text-interactive transition-colors duration-300 relative py-2 cursor-pointer ${
      isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-primary'
    }`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/85 glass-nav border-b border-outline-variant/30 shadow-sm transition-all duration-300 ease-in-out">
      <div className="grid grid-cols-1 md:grid-cols-3 items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto gap-4 md:gap-0">
        
        {/* Left Side: Logo */}
        <div className="flex justify-center md:justify-start">
          <a 
            className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary tracking-tighter cursor-pointer" 
            onClick={() => onNavigate('explore')}
          >
            Sanchar Sati
          </a>
        </div>

        {/* Center: Centered Navigation Links */}
        <div className="flex justify-center items-center gap-6 md:gap-8 flex-wrap">
          <a 
            className={getLinkClass('explore')} 
            onClick={() => onNavigate('explore')}
          >
            Explore
            {currentPage === 'explore' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
            )}
          </a>
          <a 
            className={getLinkClass('about')} 
            onClick={() => onNavigate('about')}
          >
            About Us
            {currentPage === 'about' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
            )}
          </a>
          <a 
            className={getLinkClass('contact')} 
            onClick={() => onNavigate('contact')}
          >
            Contact
            {currentPage === 'contact' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
            )}
          </a>
          <a 
            className={getLinkClass('dashboard')} 
            onClick={() => {
              if (user) {
                if (user.role === 'USER') {
                  setActiveTab('bookings');
                } else {
                  setActiveTab('dashboard');
                }
                onNavigate('dashboard');
              } else {
                setActiveTab('bookings');
                onNavigate('login');
              }
            }}
          >
            {user && user.role === 'ADMIN' ? 'Admin Panel' : user && user.role === 'HOTEL_OWNER' ? 'Host Portal' : 'My Bookings'}
            {(currentPage === 'dashboard' || currentPage === 'checkout') && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
            )}
          </a>
        </div>

        {/* Right Side: User Actions */}
        <div className="flex justify-center md:justify-end items-center gap-6">
          {user ? (
            <>
              <span 
                className="font-body-sm text-sm text-on-surface font-semibold cursor-pointer hover:underline"
                onClick={() => {
                  setActiveTab('dashboard');
                  onNavigate('dashboard');
                }}
              >
                Hello, {user.name}
              </span>
              <button 
                className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors text-error cursor-pointer outline-none border-none"
                onClick={onLogout}
                title="Sign Out"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
              {/* User Avatar Circle */}
              <div 
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm cursor-pointer hover:bg-primary/20 transition-all overflow-hidden border border-outline-variant/30 select-none"
                onClick={() => {
                  setActiveTab('dashboard');
                  onNavigate('dashboard');
                }}
                title="Go to Dashboard"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  getInitials(user.name)
                )}
              </div>
            </>
          ) : (
            <button 
              className="font-interactive text-interactive text-on-surface-variant hover:text-primary transition-colors duration-300 cursor-pointer"
              onClick={() => onNavigate('login')}
            >
              Sign In
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}

