import React, { useState } from 'react';

export default function RegisterView({ onRegister, onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      alert('You must accept the Terms of Service and Privacy Policy.');
      return;
    }
    onRegister(name, email, password, role);
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-cover bg-center relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80')"
      }}
    >
      {/* Dark tint overlay */}
      <div className="absolute inset-0 bg-[#0b1c30]/45 z-0"></div>

      {/* Logo at Top Left */}
      <div 
        className="absolute top-6 left-6 z-20 cursor-pointer select-none"
        onClick={() => onNavigate('explore')}
      >
        <svg width="240" height="60" viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-md">
          {/* Dotted path */}
          <path 
            d="M 12 38 C 45 10, 110 15, 175 18 C 195 19, 220 23, 228 16" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeDasharray="4 4" 
            strokeLinecap="round" 
          />
          {/* Airplane */}
          <g transform="translate(227, 15) rotate(-15)">
            <path 
              d="M0,0 L-5,-1.5 L-4,-4 L-1,-3 L1,-6.5 L2.5,-6.5 L1,-3 L4,-2 L5,-4 L6.5,-4 L5,-1.5 L6.5,0 L5,0.8 L3.5,0.8 Z" 
              fill="white" 
            />
          </g>
          {/* SANCHAR SATI Text */}
          <text 
            x="5" 
            y="52" 
            fill="white" 
            fontSize="26" 
            fontWeight="900" 
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
            letterSpacing="1"
          >
            SANCHAR SATI
          </text>
        </svg>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center my-auto">
        
        {/* Left Side: Branding & Typography */}
        <div className="md:col-span-7 flex flex-col justify-center text-left text-white px-4 md:px-0">          {/* Heading block */}
          <div className="space-y-4 max-w-lg">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none uppercase filter drop-shadow-lg font-sans">
              Explore<br />Horizons
            </h1>
            <p className="text-lg md:text-xl font-semibold text-white/95 leading-snug filter drop-shadow-sm">
              Where Your Dream Destinations Become Reality.
            </p>
            <p className="text-sm text-white/75 font-light leading-relaxed max-w-sm">
              Embark on a journey where every corner of the world is within your reach.
            </p>
          </div>
        </div>

        {/* Right Side: Frosted Glass Form Card */}
        <div className="md:col-span-5 flex justify-center w-full">
          <div className="w-full max-w-[440px] bg-white/10 backdrop-blur-xl rounded-[32px] border border-white/20 p-6 md:p-8 shadow-2xl flex flex-col relative">
            
            {/* Form Title */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white mb-1">Begin Your Journey</h2>
              <p className="text-xs text-white/75">
                Create an account to access stays and member-only privileges.
              </p>
            </div>

            {/* Role Switcher (Glass Segments) */}
            <div className="flex bg-white/10 p-1 rounded-xl mb-4 border border-white/10">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer ${role === 'USER' ? 'bg-white text-[#0B1C30] shadow-sm' : 'text-white/85 hover:text-white'}`}
              >
                Traveler
              </button>
              <button
                type="button"
                onClick={() => setRole('HOTEL_OWNER')}
                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer ${role === 'HOTEL_OWNER' ? 'bg-white text-[#0B1C30] shadow-sm' : 'text-white/85 hover:text-white'}`}
              >
                Host / Owner
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer ${role === 'ADMIN' ? 'bg-white text-[#0B1C30] shadow-sm' : 'text-white/85 hover:text-white'}`}
              >
                Admin
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name Field */}
              <div className="space-y-0.5">
                <label className="text-white/95 text-xs font-medium block" htmlFor="full_name">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="full_name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white text-[#0B1C30] border border-white/20 rounded-xl py-2.5 px-4 text-xs placeholder:text-[#0B1C30]/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-0.5">
                <label className="text-white/95 text-xs font-medium block" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-white text-[#0B1C30] border border-white/20 rounded-xl py-2.5 px-4 text-xs placeholder:text-[#0B1C30]/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-0.5">
                <label className="text-white/95 text-xs font-medium block" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white text-[#0B1C30] border border-white/20 rounded-xl py-2.5 pl-4 pr-10 text-xs placeholder:text-[#0B1C30]/40 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0B1C30]/60 hover:text-[#0B1C30] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Checkboxes Section */}
              <div className="space-y-2 pt-1 select-none">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 border-white/20 text-[#4F83F6] focus:ring-blue-400 rounded-sm cursor-pointer"
                  />
                  <span className="text-[10px] leading-tight text-white/80 group-hover:text-white transition-colors">
                    I wish to receive curated travel inspiration and exclusive offers.
                  </span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 border-white/20 text-[#4F83F6] focus:ring-blue-400 rounded-sm cursor-pointer"
                  />
                  <span className="text-[10px] leading-tight text-white/80 group-hover:text-white transition-colors">
                    I agree to the{' '}
                    <a className="underline underline-offset-1 hover:text-white font-semibold" href="#" onClick={(e) => e.preventDefault()}>
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a className="underline underline-offset-1 hover:text-white font-semibold" href="#" onClick={(e) => e.preventDefault()}>
                      Privacy Policy
                    </a>.
                  </span>
                </label>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#4F83F6] hover:bg-[#3b6fd8] text-white font-bold text-xs py-3 rounded-xl transition-all duration-300 shadow-md active:scale-[0.99] cursor-pointer uppercase tracking-wider"
                >
                  Create Account
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center py-1.5">
                <div className="flex-grow border-t border-white/20"></div>
                <span className="flex-shrink mx-3 text-[10px] text-white/60">or</span>
                <div className="flex-grow border-t border-white/20"></div>
              </div>

              {/* Google Signup */}
              <button
                type="button"
                className="w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl py-2.5 px-4 text-xs text-white transition-all flex items-center justify-center gap-2 cursor-pointer font-medium"
              >
                <img
                  alt="Google"
                  className="w-3.5 h-3.5"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO-WGKowRbTggmKSPdS04hDwaPNLznkx_ZgXAskAG8A3olgno65ko-FXm5qvnAUQwDJuKmxMFZQWbyeJH-fNlLpdmupPa8QWxdU6pTD48Y7VrYngD8ZQNdjIzyd9dX_By1azoLyG8mEL7J38shIbaGvK-B3H1kcd2vTklMP4P3odVxcpLwADVUxWkBx2d92waFh9DgsApBfJ775KwcpjQ7yp8dhezpuISv60Bgoi_t-pF_rRc73FpV-jelpJiZLPjHUnITX91l8QOG"
                />
                <span>Continue with Google</span>
              </button>
            </form>

            {/* Switch to Login */}
            <div className="text-center mt-4">
              <p className="text-xs text-white/80">
                Already have an account?{' '}
                <a
                  onClick={() => onNavigate('login')}
                  className="text-white font-bold hover:underline cursor-pointer ml-1"
                >
                  Sign In
                </a>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
