import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_SUBSCRIPTION_PLANS, getRecommendedPlan } from '../../constants/subscriptionPlans';
import { SubscriptionPlan } from '../../types/subscription';
import subscriptionService from '../../services/api/subscription.service';
import { DEFAULT_FEE_PLANS, getRecommendedFeePlan, FeePlan } from '../../constants/feePlans';
import feePlanService from '../../services/api/feePlan.service';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  GridLegacy as Grid,
  TextField,
  FormControl,
  FormLabel,
  InputLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  InputAdornment,
  Alert,
  Divider,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Slider,
  Select,
  MenuItem,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tabs,
  Tab,
  Container,
  Stack
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  LocationCity as LocationCityIcon,
  Public as PublicIcon,
  Home as HomeIcon,
  CreditCard as CreditCardIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  ExpandMore as ExpandMoreIcon,
  AutoAwesome as AutoAwesomeIcon,
  SmartToy as SmartToyIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  Store as StoreIcon,
  Wifi as WifiIcon,
  Lightbulb as LightbulbIcon,
  Thermostat as ThermostatIcon,
  CameraAlt as CameraIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Rocket as RocketIcon,
  Save as SaveIcon,
  SkipNext as SkipIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  CloudUpload as CloudUploadIcon,
  Verified as VerifiedIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

interface OrganizationData {
  // Step 1: Basic Information
  organizationName: string;
  organizationType: 'library' | 'study_center' | 'coaching' | 'coworking' | 'other';
  contactPerson: string;
  email: string;
  phone: string;
  alternatePhone: string;
  website: string;
  
  // Step 2: Location Details
  address: string;
  city: string;
  state: string;
  district: string;
  country: string;
  pincode: string;
  landmark: string;
  customState?: string;
  customCity?: string;
  customDistrict?: string;
  
  // Step 3: Business Hours & Operations
  operatingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  timeSlotDuration: number; // in minutes
  advanceBookingDays: number;
  
  // Step 4: Capacity & Layout
  totalSeats: number;
  facilities: {
    wifi: boolean;
    powerOutlets: boolean;
    airConditioning: boolean;
    parking: boolean;
    cafeteria: boolean;
    library: boolean;
    meetingRooms: boolean;
    printing: boolean;
  };
  
  // Step 4: Subscription Plan
  selectedPlan: string;
  
  // Step 5: Pricing & Payment
  pricingModel: 'hourly' | 'daily' | 'monthly' | 'flexible';
  basePrice: number;
  paymentMethod: 'upi' | 'bank' | 'both';
  upiId: string;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
  };
  gstNumber: string;
  gstPercentage: number;
  
  // Step 6: Staff & Management
  staffMembers: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    permissions: string[];
    isActive: boolean;
  }>;
  
  // Step 7: Features & Integrations
  features: {
    faceRecognition: boolean;
    smartLighting: boolean;
    climateControl: boolean;
    securityCameras: boolean;
    analytics: boolean;
    notifications: boolean;
    mobileApp: boolean;
  };
  
  // Step 8: Preferences & Settings
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    dataRetention: number; // in days
    backupFrequency: 'daily' | 'weekly' | 'monthly';
  };
  
}

const OrganizationOnboardingDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1); // 1 or 2
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(DEFAULT_SUBSCRIPTION_PLANS);
  const [plansLoading, setPlansLoading] = useState(false);
  const [feePlans, setFeePlans] = useState<FeePlan[]>(DEFAULT_FEE_PLANS);
  const [feePlansLoading, setFeePlansLoading] = useState(false);
  
  // Staff dialog state
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'Staff',
    permissions: ['basic'],
    isActive: true
  });
  const [staffDialogMode, setStaffDialogMode] = useState<'add' | 'edit'>('add');
  const [staffLoading, setStaffLoading] = useState(false);
  
  // Launch permissions state
  const [permissions, setPermissions] = useState({
    dataProcessing: false,
    marketing: false,
    analytics: false,
    thirdParty: false,
    termsAccepted: false
  });
  
  // Track skipped tabs
  const [skippedTabs, setSkippedTabs] = useState<number[]>([]);
  
  // Location state
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSuccess, setLocationSuccess] = useState(false);
  

  // State, city and district data
  const stateCityDistrictData = {
    'Andhra Pradesh': {
      cities: ['Hyderabad', 'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore'],
      districts: ['Hyderabad', 'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kadapa', 'Anantapur', 'Kurnool']
    },
    'Arunachal Pradesh': {
      cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tezpur', 'Bomdila'],
      districts: ['Papum Pare', 'East Siang', 'West Siang', 'Lohit', 'Changlang']
    },
    'Assam': {
      cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon'],
      districts: ['Kamrup', 'Cachar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Sonitpur', 'Tinsukia']
    },
    'Bihar': {
      cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga'],
      districts: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Saran']
    },
    'Chhattisgarh': {
      cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon'],
      districts: ['Raipur', 'Durg', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Bastar', 'Surguja']
    },
    'Delhi': {
      cities: ['New Delhi', 'Central Delhi', 'East Delhi', 'North Delhi', 'South Delhi'],
      districts: ['Central Delhi', 'East Delhi', 'North Delhi', 'South Delhi', 'West Delhi', 'North East Delhi', 'South West Delhi']
    },
    'Goa': {
      cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
      districts: ['North Goa', 'South Goa']
    },
    'Gujarat': {
      cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
      districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Gandhinagar', 'Jamnagar']
    },
    'Haryana': {
      cities: ['Chandigarh', 'Faridabad', 'Gurgaon', 'Panipat', 'Ambala'],
      districts: ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Hisar', 'Karnal', 'Rohtak']
    },
    'Himachal Pradesh': {
      cities: ['Shimla', 'Dharamshala', 'Manali', 'Solan', 'Mandi'],
      districts: ['Shimla', 'Kangra', 'Kullu', 'Solan', 'Mandi', 'Chamba', 'Una']
    },
    'Jharkhand': {
      cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar'],
      districts: ['Ranchi', 'East Singhbhum', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih']
    },
    'Karnataka': {
      cities: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'],
      districts: ['Bangalore Urban', 'Mysore', 'Dharwad', 'Dakshina Kannada', 'Belgaum', 'Mangalore', 'Tumkur']
    },
    'Kerala': {
      cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
      districts: ['Thiruvananthapuram', 'Ernakulam', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Malappuram']
    },
    'Madhya Pradesh': {
      cities: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'],
      districts: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Rewa']
    },
    'Maharashtra': {
      cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
      districts: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane', 'Kolhapur']
    },
    'Manipur': {
      cities: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Senapati'],
      districts: ['Imphal East', 'Imphal West', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Senapati']
    },
    'Meghalaya': {
      cities: ['Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Williamnagar'],
      districts: ['East Khasi Hills', 'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills', 'East Garo Hills']
    },
    'Mizoram': {
      cities: ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib'],
      districts: ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Mamit', 'Serchhip']
    },
    'Nagaland': {
      cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha'],
      districts: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Phek', 'Zunheboto']
    },
    'Odisha': {
      cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur'],
      districts: ['Khordha', 'Cuttack', 'Sundargarh', 'Ganjam', 'Sambalpur', 'Puri', 'Balasore']
    },
    'Punjab': {
      cities: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
      districts: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Firozpur']
    },
    'Rajasthan': {
      cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
      districts: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Jaisalmer']
    },
    'Sikkim': {
      cities: ['Gangtok', 'Namchi', 'Mangan', 'Gyalshing', 'Ravangla'],
      districts: ['East Sikkim', 'South Sikkim', 'North Sikkim', 'West Sikkim']
    },
    'Tamil Nadu': {
      cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
      districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode']
    },
    'Telangana': {
      cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar'],
      districts: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Rangareddy', 'Medak']
    },
    'Tripura': {
      cities: ['Agartala', 'Dharmanagar', 'Udaipur', 'Ambassa', 'Kailashahar'],
      districts: ['West Tripura', 'North Tripura', 'South Tripura', 'Dhalai', 'Unakoti']
    },
    'Uttar Pradesh': {
      cities: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut'],
      districts: ['Lucknow', 'Kanpur Nagar', 'Agra', 'Varanasi', 'Meerut', 'Ghaziabad', 'Noida']
    },
    'Uttarakhand': {
      cities: ['Dehradun', 'Haridwar', 'Rishikesh', 'Nainital', 'Mussoorie'],
      districts: ['Dehradun', 'Haridwar', 'Nainital', 'Almora', 'Pauri Garhwal', 'Tehri Garhwal']
    },
    'West Bengal': {
      cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
      districts: ['Kolkata', 'Howrah', 'Bardhaman', 'Paschim Bardhaman', 'Darjeeling', 'Maldah', 'Murshidabad']
    }
  };

  // Staff dialog functions
  const handleOpenStaffDialog = (mode: 'add' | 'edit', staff?: any) => {
    if (mode === 'add') {
      setCurrentStaff({
        id: '',
        name: '',
        email: '',
        phone: '',
        role: 'Staff',
        permissions: ['basic'],
        isActive: true
      });
    } else if (staff) {
      setCurrentStaff(staff);
    }
    setStaffDialogMode(mode);
    setStaffDialogOpen(true);
  };

  const handleCloseStaffDialog = () => {
    setStaffDialogOpen(false);
    setCurrentStaff({
      id: '',
      name: '',
      email: '',
      phone: '',
      role: 'Staff',
      permissions: ['basic'],
      isActive: true
    });
  };

  const handleSaveStaff = () => {
    if (!currentStaff.name || !currentStaff.email) {
      return;
    }

    setStaffLoading(true);
    
    if (staffDialogMode === 'add') {
      const newStaff = {
        ...currentStaff,
        id: Date.now().toString()
      };
      setOrganizationData(prev => ({
        ...prev,
        staffMembers: [...prev.staffMembers, newStaff]
      }));
    } else {
      setOrganizationData(prev => ({
        ...prev,
        staffMembers: prev.staffMembers.map(staff => 
          staff.id === currentStaff.id ? currentStaff : staff
        )
      }));
    }
    
    setStaffLoading(false);
    handleCloseStaffDialog();
  };

  const handleDeleteStaff = (staffId: string) => {
    setOrganizationData(prev => ({
      ...prev,
      staffMembers: prev.staffMembers.filter(staff => staff.id !== staffId)
    }));
  };

  // Fetch subscription plans on component mount
  useEffect(() => {
    const fetchPlans = async () => {
      setPlansLoading(true);
      try {
        const plans = await subscriptionService.getPlans();
        setSubscriptionPlans(plans);
      } catch (error) {
        console.warn('Failed to fetch subscription plans, using defaults:', error);
        // Keep using DEFAULT_SUBSCRIPTION_PLANS as fallback
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Fetch fee plans on component mount
  useEffect(() => {
    const fetchFeePlans = async () => {
      setFeePlansLoading(true);
      try {
        const plans = await feePlanService.getFeePlans();
        setFeePlans(plans);
      } catch (error) {
        console.warn('Failed to fetch fee plans, using defaults:', error);
        // Keep using DEFAULT_FEE_PLANS as fallback
      } finally {
        setFeePlansLoading(false);
      }
    };

    fetchFeePlans();
  }, []);

  
  const [organizationData, setOrganizationData] = useState<OrganizationData>({
    organizationName: '',
    organizationType: 'library',
    contactPerson: '',
    email: '',
    phone: '',
    alternatePhone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    district: '',
    country: 'India',
    pincode: '',
    landmark: '',
    operatingHours: {
      monday: { open: '08:00', close: '22:00', closed: false },
      tuesday: { open: '08:00', close: '22:00', closed: false },
      wednesday: { open: '08:00', close: '22:00', closed: false },
      thursday: { open: '08:00', close: '22:00', closed: false },
      friday: { open: '08:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '21:00', closed: false },
      sunday: { open: '10:00', close: '20:00', closed: false }
    },
    timeSlotDuration: 60,
    advanceBookingDays: 7,
    totalSeats: 50,
    facilities: {
      wifi: true,
      powerOutlets: true,
      airConditioning: true,
      parking: false,
      cafeteria: false,
      library: true,
      meetingRooms: false,
      printing: true
    },
    selectedPlan: 'professional',
    pricingModel: 'hourly',
    basePrice: 50,
    paymentMethod: 'upi',
    upiId: '',
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      accountHolderName: ''
    },
    gstNumber: '',
    gstPercentage: 18,
    staffMembers: [],
    features: {
      faceRecognition: false,
      smartLighting: false,
      climateControl: false,
      securityCameras: false,
      analytics: true,
      notifications: true,
      mobileApp: false
    },
    preferences: {
      theme: 'light',
      language: 'en',
      currency: 'INR',
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      dataRetention: 365,
      backupFrequency: 'daily'
    },
    
  });


  const step1Tabs = [
    { label: 'Basic Info', icon: <BusinessIcon /> },
    { label: 'Location', icon: <LocationIcon /> },
    { label: 'Payment', icon: <PaymentIcon /> },
    { label: 'Subscription', icon: <StarIcon /> }
  ];

  const step2Tabs = [
    { label: 'Capacity & Operations', icon: <SchoolIcon /> },
    { label: 'Pricing', icon: <CreditCardIcon /> },
    { label: 'Staff', icon: <GroupIcon /> },
    { label: 'Features & Settings', icon: <SettingsIcon /> },
    { label: 'Launch', icon: <RocketIcon /> }
  ];

  const currentTabs = currentStep === 1 ? step1Tabs : step2Tabs;

  // Auto-fill with smart suggestions
  const autoFillData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setOrganizationData(prev => ({
        ...prev,
        organizationName: 'StudySpot Library',
        organizationType: 'library',
        contactPerson: 'John Doe',
        email: 'contact@studyspot.com',
        phone: '+91 98765 43210',
        alternatePhone: '+91 98765 43211',
        website: 'www.studyspot.com',
        address: '123 Main Street, Near City Center',
        city: 'Mumbai',
        state: 'Maharashtra',
        district: 'Mumbai',
        country: 'India',
        pincode: '400001',
        landmark: 'Opposite Metro Station',
        totalSeats: 100,
        basePrice: 75,
        upiId: 'studyspot@paytm',
        bankDetails: {
          accountNumber: '1234567890',
          ifscCode: 'SBIN0001234',
          bankName: 'State Bank of India',
          accountHolderName: 'StudySpot Library'
        },
        gstNumber: '27ABCDE1234F1Z5',
        staffMembers: [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@studyspot.com',
            phone: '+91 98765 43210',
            role: 'Manager',
            permissions: ['all'],
            isActive: true
          }
        ]
      }));
      setIsLoading(false);
    }, 1500);
  };

  const handleInputChange = (field: string, value: any) => {
    setOrganizationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setOrganizationData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof OrganizationData] as any),
        [field]: value
      }
    }));
  };

  const handleArrayChange = (arrayName: string, index: number, field: string, value: any) => {
    setOrganizationData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName as keyof OrganizationData] as any[]).map((item: any, i: number) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const saveData = () => {
    localStorage.setItem('organizationData', JSON.stringify(organizationData));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      setActiveTab(0); // Reset to first tab of step 2
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setActiveTab(0); // Reset to first tab of step 1
    }
  };

  const handleLaunch = () => {
    saveData();
    navigate('/dashboard');
  };

  const handleSkipTab = () => {
    // Mark current tab as skipped
    if (!skippedTabs.includes(activeTab)) {
      setSkippedTabs(prev => [...prev, activeTab]);
    }
    // Move to next tab
    if (activeTab < currentTabs.length - 1) {
      setActiveTab(activeTab + 1);
    }
  };

  const handleBackTab = () => {
    // If going back to a skipped tab, remove it from skipped list
    const prevTab = activeTab - 1;
    if (skippedTabs.includes(prevTab)) {
      setSkippedTabs(prev => prev.filter(tab => tab !== prevTab));
    }
    // Move to previous tab
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const handleStateChange = (newState: string) => {
    setOrganizationData(prev => ({
      ...prev,
      state: newState,
      city: '', // Reset city when state changes
      district: '', // Reset district when state changes
      customState: newState === 'Other' ? prev.customState : '',
      customCity: '',
      customDistrict: ''
    }));
  };

  const handleCityChange = (newCity: string) => {
    setOrganizationData(prev => ({
      ...prev,
      city: newCity,
      district: '', // Reset district when city changes
      customCity: newCity === 'Other' ? prev.customCity : '',
      customDistrict: ''
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get address from coordinates
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          if (response.ok) {
            const data = await response.json();
            
            // Update organization data with location information
            const detectedState = data.principalSubdivision || '';
            const detectedCity = data.city || data.locality || '';
            
            // Try to match detected state with our state list
            const matchedState = Object.keys(stateCityDistrictData).find(state => 
              state.toLowerCase().includes(detectedState.toLowerCase()) ||
              detectedState.toLowerCase().includes(state.toLowerCase())
            );
            
            // Try to match detected city with cities in the matched state
            let matchedCity = '';
            let matchedDistrict = '';
            if (matchedState && stateCityDistrictData[matchedState as keyof typeof stateCityDistrictData]) {
              const stateData = stateCityDistrictData[matchedState as keyof typeof stateCityDistrictData];
              matchedCity = stateData.cities.find(city => 
                city.toLowerCase().includes(detectedCity.toLowerCase()) ||
                detectedCity.toLowerCase().includes(city.toLowerCase())
              ) || '';
              
              // Try to match district (use city as fallback for district)
              matchedDistrict = stateData.districts.find(district => 
                district.toLowerCase().includes(detectedCity.toLowerCase()) ||
                detectedCity.toLowerCase().includes(district.toLowerCase())
              ) || '';
            }
            
            setOrganizationData(prev => ({
              ...prev,
              address: data.locality || data.principalSubdivision || 'Address not found',
              city: matchedCity || detectedCity,
              state: matchedState || detectedState,
              district: matchedDistrict || '',
              country: data.countryName || 'India',
              landmark: data.localityInfo?.administrative?.[0]?.name || ''
            }));
            
            setLocationSuccess(true);
            
            // Clear success message after 3 seconds
            setTimeout(() => {
              setLocationSuccess(false);
            }, 3000);
          } else {
            setLocationError('Failed to get address from coordinates.');
          }
        } catch (error) {
          setLocationError('Error getting address details.');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied by user.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };


  const isTabValid = (tabIndex: number): boolean => {
    if (currentStep === 1) {
      // Step 1 tabs
      switch (tabIndex) {
        case 0: // Basic Info
          return !!(organizationData.organizationName && organizationData.contactPerson && organizationData.email);
        case 1: // Location
          const hasValidState = organizationData.state && 
            (organizationData.state !== 'Other' || organizationData.customState);
          const hasValidCity = organizationData.city && 
            (organizationData.city !== 'Other' || organizationData.customCity);
          const hasValidDistrict = organizationData.district && 
            (organizationData.district !== 'Other' || organizationData.customDistrict);
          return !!(organizationData.address && hasValidState && hasValidCity && hasValidDistrict);
        case 2: // Payment
          return !!(organizationData.paymentMethod && (organizationData.upiId || organizationData.bankDetails.accountNumber));
        case 3: // Subscription
          return true; // Optional
        default:
          return true;
      }
    } else {
      // Step 2 tabs
      switch (tabIndex) {
        case 0: // Capacity & Operations
          return organizationData.totalSeats > 0;
        case 1: // Pricing
          return organizationData.basePrice > 0;
        case 2: // Staff
          return true; // Optional
        case 3: // Features & Settings
          return true; // Optional
        case 4: // Launch
          return Object.values(permissions).every(Boolean);
        default:
          return true;
      }
    }
  };

  const renderTabContent = (tabIndex: number) => {
    if (currentStep === 1) {
      // Step 1 content
      switch (tabIndex) {
        case 0: // Basic Info
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                🏢 Organization Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoFillEnabled}
                      onChange={(e) => setAutoFillEnabled(e.target.checked)}
                    />
                  }
                  label="Smart Fill"
                />
                <Button
                  variant="outlined"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={autoFillData}
                  disabled={!autoFillEnabled || isLoading}
                >
                  {isLoading ? 'Filling...' : 'Auto-Fill'}
                </Button>
              </Box>
            </Box>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>💡 Pro Tip:</strong> Enable Smart Fill to automatically populate common values, or fill manually for complete control.
              </Typography>
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Organization Name *"
                  value={organizationData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><BusinessIcon /></InputAdornment>
                  }}
                  helperText="Your library or study center name"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Organization Type</InputLabel>
                  <Select
                    value={organizationData.organizationType}
                    onChange={(e) => handleInputChange('organizationType', e.target.value)}
                    startAdornment={<InputAdornment position="start"><StoreIcon /></InputAdornment>}
                  >
                    <MenuItem value="library">Library</MenuItem>
                    <MenuItem value="study_center">Study Center</MenuItem>
                    <MenuItem value="coaching">Coaching Institute</MenuItem>
                    <MenuItem value="coworking">Co-working Space</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Person *"
                  value={organizationData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment>
                  }}
                  helperText="Primary contact person"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address *"
                  type="email"
                  value={organizationData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>
                  }}
                  helperText="For notifications and support"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Primary Phone *"
                  value={organizationData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>
                  }}
                  helperText="Main contact number"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Alternate Phone"
                  value={organizationData.alternatePhone}
                  onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>
                  }}
                  helperText="Optional backup number"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website"
                  value={organizationData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PublicIcon /></InputAdornment>
                  }}
                  helperText="Your organization's website (optional)"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1: // Location
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              📍 Location Details
            </Typography>
            
            <Grid container spacing={1.5}>
              {/* Address Section */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={locationLoading ? <CircularProgress size={14} /> : <LocationIcon />}
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    {locationLoading ? 'Getting...' : '📍 Get Location'}
                  </Button>
                  {locationError && (
                    <Alert severity="error" sx={{ flex: 1, py: 0.5 }}>
                      {locationError}
                    </Alert>
                  )}
                  {locationSuccess && (
                    <Alert severity="success" sx={{ flex: 1, py: 0.5 }}>
                      ✅ Location detected!
                    </Alert>
                  )}
                </Box>
                <TextField
                  fullWidth
                  label="Complete Address *"
                  multiline
                  rows={2}
                  value={organizationData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LocationIcon /></InputAdornment>
                  }}
                  helperText="Full address including building name, floor, etc."
                  size="small"
                />
              </Grid>

              {/* Location Selection Row */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>State *</InputLabel>
                  <Select
                    value={organizationData.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Select State</em>
                    </MenuItem>
                    {Object.keys(stateCityDistrictData).map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                    <MenuItem value="Other">
                      <em>Other (Custom)</em>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>City *</InputLabel>
                  <Select
                    value={organizationData.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    disabled={!organizationData.state}
                  >
                    <MenuItem value="">
                      <em>Select City</em>
                    </MenuItem>
                    {organizationData.state && 
                     organizationData.state !== 'Other' && 
                     stateCityDistrictData[organizationData.state as keyof typeof stateCityDistrictData]?.cities?.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                    <MenuItem value="Other">
                      <em>Other (Custom)</em>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>District *</InputLabel>
                  <Select
                    value={organizationData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    disabled={!organizationData.state}
                  >
                    <MenuItem value="">
                      <em>Select District</em>
                    </MenuItem>
                    {organizationData.state && 
                     organizationData.state !== 'Other' && 
                     stateCityDistrictData[organizationData.state as keyof typeof stateCityDistrictData]?.districts?.map((district) => (
                      <MenuItem key={district} value={district}>
                        {district}
                      </MenuItem>
                    ))}
                    <MenuItem value="Other">
                      <em>Other (Custom)</em>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Custom Inputs Section - Only show when needed */}
              {organizationData.state === 'Other' && (
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Custom State *"
                    value={organizationData.customState || ''}
                    onChange={(e) => handleInputChange('customState', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><PublicIcon /></InputAdornment>
                    }}
                    helperText="Enter your state name"
                  />
                </Grid>
              )}
              
              {organizationData.city === 'Other' && (
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Custom City *"
                    value={organizationData.customCity || ''}
                    onChange={(e) => handleInputChange('customCity', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LocationCityIcon /></InputAdornment>
                    }}
                    helperText="Enter your city name"
                  />
                </Grid>
              )}
              
              {organizationData.district === 'Other' && (
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Custom District *"
                    value={organizationData.customDistrict || ''}
                    onChange={(e) => handleInputChange('customDistrict', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LocationIcon /></InputAdornment>
                    }}
                    helperText="Enter your district name"
                  />
                </Grid>
              )}

              {/* Additional Details */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Country"
                  value={organizationData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PublicIcon /></InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="PIN Code"
                  value={organizationData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LocationIcon /></InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Landmark"
                  placeholder="e.g., Opposite Metro Station, Near Shopping Mall"
                  value={organizationData.landmark}
                  onChange={(e) => handleInputChange('landmark', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><HomeIcon /></InputAdornment>
                  }}
                  helperText="Nearby landmarks to help students locate your place"
                />
              </Grid>
            </Grid>
          </Box>
        );


      case 2: // Payment
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              💳 Payment Collection
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>💳 Quick Setup:</strong> Choose how you want to collect payments from students.
              </Typography>
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <FormLabel component="legend" sx={{ mb: 1 }}>How do you want to collect payments?</FormLabel>
                  <RadioGroup
                    value={organizationData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    row
                  >
                    <FormControlLabel 
                      value="upi" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CreditCardIcon color="primary" />
                          <Typography>UPI ID Only</Typography>
                        </Box>
                      } 
                    />
                    <FormControlLabel 
                      value="bank" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StoreIcon color="primary" />
                          <Typography>Bank Account Only</Typography>
                        </Box>
                      } 
                    />
                    <FormControlLabel 
                      value="both" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PaymentIcon color="primary" />
                          <Typography>Both UPI & Bank</Typography>
                        </Box>
                      } 
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {(organizationData.paymentMethod === 'upi' || organizationData.paymentMethod === 'both') && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="UPI ID"
                    placeholder="yourname@paytm"
                    value={organizationData.upiId}
                    onChange={(e) => handleInputChange('upiId', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><CreditCardIcon /></InputAdornment>
                    }}
                    helperText="Students can pay using PhonePe, Google Pay, Paytm, etc."
                    size="small"
                  />
                </Grid>
              )}

              {(organizationData.paymentMethod === 'bank' || organizationData.paymentMethod === 'both') && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Account Holder Name"
                      value={organizationData.bankDetails.accountHolderName}
                      onChange={(e) => handleNestedChange('bankDetails', 'accountHolderName', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Bank Name"
                      value={organizationData.bankDetails.bankName}
                      onChange={(e) => handleNestedChange('bankDetails', 'bankName', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={8} md={4}>
                    <TextField
                      fullWidth
                      label="Account Number"
                      value={organizationData.bankDetails.accountNumber}
                      onChange={(e) => handleNestedChange('bankDetails', 'accountNumber', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4} md={2}>
                    <TextField
                      fullWidth
                      label="IFSC Code"
                      placeholder="SBIN0001234"
                      value={organizationData.bankDetails.ifscCode}
                      onChange={(e) => handleNestedChange('bankDetails', 'ifscCode', e.target.value.toUpperCase())}
                      size="small"
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    <strong>💡 Tip:</strong> UPI is faster and more convenient for students. You can always add bank details later.
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 3: // Subscription
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              ⭐ Subscription Plan
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>⭐ Choose Your Plan:</strong> Select the subscription plan that best fits your needs.
              </Typography>
            </Alert>
            
            {plansLoading ? (
              <Grid container spacing={2}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={12} md={6} key={i}>
                    <Card sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <StarIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Loading...</Typography>
                      </Box>
                      <Typography variant="h4" color="primary" sx={{ mb: 1 }}>₹---</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Loading plan details...
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={2}>
                {subscriptionPlans.map((plan) => (
                  <Grid item xs={12} md={6} key={plan.id}>
                    <Card 
                      sx={{ 
                        p: 2, 
                        cursor: 'pointer',
                        border: organizationData.selectedPlan === plan.id ? 2 : 1,
                        borderColor: organizationData.selectedPlan === plan.id ? 'primary.main' : 'grey.300',
                        bgcolor: organizationData.selectedPlan === plan.id ? 'primary.50' : 'white'
                      }}
                      onClick={() => handleInputChange('selectedPlan', plan.id)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <StarIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">{plan.display_name}</Typography>
                        {plan.id === 'professional' && (
                          <Chip label="Recommended" color="success" size="small" sx={{ ml: 'auto' }} />
                        )}
                      </Box>
                      <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                        {plan.price_monthly === 0 ? 'Free' : `₹${plan.price_monthly}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {plan.description}
                      </Typography>
                      <List dense>
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <ListItem sx={{ py: 0 }} key={index}>
                            <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                        {plan.features.length > 3 && (
                          <ListItem sx={{ py: 0 }}>
                            <ListItemText 
                              primary={`+${plan.features.length - 3} more features`} 
                              sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                            />
                          </ListItem>
                        )}
                      </List>
                    </Card>
                  </Grid>
                ))}
                
                <Grid item xs={12}>
                  <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                      <strong>💡 Tip:</strong> You can start with the Free Tier and upgrade anytime as your library grows.
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        );

        default:
          return null;
      }
    } else {
      // Step 2 content
      switch (tabIndex) {
        case 0: // Capacity & Operations
          return (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                🪑 Capacity & Operations
              </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>🏢 Smart Layout & Operations:</strong> Configure your seating capacity, facilities, and operating hours to optimize space utilization and student experience.
              </Typography>
            </Alert>
            
            <Grid container spacing={3}>
              {/* Capacity Section */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                  📊 Seating Capacity
                </Typography>
                <TextField
                  fullWidth
                  label="Total Seats"
                  type="number"
                  value={organizationData.totalSeats}
                  onChange={(e) => handleInputChange('totalSeats', parseInt(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SchoolIcon /></InputAdornment>
                  }}
                  helperText="Total number of seats available"
                  sx={{ mb: 3 }}
                />

                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                  🏢 Facilities & Amenities
                </Typography>
                <List dense>
                  {Object.entries(organizationData.facilities).map(([facility, enabled]) => (
                    <ListItem key={facility} sx={{ py: 0 }}>
                      <ListItemIcon>
                        {facility === 'wifi' && <WifiIcon />}
                        {facility === 'powerOutlets' && <LightbulbIcon />}
                        {facility === 'airConditioning' && <ThermostatIcon />}
                        {facility === 'parking' && <StoreIcon />}
                        {facility === 'cafeteria' && <StoreIcon />}
                        {facility === 'library' && <SchoolIcon />}
                        {facility === 'meetingRooms' && <GroupIcon />}
                        {facility === 'printing' && <StoreIcon />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={facility.charAt(0).toUpperCase() + facility.slice(1).replace(/([A-Z])/g, ' $1')}
                        sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem' } }}
                      />
                      <Switch
                        checked={enabled}
                        onChange={(e) => handleNestedChange('facilities', facility, e.target.checked)}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* Operations Section */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                  ⏰ Operating Hours
                </Typography>
                {Object.entries(organizationData.operatingHours).map(([day, hours]) => (
                  <Box key={day} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!hours.closed}
                          onChange={(e) => handleNestedChange('operatingHours', day, { ...hours, closed: !e.target.checked })}
                          size="small"
                        />
                      }
                      label={day.charAt(0).toUpperCase() + day.slice(1)}
                      sx={{ minWidth: 80 }}
                    />
                    {!hours.closed && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                        <TextField
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleNestedChange('operatingHours', day, { ...hours, open: e.target.value })}
                          size="small"
                          sx={{ width: 100 }}
                        />
                        <Typography variant="caption">to</Typography>
                        <TextField
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleNestedChange('operatingHours', day, { ...hours, close: e.target.value })}
                          size="small"
                          sx={{ width: 100 }}
                        />
                      </Box>
                    )}
                  </Box>
                ))}

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                    ⚡ Quick Setup
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    onClick={() => {
                      const defaultHours = {
                        monday: { open: '08:00', close: '22:00', closed: false },
                        tuesday: { open: '08:00', close: '22:00', closed: false },
                        wednesday: { open: '08:00', close: '22:00', closed: false },
                        thursday: { open: '08:00', close: '22:00', closed: false },
                        friday: { open: '08:00', close: '22:00', closed: false },
                        saturday: { open: '09:00', close: '21:00', closed: false },
                        sunday: { open: '10:00', close: '20:00', closed: false }
                      };
                      setOrganizationData(prev => ({ ...prev, operatingHours: defaultHours }));
                    }}
                  >
                    Set Standard Hours (8 AM - 10 PM)
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

        case 1: // Pricing
          return (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                💰 Pricing Plans
              </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>💰 Choose Pricing Plans:</strong> Select the pricing plans you want to offer to students.
              </Typography>
            </Alert>
            
            {feePlansLoading ? (
              <Grid container spacing={2}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={12} md={6} key={i}>
                    <Card sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CreditCardIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Loading...</Typography>
                      </Box>
                      <Typography variant="h4" color="primary" sx={{ mb: 1 }}>₹---</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Loading pricing details...
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={2}>
                {feePlans.map((plan) => (
                  <Grid item xs={12} md={6} key={plan.id}>
                    <Card 
                      sx={{ 
                        p: 2, 
                        cursor: 'pointer',
                        border: organizationData.pricingModel === plan.type ? 2 : 1,
                        borderColor: organizationData.pricingModel === plan.type ? 'primary.main' : 'grey.300',
                        bgcolor: organizationData.pricingModel === plan.type ? 'primary.50' : 'white'
                      }}
                      onClick={() => {
                        handleInputChange('pricingModel', plan.type);
                        handleInputChange('basePrice', plan.basePrice);
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CreditCardIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">{plan.name}</Typography>
                        {plan.isPopular && (
                          <Chip label="Popular" color="success" size="small" sx={{ ml: 'auto' }} />
                        )}
                      </Box>
                      <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                        ₹{plan.basePrice}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {plan.description}
                      </Typography>
                      <List dense>
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <ListItem sx={{ py: 0 }} key={index}>
                            <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                        {plan.features.length > 3 && (
                          <ListItem sx={{ py: 0 }}>
                            <ListItemText 
                              primary={`+${plan.features.length - 3} more features`} 
                              sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                            />
                          </ListItem>
                        )}
                      </List>
                    </Card>
                  </Grid>
                ))}
                
                <Grid item xs={12}>
                  <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                      <strong>💡 Tip:</strong> You can customize these pricing plans later in the Fee Plans section.
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        );

        case 2: // Staff
          return (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                👥 Staff & Team Management
              </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>👥 Team Setup:</strong> Add your staff members and assign roles for better management and access control.
              </Typography>
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Staff Members ({organizationData.staffMembers.length})
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenStaffDialog('add')}
                  >
                    Add Staff
                  </Button>
                </Box>
                
                {organizationData.staffMembers.length === 0 ? (
                  <Alert severity="info">
                    No staff members added yet. Click "Add Staff" to get started.
                  </Alert>
                ) : (
                  <List>
                    {organizationData.staffMembers.map((staff, index) => (
                      <ListItem key={staff.id} divider>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {staff.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={staff.name || 'Unnamed Staff'}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {staff.email} • {staff.phone} • {staff.role}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenStaffDialog('edit', staff)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteStaff(staff.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Grid>
            </Grid>
          </Box>
        );


        case 3: // Features & Settings
          return (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                🤖 Features & Settings
              </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>🚀 Smart Features & Customization:</strong> Enable advanced features and configure your preferences for a personalized experience.
              </Typography>
            </Alert>
            
            <Grid container spacing={3}>
              {/* Features Section */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                  📱 Smart Features
                </Typography>
                <List>
                  {Object.entries(organizationData.features).map(([feature, enabled]) => (
                    <ListItem key={feature}>
                      <ListItemIcon>
                        {feature === 'faceRecognition' && <CameraIcon />}
                        {feature === 'smartLighting' && <LightbulbIcon />}
                        {feature === 'climateControl' && <ThermostatIcon />}
                        {feature === 'securityCameras' && <CameraIcon />}
                        {feature === 'analytics' && <AnalyticsIcon />}
                        {feature === 'notifications' && <NotificationsIcon />}
                        {feature === 'mobileApp' && <SmartToyIcon />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature.charAt(0).toUpperCase() + feature.slice(1).replace(/([A-Z])/g, ' $1')}
                        secondary={
                          feature === 'faceRecognition' ? 'Automated attendance with face recognition' :
                          feature === 'smartLighting' ? 'Automated lighting control' :
                          feature === 'climateControl' ? 'Smart temperature management' :
                          feature === 'securityCameras' ? '24/7 security monitoring' :
                          feature === 'analytics' ? 'Detailed usage analytics and reports' :
                          feature === 'notifications' ? 'Real-time notifications and alerts' :
                          feature === 'mobileApp' ? 'Dedicated mobile application' : ''
                        }
                      />
                      <Switch
                        checked={enabled}
                        onChange={(e) => handleNestedChange('features', feature, e.target.checked)}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* Settings Section */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                  ⚙️ Preferences
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={organizationData.preferences.theme}
                    onChange={(e) => handleNestedChange('preferences', 'theme', e.target.value)}
                  >
                    <MenuItem value="light">Light Mode</MenuItem>
                    <MenuItem value="dark">Dark Mode</MenuItem>
                    <MenuItem value="auto">Auto (System)</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={organizationData.preferences.language}
                    onChange={(e) => handleNestedChange('preferences', 'language', e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="hi">Hindi</MenuItem>
                    <MenuItem value="ta">Tamil</MenuItem>
                    <MenuItem value="te">Telugu</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={organizationData.preferences.currency}
                    onChange={(e) => handleNestedChange('preferences', 'currency', e.target.value)}
                  >
                    <MenuItem value="INR">Indian Rupee (₹)</MenuItem>
                    <MenuItem value="USD">US Dollar ($)</MenuItem>
                    <MenuItem value="EUR">Euro (€)</MenuItem>
                  </Select>
                </FormControl>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                  🔔 Notifications
                </Typography>
                <List dense>
                  {Object.entries(organizationData.preferences.notifications).map(([type, enabled]) => (
                    <ListItem key={type} sx={{ py: 0 }}>
                      <ListItemIcon>
                        {type === 'email' && <EmailIcon />}
                        {type === 'sms' && <PhoneIcon />}
                        {type === 'push' && <NotificationsIcon />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={type.charAt(0).toUpperCase() + type.slice(1)}
                        sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem' } }}
                      />
                      <Switch
                        checked={enabled}
                        onChange={(e) => handleNestedChange('preferences', 'notifications', { ...organizationData.preferences.notifications, [type]: e.target.checked })}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* Integration Status */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                  🔧 Integration Status
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <WifiIcon color="success" sx={{ mb: 1 }} />
                      <Typography variant="body2">WiFi Integration</Typography>
                      <Chip label="Ready" color="success" size="small" />
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <LightbulbIcon color="warning" sx={{ mb: 1 }} />
                      <Typography variant="body2">Smart Lighting</Typography>
                      <Chip label="Setup Required" color="warning" size="small" />
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <ThermostatIcon color="info" sx={{ mb: 1 }} />
                      <Typography variant="body2">Climate Control</Typography>
                      <Chip label="Optional" color="info" size="small" />
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <CameraIcon color="primary" sx={{ mb: 1 }} />
                      <Typography variant="body2">Security System</Typography>
                      <Chip label="Available" color="primary" size="small" />
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        );

        case 4: // Launch
          return (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  🚀 Ready to Launch!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Your library management system is configured and ready to go live
                </Typography>
              </Box>
            
            <Grid container spacing={3}>
              {/* Setup Summary */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, height: '100%', bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon />
                    Setup Complete
                  </Typography>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText 
                        primary={`Organization: ${organizationData.organizationName || 'Not set'}`}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText 
                        primary={`Location: ${organizationData.city || 'Not set'}, ${organizationData.state || 'Not set'}`}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText 
                        primary={`Capacity: ${organizationData.totalSeats || 0} seats`}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText 
                        primary={`Payment: ${organizationData.paymentMethod?.toUpperCase() || 'Not set'}`}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText 
                        primary={`Staff: ${organizationData.staffMembers?.length || 0} members`}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                      />
                    </ListItem>
                  </List>
                </Card>
              </Grid>
              
              {/* Permissions & Agreements */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, height: '100%', bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'warning.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockIcon />
                    Permissions & Agreements
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Please review and accept the following permissions to launch your system:
                  </Typography>
                  
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={permissions.dataProcessing}
                            onChange={(e) => setPermissions(prev => ({ ...prev, dataProcessing: e.target.checked }))}
                            size="small"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Data Processing
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Allow processing of student and operational data
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={permissions.marketing}
                            onChange={(e) => setPermissions(prev => ({ ...prev, marketing: e.target.checked }))}
                            size="small"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Marketing Communications
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Send promotional emails and updates
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={permissions.analytics}
                            onChange={(e) => setPermissions(prev => ({ ...prev, analytics: e.target.checked }))}
                            size="small"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Analytics & Insights
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Collect usage data for system improvement
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={permissions.thirdParty}
                            onChange={(e) => setPermissions(prev => ({ ...prev, thirdParty: e.target.checked }))}
                            size="small"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Third-Party Integrations
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Enable payment gateways and external services
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={permissions.termsAccepted}
                            onChange={(e) => setPermissions(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                            size="small"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Terms & Conditions
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              I agree to the terms of service and privacy policy
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </List>
                </Card>
              </Grid>
            </Grid>
            
            {/* Quick Access */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
                🎯 Quick Access After Launch
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    startIcon={<SchoolIcon />} 
                    fullWidth
                    size="small"
                    onClick={() => navigate('/students')}
                  >
                    Students
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    startIcon={<CreditCardIcon />} 
                    fullWidth
                    size="small"
                    onClick={() => navigate('/payments')}
                  >
                    Payments
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    startIcon={<AnalyticsIcon />} 
                    fullWidth
                    size="small"
                    onClick={() => navigate('/analytics')}
                  >
                    Analytics
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    startIcon={<SettingsIcon />} 
                    fullWidth
                    size="small"
                    onClick={() => navigate('/settings')}
                  >
                    Settings
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );

        default:
          return null;
      }
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
        pointerEvents: 'none',
      }
    }}>
      <Container maxWidth="xl" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 0, position: 'relative', zIndex: 1 }}>
        {/* Enhanced Header */}
        <Box sx={{ 
          py: 3, 
          px: 3, 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-5px)' },
                }
              }}>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                  🎓
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                }}>
                  Organization Setup
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {currentStep === 1 ? 'Basic Setup' : 'Advanced Configuration'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip 
                label="Step 1" 
                color={currentStep === 1 ? 'primary' : 'default'}
                variant={currentStep === 1 ? 'filled' : 'outlined'}
                onClick={() => setCurrentStep(1)}
                sx={{ 
                  cursor: 'pointer', 
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  background: currentStep === 1 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.8)',
                  color: currentStep === 1 ? 'white' : 'text.primary',
                  border: currentStep === 1 ? 'none' : '2px solid rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: currentStep === 1 ? '0 5px 15px rgba(102, 126, 234, 0.4)' : '0 5px 15px rgba(102, 126, 234, 0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
                size="medium"
              />
              <Chip 
                label="Step 2" 
                color={currentStep === 2 ? 'primary' : 'default'}
                variant={currentStep === 2 ? 'filled' : 'outlined'}
                onClick={() => setCurrentStep(2)}
                sx={{ 
                  cursor: 'pointer', 
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  background: currentStep === 2 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.8)',
                  color: currentStep === 2 ? 'white' : 'text.primary',
                  border: currentStep === 2 ? 'none' : '2px solid rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: currentStep === 2 ? '0 5px 15px rgba(102, 126, 234, 0.4)' : '0 5px 15px rgba(102, 126, 234, 0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
                size="medium"
              />
            {activeTab > 0 && (
              <Button
                variant="text"
                size="small"
                onClick={handleBackTab}
                startIcon={<BackIcon />}
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  minWidth: 'auto',
                  px: 1
                }}
              >
                Back
              </Button>
            )}
            {activeTab < currentTabs.length - 1 && (
              <Button
                variant="text"
                size="small"
                onClick={handleSkipTab}
                startIcon={<SkipIcon />}
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  minWidth: 'auto',
                  px: 1
                }}
              >
                Skip
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Tabbed Interface */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'rgba(255, 255, 255, 0.2)', 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              minHeight: 56,
              '& .MuiTab-root': {
                fontSize: '0.85rem',
                fontWeight: 600,
                minHeight: 56,
                textTransform: 'none',
                color: 'text.secondary',
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  color: 'primary.main',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  borderRadius: '12px 12px 0 0',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                },
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: '12px 12px 0 0',
                  transform: 'translateY(-1px)',
                },
              },
              '& .MuiTabs-indicator': {
                height: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '2px 2px 0 0',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)',
              },
            }}
          >
            {currentTabs.map((tab, index) => (
              <Tab
                key={tab.label}
                label={
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {tab.icon}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.8rem',
                        textDecoration: skippedTabs.includes(index) ? 'line-through' : 'none',
                        opacity: skippedTabs.includes(index) ? 0.6 : 1
                      }}
                    >
                      {tab.label}
                    </Typography>
                    {skippedTabs.includes(index) && (
                      <Chip label="⏭" color="warning" size="small" sx={{ minWidth: 16, height: 16, fontSize: '0.6rem' }} />
                    )}
                    {!isTabValid(index) && !skippedTabs.includes(index) && (
                      <Chip label="!" color="error" size="small" sx={{ minWidth: 16, height: 16, fontSize: '0.6rem' }} />
                    )}
                  </Stack>
                }
                sx={{ 
                  minHeight: 48, 
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  '&.Mui-selected': {
                    bgcolor: 'primary.50',
                    color: 'primary.main'
                  },
                  opacity: skippedTabs.includes(index) ? 0.7 : 1
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Enhanced Content Area */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Card sx={{ 
            height: '100%', 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }
          }}>
            <CardContent sx={{ 
              height: '100%', 
              overflow: 'auto', 
              p: 4,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '4px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              },
            }}>
              {renderTabContent(activeTab)}
            </CardContent>
          </Card>
        </Box>

        {/* Enhanced Action Bar */}
        <Box sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: 'rgba(255, 255, 255, 0.2)', 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.1)',
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2}>
              {currentStep === 2 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handlePrevStep}
                  startIcon={<BackIcon />}
                >
                  Back
                </Button>
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={saveData}
                startIcon={<SaveIcon />}
              >
                Save
              </Button>
            </Stack>
            
            <Stack direction="row" spacing={1}>
              {/* Back Button - only show if not on first tab */}
              {activeTab > 0 && (
                <Button
                  variant="text"
                  size="small"
                  onClick={handleBackTab}
                  startIcon={<BackIcon />}
                  sx={{ color: 'text.secondary' }}
                >
                  Back
                </Button>
              )}
              
              {/* Skip Button - only show if not on last tab and not launch tab */}
              {activeTab < currentTabs.length - 1 && (
                <Button
                  variant="text"
                  size="medium"
                  onClick={handleSkipTab}
                  startIcon={<SkipIcon />}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': {
                      background: 'rgba(255, 152, 0, 0.1)',
                      color: 'warning.main',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Skip
                </Button>
              )}
              
              {currentStep === 1 ? (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleNextStep}
                  endIcon={<NextIcon />}
                  disabled={!isTabValid(activeTab)}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                    },
                    '&:disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)',
                      boxShadow: 'none',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Continue
                </Button>
              ) : activeTab === currentTabs.length - 1 ? (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleLaunch}
                  startIcon={<RocketIcon />}
                  sx={{ 
                    minWidth: 180,
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                    color: 'white',
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(255, 107, 107, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ff5252 0%, #d63031 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(255, 107, 107, 0.5)',
                    },
                    '&:disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)',
                      boxShadow: 'none',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  disabled={!isTabValid(activeTab)}
                >
                  Launch! 🚀
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setActiveTab(activeTab + 1)}
                  endIcon={<NextIcon />}
                  disabled={!isTabValid(activeTab)}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                    },
                    '&:disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)',
                      boxShadow: 'none',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Next
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Staff Dialog */}
      <Dialog open={staffDialogOpen} onClose={handleCloseStaffDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {staffDialogMode === 'add' ? 'Add New Staff Member' : 'Edit Staff Member'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Full Name"
              value={currentStaff.name}
              onChange={(e) => setCurrentStaff({ ...currentStaff, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={currentStaff.email}
              onChange={(e) => setCurrentStaff({ ...currentStaff, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Phone"
              value={currentStaff.phone}
              onChange={(e) => setCurrentStaff({ ...currentStaff, phone: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={currentStaff.role}
                onChange={(e) => setCurrentStaff({ ...currentStaff, role: e.target.value })}
              >
                <MenuItem value="Manager">Manager</MenuItem>
                <MenuItem value="Staff">Staff</MenuItem>
                <MenuItem value="Receptionist">Receptionist</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Security">Security</MenuItem>
                <MenuItem value="Cleaner">Cleaner</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={currentStaff.isActive}
                  onChange={(e) => setCurrentStaff({ ...currentStaff, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStaffDialog} disabled={staffLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveStaff}
            variant="contained"
            disabled={staffLoading || !currentStaff.name || !currentStaff.email}
            startIcon={staffLoading ? <CircularProgress size={20} /> : null}
          >
            {staffDialogMode === 'add' ? 'Add' : 'Update'} Staff
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default OrganizationOnboardingDashboard;