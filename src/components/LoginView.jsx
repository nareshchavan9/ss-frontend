import React, { useState } from 'react';

export default function LoginView({ onLogin, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-cover bg-center relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1920&q=80')"
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
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Welcome Back</h2>
              <p className="text-xs text-white/75">
                Sign in to access your profile, stays, and bookings.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-white/90 text-xs font-medium block" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-white text-[#0B1C30] border border-white/20 rounded-xl py-3 px-4 text-sm placeholder:text-[#0B1C30]/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="text-white/90 text-xs font-medium block" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="**********"
                    className="w-full bg-white text-[#0B1C30] border border-white/20 rounded-xl py-3 pl-4 pr-10 text-sm placeholder:text-[#0B1C30]/40 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0B1C30]/60 hover:text-[#0B1C30] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                
                {/* Forgot Password Link */}
                <div className="text-right pt-1">
                  <a 
                    className="text-xs text-white/80 hover:text-white underline cursor-pointer transition-colors"
                    href="#" 
                    onClick={(e) => e.preventDefault()}
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#4F83F6] hover:bg-[#3b6fd8] text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-300 shadow-md active:scale-[0.99] cursor-pointer uppercase tracking-wider"
                >
                  Sign In
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/20"></div>
                <span className="flex-shrink mx-3 text-xs text-white/60">or</span>
                <div className="flex-grow border-t border-white/20"></div>
              </div>

              {/* Google Login */}
              <button
                type="button"
                className="w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl py-3 px-4 text-sm text-white transition-all flex items-center justify-center gap-2 cursor-pointer font-medium"
              >
                <img
                  alt="Google"
                  className="w-4 h-4"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO-WGKowRbTggmKSPdS04hDwaPNLznkx_ZgXAskAG8A3olgno65ko-FXm5qvnAUQwDJuKmxMFZQWbyeJH-fNlLpdmupPa8QWxdU6pTD48Y7VrYngD8ZQNdjIzyd9dX_By1azoLyG8mEL7J38shIbaGvK-B3H1kcd2vTklMP4P3odVxcpLwADVUxWkBx2d92waFh9DgsApBfJ775KwcpjQ7yp8dhezpuISv60Bgoi_t-pF_rRc73FpV-jelpJiZLPjHUnITX91l8QOG"
                />
                <span>Sign in with Google</span>
              </button>
            </form>

            {/* Switch to Register */}
            <div className="text-center mt-6">
              <p className="text-sm text-white/80">
                Are you new?{' '}
                <a
                  onClick={() => onNavigate('register')}
                  className="text-white font-bold hover:underline cursor-pointer ml-1"
                >
                  Create an Account
                </a>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
