import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  MapPin,
  PhoneCall,
  Upload,
  Save,
  CheckCircle2,
  X,
  Loader2,
  Trash2
} from 'lucide-react';

export interface SettingsPageProps {
  onSettingsUpdated?: (updatedData?: any) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onSettingsUpdated }) => {
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Form states initialized with local storage if present
  const getInitialValue = (key: string, defaultVal: string) => {
    try {
      const saved = localStorage.getItem('dms_company_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed[key] !== undefined) return parsed[key];
      }
    } catch (e) {}
    return defaultVal;
  };

  const [companyName, setCompanyName] = useState(() => getInitialValue('companyName', 'AutoPro Elite Motors'));
  const [dealerName, setDealerName] = useState(() => getInitialValue('dealerName', 'Alexander Sterling'));
  const [gstNumber, setGstNumber] = useState(() => getInitialValue('gstNumber', '22AAAAA0000A1Z5'));
  const [panNumber, setPanNumber] = useState(() => getInitialValue('panNumber', 'ABCDE1234F'));
  
  const [streetAddress, setStreetAddress] = useState(() => getInitialValue('streetAddress', 'Industrial Park West, Sector 12, Block C'));
  const [city, setCity] = useState(() => getInitialValue('city', 'Automotive City'));
  const [stateName, setStateName] = useState(() => getInitialValue('stateName', 'California'));
  const [pinCode, setPinCode] = useState(() => getInitialValue('pinCode', '90210'));

  const [mobileNumber, setMobileNumber] = useState(() => getInitialValue('mobileNumber', '+1 (555) 012-3456'));
  const [phoneNum, setPhoneNum] = useState(() => getInitialValue('phoneNum', '+1 (555) 987-6543'));
  const [emailAddress, setEmailAddress] = useState(() => getInitialValue('emailAddress', 'contact@autopro-elite.com'));
  const [websiteUrl, setWebsiteUrl] = useState(() => getInitialValue('websiteUrl', 'www.autopro-elite.com'));
  const [logoUrl, setLogoUrl] = useState(() => getInitialValue('logoUrl', ''));

  // Fetch settings from backend on mount
  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.companyName) setCompanyName(data.companyName);
          if (data.dealerName) setDealerName(data.dealerName);
          if (data.gstNumber) setGstNumber(data.gstNumber);
          if (data.panNumber) setPanNumber(data.panNumber);
          if (data.streetAddress) setStreetAddress(data.streetAddress);
          if (data.city) setCity(data.city);
          if (data.stateName) setStateName(data.stateName);
          if (data.pinCode) setPinCode(data.pinCode);
          if (data.mobileNumber) setMobileNumber(data.mobileNumber);
          if (data.phoneNum) setPhoneNum(data.phoneNum);
          if (data.emailAddress) setEmailAddress(data.emailAddress);
          if (data.websiteUrl) setWebsiteUrl(data.websiteUrl);
          if (data.logoUrl) setLogoUrl(data.logoUrl);
          try {
            localStorage.setItem('dms_company_settings', JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch((err) => console.error('Error fetching settings from backend:', err));
  }, [API_URL]);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setCompanyName('AutoPro Elite Motors');
    setDealerName('Alexander Sterling');
    setGstNumber('22AAAAA0000A1Z5');
    setPanNumber('ABCDE1234F');
    setStreetAddress('Industrial Park West, Sector 12, Block C');
    setCity('Automotive City');
    setStateName('California');
    setPinCode('90210');
    setMobileNumber('+1 (555) 012-3456');
    setPhoneNum('+1 (555) 987-6543');
    setEmailAddress('contact@autopro-elite.com');
    setWebsiteUrl('www.autopro-elite.com');
    setLogoUrl('');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        companyName,
        dealerName,
        gstNumber,
        panNumber,
        streetAddress,
        city,
        stateName,
        pinCode,
        mobileNumber,
        phoneNum,
        emailAddress,
        websiteUrl,
        logoUrl
      };

      try {
        localStorage.setItem('dms_company_settings', JSON.stringify(payload));
      } catch (e) {}

      if (onSettingsUpdated) {
        onSettingsUpdated(payload);
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);

      await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.warn('Backend connection warning during settings save:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 gap-6 bg-[#f6f8fc] min-w-0 font-sans">
      
      {/* Toast Alert Banner - fixed at top center so it's always visible */}
      {showToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] bg-white border-l-[4px] border-[#10b981] rounded-lg shadow-2xl p-4 flex items-center justify-between gap-4 min-w-[340px] max-w-[480px] animate-fade-in transition-all">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-[#10b981] flex-shrink-0 mt-0.5" size={20} />
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-[#0f172a]">Settings Updated</span>
              <span className="text-[12px] text-[#64748b] mt-0.5">Company settings and logo updated across system.</span>
            </div>
          </div>
          <button 
            onClick={() => setShowToast(false)}
            className="text-[#94a3b8] hover:text-[#475569] transition-colors cursor-pointer bg-transparent border-0 outline-none p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#64748b]">
        <span>Settings</span>
        <span className="text-[#94a3b8] font-normal">&gt;</span>
        <span className="text-[#184edb]">Company Profile</span>
      </div>

      {/* Header section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold text-[#0f172a] font-heading tracking-tight leading-tight">Company Profile</h1>
        <p className="text-[13.5px] text-[#64748b]">
          Manage your dealership's identity, logo, and contact information for invoices and receipts.
        </p>
      </div>

      {/* Company Logo Section */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold text-[#475569] tracking-wider uppercase">COMPANY LOGO</span>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-[#cbd5e1] hover:border-[#184edb] bg-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-center gap-6 transition-all cursor-pointer min-h-[140px] shadow-xs group"
        >
          {logoUrl ? (
            <div className="flex items-center gap-6">
              <img src={logoUrl} alt="Company Logo Preview" className="h-16 w-auto object-contain rounded-lg border border-slate-200 p-2 bg-slate-50" />
              <div className="flex flex-col gap-1">
                <span className="text-[13.5px] font-bold text-[#0f172a]">Uploaded Logo Preview</span>
                <span className="text-[12px] text-[#184edb] font-semibold">Click to replace logo</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogoUrl('');
                  }}
                  className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-bold mt-1 border-none bg-transparent cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Remove Logo</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-[#eff6ff] p-3 rounded-lg text-[#184edb] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Upload size={22} className="stroke-[2.5px]" />
              </div>
              <div className="text-center sm:text-left">
                <span className="text-[13.5px] font-bold text-[#0f172a] block">Click or drag to upload logo</span>
                <span className="text-[12px] text-[#64748b] block mt-1">PNG, JPG up to 5MB (Recomm. 400×120px)</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Business Information Card */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-[#184edb]">
          <Building2 size={16} className="stroke-[2.5px]" />
          <span className="text-[11.5px] font-extrabold tracking-wider uppercase">BUSINESS INFORMATION</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">Dealer Name</label>
            <input
              type="text"
              value={dealerName}
              onChange={(e) => setDealerName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">GST Number</label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">PAN Number</label>
            <input
              type="text"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
            />
          </div>
        </div>
      </div>

      {/* Address Information Card */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center gap-2 text-[#184edb]">
          <MapPin size={16} className="stroke-[2.5px]" />
          <span className="text-[11.5px] font-extrabold tracking-wider uppercase">ADDRESS INFORMATION</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-[#475569]">Street Address</label>
          <input
            type="text"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">State</label>
            <input
              type="text"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">PIN Code</label>
            <input
              type="text"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
            />
          </div>
        </div>
      </div>

      {/* Contact Information Card */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center gap-2 text-[#184edb]">
          <PhoneCall size={16} className="stroke-[2.5px]" />
          <span className="text-[11.5px] font-extrabold tracking-wider uppercase">CONTACT INFORMATION</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">Mobile Number</label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">Phone Number</label>
            <input
              type="text"
              value={phoneNum}
              onChange={(e) => setPhoneNum(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">Email Address</label>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">Website</label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3.5 mt-4 pt-4 border-t border-[#e2e8f0]">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-[#184edb] hover:bg-[#1544c2] disabled:opacity-70 text-white font-bold text-[13.5px] px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-0"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
        </button>
        <button
          onClick={handleReset}
          disabled={loading}
          className="bg-white hover:bg-slate-50 text-[#64748b] font-bold text-[13.5px] px-6 py-2.5 rounded-lg border border-[#cbd5e1] transition-all cursor-pointer"
        >
          Reset
        </button>
      </div>

    </div>
  );
};

export default SettingsPage;
