import React, { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';

interface SignUpProps {
  onAuthSuccess: (user: { name: string; email: string }) => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in all fields.');
      return;
    }
    if (!isLogin && !fullName) {
      alert('Please enter your full name.');
      return;
    }

    // Success login/signup
    onAuthSuccess({
      name: isLogin ? (fullName || 'Admin User') : fullName,
      email: email
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans box-border">
      
      {/* LEFT COLUMN: Eicher DMS Branding Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden select-none">
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80')` 
          }}
        />
        
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-slate-950/70" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-[#184edb] text-white p-2.5 rounded-xl flex items-center justify-center shadow-lg">
            <Shield size={24} />
          </div>
          <span className="text-xl font-extrabold text-white tracking-wide font-heading">
            Eicher DMS
          </span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col gap-4 max-w-lg mb-12">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight font-heading m-0 text-left">
            Empowering Your<br />Workshop Efficiency
          </h1>
          <div className="w-24 h-1.5 bg-[#184edb] rounded-full mt-2" />
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs font-semibold text-slate-400 text-left">
          <span>© {new Date().getFullYear()} Eicher DMS. All rights reserved.</span>
        </div>

      </div>

      {/* RIGHT COLUMN: Form Entry Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 bg-[#fafbfd] relative box-border">
        
        {/* Form Container */}
        <div className="w-full max-w-[420px] flex flex-col gap-8 z-10">
          
          {/* Header text */}
          <div className="flex flex-col gap-2 text-left">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight m-0 font-heading">
              {isLogin ? 'Welcome back, Admin' : 'Create your admin account'}
            </h2>
            <span className="text-[13.5px] font-medium text-slate-400">
              {isLogin ? 'Login to manage your workshop operations.' : 'Start by setting up your primary login credentials.'}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            
            {/* Full Name Input (Only on Sign Up) */}
            {!isLogin && (
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-[13.5px] font-semibold text-slate-700 outline-none focus:border-[#184edb] transition-all shadow-sm box-border"
                  required={!isLogin}
                />
              </div>
            )}

            {/* Business Email Input */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-extrabold text-slate-455 uppercase tracking-widest">
                Business Email
              </label>
              <input
                type="email"
                placeholder="rahul@dealer-eicher.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-[13.5px] font-semibold text-slate-700 outline-none focus:border-[#184edb] transition-all shadow-sm box-border"
                required
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5 text-left relative">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold text-slate-455 uppercase tracking-widest">
                  Password
                </label>
                {isLogin && (
                  <span 
                    onClick={() => alert(`Password reset instructions have been sent to: ${email || 'your email'}`)}
                    className="text-[11px] font-bold text-[#184edb] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative w-full flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 pr-12 text-[13.5px] font-semibold text-slate-700 outline-none focus:border-[#184edb] transition-all shadow-sm box-border"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-650 cursor-pointer border-none bg-transparent flex items-center justify-center p-0"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#184edb] hover:bg-[#133eb5] text-white py-3.5 px-5 rounded-xl text-[14px] font-extrabold border-none cursor-pointer shadow-md transition-all duration-200 mt-2"
            >
              {isLogin ? 'Login' : 'Continue'}
            </button>

          </form>

          {/* Toggle login/signup mode */}
          <div className="text-[13px] font-semibold text-slate-500 text-center">
            {isLogin ? (
              <span>
                Don't have an admin account?{' '}
                <span 
                  onClick={() => setIsLogin(false)}
                  className="text-[#184edb] hover:underline cursor-pointer"
                >
                  Sign up here
                </span>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <span 
                  onClick={() => setIsLogin(true)}
                  className="text-[#184edb] hover:underline cursor-pointer"
                >
                  Login here
                </span>
              </span>
            )}
          </div>

        </div>

        {/* Faint Logo/Grid watermark in bottom right corner */}
        <div className="absolute right-8 bottom-8 text-slate-200/40 pointer-events-none select-none">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M60 0C26.8629 0 0 26.8629 0 60C0 93.1371 26.8629 120 60 120C93.1371 120 120 93.1371 120 60C120 26.8629 93.1371 0 60 0ZM15 60C15 35.1472 35.1472 15 60 15C84.8528 15 105 35.1472 105 60C105 84.8528 84.8528 105 60 105C35.1472 105 15 84.8528 15 60Z" />
            <path d="M45 40H75V80H45V40Z" />
            <path d="M25 55H95V65H25V55Z" />
          </svg>
        </div>

      </div>

    </div>
  );
};

export default SignUp;
