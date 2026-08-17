export interface StateDistricts {
  state: string;
  districts: string[];
}

export const INDIAN_STATES_DISTRICTS: StateDistricts[] = [
  {
    state: "Tamil Nadu",
    districts: [
      "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
      "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
      "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
      "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
      "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
      "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
      "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
      "Vellore", "Viluppuram", "Virudhunagar"
    ]
  },
  {
    state: "Kerala",
    districts: [
      "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod",
      "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad",
      "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"
    ]
  },
  {
    state: "Karnataka",
    districts: [
      "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
      "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
      "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan",
      "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal",
      "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga",
      "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara", "Yadgir"
    ]
  },
  {
    state: "Andhra Pradesh",
    districts: [
      "Alluri Sitharama Raju", "Anakapalli", "Ananthapuramu", "Annamayya", "Bapatla",
      "Chittoor", "East Godavari", "Eluru", "Guntur", "Kakinada",
      "Konaseema", "Kurnool", "Nandyal", "NTR", "Palnadu",
      "Parvathipuram Manyam", "Prakasam", "Srikakulam", "Sri Potti Sriramulu Nellore", "Sri Sathya Sai",
      "Tirupati", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"
    ]
  },
  {
    state: "Telangana",
    districts: [
      "Adilabad", "Bhadradri Kothagudem", "Hanamkonda", "Hyderabad", "Jagtial",
      "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar",
      "Khammam", "Kumuram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial",
      "Medak", "Medchal-Malkajgiri", "Mulugu", "Nalgonda", "Narayanpet",
      "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Ranga Reddy",
      "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"
    ]
  },
  {
    state: "Maharashtra",
    districts: [
      "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed",
      "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli",
      "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur",
      "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded",
      "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani",
      "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara",
      "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
    ]
  },
  {
    state: "Puducherry",
    districts: ["Karaikal", "Mahe", "Puducherry", "Yanam"]
  },
  {
    state: "Goa",
    districts: ["North Goa", "South Goa"]
  },
  {
    state: "Gujarat",
    districts: [
      "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha",
      "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod",
      "Dang", "Devbhumi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar",
      "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana",
      "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan",
      "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"
    ]
  },
  {
    state: "Delhi",
    districts: [
      "Central Delhi", "East Delhi", "New Delhi", "North Delhi",
      "North East Delhi", "North West Delhi", "Shahdara", "South Delhi",
      "South East Delhi", "South West Delhi", "West Delhi"
    ]
  }
];

export const getDistrictsForState = (stateName: string): string[] => {
  if (!stateName) return INDIAN_STATES_DISTRICTS[0].districts;
  const match = INDIAN_STATES_DISTRICTS.find(
    s => s.state.toLowerCase() === stateName.toLowerCase()
  );
  return match ? match.districts : INDIAN_STATES_DISTRICTS[0].districts;
};

export const formatPhone10Digits = (val: string): string => {
  if (!val) return '';
  return val.replace(/[^0-9]/g, '').slice(0, 10);
};
