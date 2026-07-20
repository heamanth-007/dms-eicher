import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  PhoneCall,
  Upload,
  Save,
  CheckCircle2,
  X
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  // Toast state
  const [showToast, setShowToast] = useState(true);

  // Form states
  const [companyName, setCompanyName] = useState('AutoPro Elite Motors');
  const [dealerName, setDealerName] = useState('Alexander Sterling');
  const [gstNumber, setGstNumber] = useState('22AAAAA0000A1Z5');
  const [panNumber, setPanNumber] = useState('ABCDE1234F');
  
  const [streetAddress, setStreetAddress] = useState('Industrial Park West, Sector 12, Block C');
  const [city, setCity] = useState('Automotive City');
  const [stateName, setStateName] = useState('California');
  const [pinCode, setPinCode] = useState('90210');

  const [mobileNumber, setMobileNumber] = useState('+1 (555) 012-3456');
  const [phoneNum, setPhoneNum] = useState('+1 (555) 987-6543');
  const [emailAddress, setEmailAddress] = useState('contact@autopro-elite.com');
  const [websiteUrl, setWebsiteUrl] = useState('www.autopro-elite.com');

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
  };

  const handleSave = () => {
    setShowToast(true);
    alert('Settings saved successfully!');
  };

  return (
    <div className="flex-1 flex flex-col p-8 gap-6 bg-[#f6f8fc] min-w-0 font-sans relative">
      
      {/* Toast Alert Banner */}
      {showToast && (
        <div className="absolute top-6 right-8 z-50 bg-white border-l-[4px] border-[#10b981] rounded-lg shadow-lg p-4 flex items-center justify-between gap-4 max-w-[380px] animate-fade-in transition-all">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-[#10b981] flex-shrink-0 mt-0.5" size={20} />
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-[#0f172a]">Settings Updated</span>
              <span className="text-[12px] text-[#64748b] mt-0.5">Company settings updated successfully.</span>
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
          Manage your dealership's identity and contact information for invoices and reports.
        </p>
      </div>

      {/* Company Logo Section */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold text-[#475569] tracking-wider uppercase">COMPANY LOGO</span>
        <div className="border border-dashed border-[#cbd5e1] hover:border-[#184edb] bg-white rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer min-h-[140px]">
          <div className="bg-[#eff6ff] p-3 rounded-lg text-[#184edb] flex items-center justify-center">
            <Upload size={22} className="stroke-[2.5px]" />
          </div>
          <div className="text-center">
            <span className="text-[13.5px] font-bold text-[#0f172a] block">Click or drag to upload logo</span>
            <span className="text-[12px] text-[#64748b] block mt-1">PNG, JPG up to 5MB (Recomm. 400×120px)</span>
          </div>
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
          className="flex items-center gap-2 bg-[#184edb] hover:bg-[#1544c2] text-white font-bold text-[13.5px] px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-0"
        >
          <Save size={16} />
          <span>Save Changes</span>
        </button>
        <button
          onClick={handleReset}
          className="bg-white hover:bg-slate-50 text-[#64748b] font-bold text-[13.5px] px-6 py-2.5 rounded-lg border border-[#cbd5e1] transition-all cursor-pointer"
        >
          Reset
        </button>
      </div>

    </div>
  );
};

export default SettingsPage;
