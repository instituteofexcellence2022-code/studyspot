import React, { useState, useRef, useMemo, useCallback } from 'react';
import ZoneEditDialog from '../../components/seats/ZoneEditDialog';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  Slider,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  GridOn,
  EventSeat,
  Wc,
  Restaurant,
  Groups,
  LocalLibrary,
  ZoomIn,
  ZoomOut,
  Save,
  Visibility,
  Edit,
  Delete,
  Add,
  Remove,
  ArrowUpward,
  ArrowDownward,
  ArrowBack,
  ArrowForward,
  Apps,
  ViewModule,
  Help,
  AutoAwesome,
  Close,
  Lightbulb,
} from '@mui/icons-material';

interface Seat {
  id: string;
  row: number;
  col: number;
  number: string;
  zone: string;
  x: number;
  y: number;
}

const UserFriendlyDesigner: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Wizard steps
  const [activeStep, setActiveStep] = useState(0);
  const [layoutType, setLayoutType] = useState<'grid' | 'custom'>('grid');
  
  // Grid settings
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(10);
  const [seatWidth, setSeatWidth] = useState(60);
  const [seatHeight, setSeatHeight] = useState(60);
  const [rowSpacing, setRowSpacing] = useState(80);
  const [colSpacing, setColSpacing] = useState(80);
  const [startingNumber, setStartingNumber] = useState(1);
  const [numberingStyle, setNumberingStyle] = useState<'sequential' | 'row-based'>('row-based');
  
  // Layout elements
  const [seats, setSeats] = useState<Seat[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [layoutName, setLayoutName] = useState('My Library');
  
  // Amenities & Features
  const [amenities, setAmenities] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  // Zone marking
  const [markedZones, setMarkedZones] = useState<any[]>([]);
  const [isDrawingZone, setIsDrawingZone] = useState(false);
  const [currentZoneDraw, setCurrentZoneDraw] = useState<any>(null);
  const [selectedZoneType, setSelectedZoneType] = useState<string>('premium');
  const [editingZone, setEditingZone] = useState<any>(null);
  
  // AI Recommendations
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  
  // Custom Areas
  const [showCustomAreaDialog, setShowCustomAreaDialog] = useState(false);
  const [customAreaName, setCustomAreaName] = useState('');
  const [customAreaColor, setCustomAreaColor] = useState('#2196F3');

  const steps = ['Choose Template', 'Customize Areas', 'Add Amenities', 'Assign Zones', 'Preview & Save'];
  
  const availableAmenities = [
    { id: 'ac', label: 'Air Conditioning', icon: '❄️', color: '#2196F3' },
    { id: 'wifi', label: 'High-Speed WiFi', icon: '📶', color: '#4CAF50' },
    { id: 'power', label: 'Power Outlets', icon: '🔌', color: '#FF9800' },
    { id: 'locker', label: 'Personal Lockers', icon: '🔐', color: '#9C27B0' },
    { id: 'water', label: 'Water Cooler', icon: '💧', color: '#00BCD4' },
    { id: 'printer', label: 'Printer/Scanner', icon: '🖨️', color: '#607D8B' },
    { id: 'cctv', label: 'CCTV Security', icon: '📹', color: '#F44336' },
    { id: 'coffee', label: 'Coffee Machine', icon: '☕', color: '#795548' },
  ];
  
  const availableAreas = [
    { id: 'washroom', label: 'Washroom', icon: '🚻', color: '#2196F3' },
    { id: 'lunch', label: 'Lunch/Cafeteria', icon: '🍽️', color: '#FF9800' },
    { id: 'discussion', label: 'Discussion Room', icon: '💬', color: '#4CAF50' },
    { id: 'library', label: 'Book Shelves', icon: '📚', color: '#9C27B0' },
    { id: 'lounge', label: 'Lounge Area', icon: '🛋️', color: '#00BCD4' },
    { id: 'parking', label: 'Parking Space', icon: '🅿️', color: '#607D8B' },
    { id: 'reception', label: 'Reception Desk', icon: '🏪', color: '#E91E63' },
    { id: 'storage', label: 'Storage Room', icon: '📦', color: '#795548' },
  ];

  const themeTemplates = [
    {
      name: 'Modern Minimalist',
      icon: '🎨',
      description: 'Clean, simple, focused design',
      amenities: ['wifi', 'power', 'ac'],
      areas: [{ type: 'washroom', name: 'Washroom' }],
      color: '#000000',
    },
    {
      name: 'Traditional Library',
      icon: '📚',
      description: 'Classic book-focused setup',
      amenities: ['wifi', 'power'],
      areas: [
        { type: 'library', name: 'Book Section' },
        { type: 'washroom', name: 'Washroom' },
      ],
      color: '#795548',
    },
    {
      name: 'Luxury Premium',
      icon: '⭐',
      description: 'High-end executive lounge',
      amenities: ['ac', 'wifi', 'power', 'locker', 'water', 'coffee', 'cctv'],
      areas: [
        { type: 'washroom', name: 'Premium Washroom' },
        { type: 'lunch', name: 'Executive Cafe' },
        { type: 'lounge', name: 'Relaxation Lounge' },
        { type: 'reception', name: 'Concierge Desk' },
      ],
      color: '#FFD700',
    },
    {
      name: 'Tech-Savvy Hub',
      icon: '💻',
      description: 'Modern co-working space',
      amenities: ['wifi', 'power', 'printer', 'cctv'],
      areas: [
        { type: 'discussion', name: 'Collaboration Zone' },
        { type: 'washroom', name: 'Washroom' },
        { type: 'lunch', name: 'Cafe' },
      ],
      color: '#2196F3',
    },
    {
      name: 'Exam Focused',
      icon: '📝',
      description: 'Serious study environment',
      amenities: ['ac', 'wifi', 'power', 'cctv', 'water'],
      areas: [
        { type: 'washroom', name: 'Washroom (Male)' },
        { type: 'washroom', name: 'Washroom (Female)' },
      ],
      color: '#9C27B0',
    },
  ];

  const templates = [
    {
      name: 'Tiny Library',
      seats: 15,
      rows: 3,
      cols: 5,
      description: 'Home tuition, Small coaching',
      icon: '🏠',
      details: '15 seats, 1 zone, minimal setup',
      zones: { premium: 15 },
      areas: [],
      bestFor: 'Home tutors, Single room coaching',
      pricing: '₹15K-25K/month revenue',
    },
    {
      name: 'Small Library',
      seats: 40,
      rows: 5,
      cols: 8,
      description: 'Coaching center, Study room',
      icon: '📚',
      details: '40 seats, 2 zones, 1 washroom',
      zones: { premium: 16, reading: 24 },
      areas: [{ type: 'washroom', name: 'Washroom' }],
      bestFor: 'Coaching classes, Tuition centers',
      pricing: '₹80K-150K/month revenue',
    },
    {
      name: 'Medium Library',
      seats: 70,
      rows: 7,
      cols: 10,
      description: 'Community library, Study center',
      icon: '🏫',
      details: '70 seats, 3 zones, 2 areas',
      zones: { premium: 20, silent: 20, reading: 30 },
      areas: [
        { type: 'washroom', name: 'Washroom' },
        { type: 'lunch', name: 'Lunch Area' },
      ],
      bestFor: 'Community libraries, Study centers',
      pricing: '₹1.5L-2.5L/month revenue',
    },
    {
      name: 'Large Library',
      seats: 120,
      rows: 10,
      cols: 12,
      description: 'College library, Institute',
      icon: '🏢',
      details: '120 seats, 4 zones, 3 areas',
      zones: { premium: 24, silent: 30, 'exam-prep': 36, reading: 30 },
      areas: [
        { type: 'washroom', name: 'Washroom 1' },
        { type: 'washroom', name: 'Washroom 2' },
        { type: 'lunch', name: 'Cafeteria' },
      ],
      bestFor: 'Schools, Colleges, Big institutes',
      pricing: '₹3L-5L/month revenue',
    },
    {
      name: 'Exam Hall',
      seats: 150,
      rows: 15,
      cols: 10,
      description: 'Competitive exam center',
      icon: '📝',
      details: '150 seats, exam setup, 2 washrooms',
      zones: { 'exam-prep': 150 },
      areas: [
        { type: 'washroom', name: 'Washroom (Male)' },
        { type: 'washroom', name: 'Washroom (Female)' },
      ],
      bestFor: 'Exam centers, Test facilities',
      pricing: '₹4L-6L/month revenue',
    },
    {
      name: 'Premium Co-working',
      seats: 60,
      rows: 6,
      cols: 10,
      description: 'Executive study lounge',
      icon: '⭐',
      details: '60 premium seats, all amenities',
      zones: { premium: 40, discussion: 20 },
      areas: [
        { type: 'washroom', name: 'Washroom' },
        { type: 'lunch', name: 'Cafe' },
        { type: 'discussion', name: 'Meeting Rooms' },
      ],
      bestFor: 'Premium libraries, Co-working',
      pricing: '₹2L-3.5L/month revenue',
    },
    {
      name: 'University Library',
      seats: 200,
      rows: 20,
      cols: 10,
      description: 'Large campus library',
      icon: '🎓',
      details: '200 seats, 5 zones, full facility',
      zones: { premium: 40, silent: 60, 'exam-prep': 40, reading: 40, discussion: 20 },
      areas: [
        { type: 'washroom', name: 'Washroom 1' },
        { type: 'washroom', name: 'Washroom 2' },
        { type: 'lunch', name: 'Food Court' },
        { type: 'discussion', name: 'Group Study' },
        { type: 'library', name: 'Book Section' },
      ],
      bestFor: 'Universities, Large institutions',
      pricing: '₹6L-10L/month revenue',
    },
  ];

  const generateGridSeats = useCallback(() => {
    const newSeats: Seat[] = [];
    const startX = 100;
    const startY = 150;
    
    let seatNumber = startingNumber;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let number = '';
        
        if (numberingStyle === 'row-based') {
          number = `${String.fromCharCode(65 + row)}${col + 1}`;
        } else {
          number = `S${seatNumber}`;
          seatNumber++;
        }
        
        const x = startX + col * colSpacing;
        const y = startY + row * rowSpacing;
        
        // Auto-assign zones based on position
        let zone = 'reading';
        if (row < 2) zone = 'premium';
        else if (row < 4) zone = 'silent';
        else if (row < 6) zone = 'exam-prep';
        else if (col >= cols - 2) zone = 'discussion';
        
        newSeats.push({
          id: `seat-${row}-${col}`,
          row,
          col,
          number,
          zone,
          x,
          y,
        });
      }
    }
    
    setSeats(newSeats);
  }, [rows, cols, colSpacing, rowSpacing, startingNumber, numberingStyle]);

  const applyTemplate = (template: any) => {
    setRows(template.rows);
    setCols(template.cols);
    setRowSpacing(80);
    setColSpacing(80);
    setSelectedTemplate(template);
    
    // Auto-generate seats with template configuration
    const newSeats: Seat[] = [];
    const startX = 100;
    const startY = 150;
    
    let seatNumber = 1;
    
    // Calculate zone distribution
    const totalSeats = template.rows * template.cols;
    const premiumCount = template.zones.premium || 0;
    const silentCount = template.zones.silent || 0;
    const examPrepCount = template.zones['exam-prep'] || 0;
    const readingCount = template.zones.reading || 0;
    const discussionCount = template.zones.discussion || 0;
    
    let currentZoneSeats = 0;
    
    for (let row = 0; row < template.rows; row++) {
      for (let col = 0; col < template.cols; col++) {
        const number = `${String.fromCharCode(65 + row)}${col + 1}`;
        const x = startX + col * 80;
        const y = startY + row * 80;
        
        // Assign zone based on template distribution
        let zone = 'reading';
        if (currentZoneSeats < premiumCount) {
          zone = 'premium';
        } else if (currentZoneSeats < premiumCount + silentCount) {
          zone = 'silent';
        } else if (currentZoneSeats < premiumCount + silentCount + examPrepCount) {
          zone = 'exam-prep';
        } else if (currentZoneSeats < premiumCount + silentCount + examPrepCount + readingCount) {
          zone = 'reading';
        } else {
          zone = 'discussion';
        }
        
        newSeats.push({
          id: `seat-${row}-${col}`,
          row,
          col,
          number,
          zone,
          x,
          y,
        });
        
        currentZoneSeats++;
        seatNumber++;
      }
    }
    
    setSeats(newSeats);
    
    // Add template areas
    const newAreas: any[] = [];
    template.areas.forEach((area: any, index: number) => {
      newAreas.push({
        id: `area-${Date.now()}-${index}`,
        type: area.type,
        x: 50 + (index * 200),
        y: 50,
        width: 150,
        height: 100,
        name: area.name,
      });
    });
    setAreas(newAreas);
    
    // Set default amenities for premium templates
    if (template.name.includes('Premium') || template.name.includes('University')) {
      setAmenities(['ac', 'wifi', 'power', 'locker', 'water', 'cctv']);
    } else if (template.seats >= 60) {
      setAmenities(['wifi', 'power', 'water', 'cctv']);
    } else {
      setAmenities(['wifi', 'power']);
    }
    
    // Move to customization step
    setActiveStep(1);
  };
  
  const toggleAmenity = (amenityId: string) => {
    setAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };
  
  const addAreaByType = (areaType: string) => {
    const areaInfo = availableAreas.find(a => a.id === areaType);
    if (!areaInfo) return;
    
    const newArea = {
      id: `area-${Date.now()}`,
      type: areaType,
      x: 50 + (areas.length * 200),
      y: 50,
      width: 150,
      height: 100,
      name: areaInfo.label,
    };
    setAreas([...areas, newArea]);
  };
  
  const removeArea = (areaId: string) => {
    setAreas(areas.filter(a => a.id !== areaId));
  };
  
  const startDrawingZone = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    setIsDrawingZone(true);
    setCurrentZoneDraw({
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      type: selectedZoneType,
    });
  };
  
  const continueDrawingZone = (e: React.MouseEvent) => {
    if (!isDrawingZone || !currentZoneDraw || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    setCurrentZoneDraw({
      ...currentZoneDraw,
      endX: x,
      endY: y,
    });
  };
  
  const finishDrawingZone = () => {
    if (!currentZoneDraw) return;
    
    const width = Math.abs(currentZoneDraw.endX - currentZoneDraw.startX);
    const height = Math.abs(currentZoneDraw.endY - currentZoneDraw.startY);
    
    if (width > 20 && height > 20) {
      const newZone = {
        id: `zone-${Date.now()}`,
        x: Math.min(currentZoneDraw.startX, currentZoneDraw.endX),
        y: Math.min(currentZoneDraw.startY, currentZoneDraw.endY),
        width,
        height,
        type: currentZoneDraw.type,
        label: zoneConfig[currentZoneDraw.type as keyof typeof zoneConfig]?.label || currentZoneDraw.type,
      };
      setMarkedZones([...markedZones, newZone]);
    }
    
    setIsDrawingZone(false);
    setCurrentZoneDraw(null);
  };
  
  const removeMarkedZone = (zoneId: string) => {
    setMarkedZones(markedZones.filter(z => z.id !== zoneId));
  };
  
  const updateZoneLabel = (zoneId: string, newLabel: string) => {
    setMarkedZones(markedZones.map(z =>
      z.id === zoneId ? { ...z, label: newLabel } : z
    ));
  };
  
  // AI Recommendation Engine
  const generateAIRecommendations = useCallback(() => {
    const recommendations: any[] = [];
    const totalSeats = seats.length;
    const premiumSeats = stats.byZone.premium || 0;
    const silentSeats = stats.byZone.silent || 0;
    
    // Revenue Optimization
    if (premiumSeats < totalSeats * 0.2 && totalSeats > 30) {
      recommendations.push({
        id: 'revenue-1',
        type: 'revenue',
        priority: 'high',
        title: '💰 Increase Premium Seats',
        description: `Only ${premiumSeats} premium seats (${Math.round((premiumSeats/totalSeats)*100)}%). Recommend 20-30% for better revenue.`,
        action: 'Add 5-10 more premium seats with AC',
        impact: `+₹${Math.round(totalSeats * 500)}-${Math.round(totalSeats * 800)}/month`,
      });
    }
    
    // Amenity Suggestions
    if (!amenities.includes('ac') && totalSeats >= 40) {
      recommendations.push({
        id: 'amenity-1',
        type: 'amenity',
        priority: 'high',
        title: '❄️ Add Air Conditioning',
        description: 'Libraries with 40+ seats typically offer AC for premium zones.',
        action: 'Add AC amenity to increase pricing by 30-50%',
        impact: `+₹${Math.round(totalSeats * 600)}/month potential`,
      });
    }
    
    if (!amenities.includes('locker') && totalSeats >= 60) {
      recommendations.push({
        id: 'amenity-2',
        type: 'amenity',
        priority: 'medium',
        title: '🔐 Add Personal Lockers',
        description: 'Students value secure storage. Charge ₹200-300 extra per seat.',
        action: 'Add locker amenity',
        impact: `+₹${Math.round(totalSeats * 250)}/month`,
      });
    }
    
    // Layout Optimization
    if (totalSeats > 60 && areas.filter(a => a.type === 'washroom').length < 2) {
      recommendations.push({
        id: 'layout-1',
        type: 'layout',
        priority: 'high',
        title: '🚻 Add More Washrooms',
        description: 'Libraries with 60+ seats should have at least 2 washrooms (male/female).',
        action: 'Add 1 more washroom',
        impact: 'Better student experience & retention',
      });
    }
    
    if (totalSeats > 50 && !areas.some(a => a.type === 'lunch')) {
      recommendations.push({
        id: 'layout-2',
        type: 'layout',
        priority: 'medium',
        title: '🍽️ Add Lunch/Break Area',
        description: 'Students staying 4+ hours need refreshment space.',
        action: 'Add lunch area for longer sessions',
        impact: 'Increase session duration & renewals',
      });
    }
    
    // Zone Distribution
    if (silentSeats < totalSeats * 0.15 && totalSeats > 40) {
      recommendations.push({
        id: 'zone-1',
        type: 'zone',
        priority: 'medium',
        title: '🤫 Increase Silent Zone',
        description: 'Only 15% in silent zone. Exam students prefer 20-30% silent seating.',
        action: 'Convert 5-10 seats to silent zone',
        impact: 'Attract exam preparation students',
      });
    }
    
    // Best Practices
    if (totalSeats >= 80 && !amenities.includes('cctv')) {
      recommendations.push({
        id: 'security-1',
        type: 'security',
        priority: 'high',
        title: '📹 Add CCTV Security',
        description: 'Large libraries need security monitoring for safety.',
        action: 'Add CCTV cameras',
        impact: 'Increased trust & safety perception',
      });
    }
    
    // Success Tips
    if (amenities.length >= 5 && premiumSeats > totalSeats * 0.25) {
      recommendations.push({
        id: 'success-1',
        type: 'success',
        priority: 'low',
        title: '✅ Great Setup!',
        description: 'Your library has premium features & good zone distribution.',
        action: 'Market as "Premium Study Lounge"',
        impact: 'Justify 40-60% higher pricing',
      });
    }
    
    setAiRecommendations(recommendations);
  }, [seats, amenities, areas]);
  
  // Generate recommendations when data changes
  React.useEffect(() => {
    if (seats.length > 0) {
      generateAIRecommendations();
    }
  }, [seats, amenities, areas, generateAIRecommendations]);
  
  const applyAIRecommendation = (recId: string) => {
    const rec = aiRecommendations.find(r => r.id === recId);
    if (!rec) return;
    
    switch (recId) {
      case 'amenity-1':
        setAmenities([...amenities, 'ac']);
        break;
      case 'amenity-2':
        setAmenities([...amenities, 'locker']);
        break;
      case 'layout-1':
        addAreaByType('washroom');
        break;
      case 'layout-2':
        addAreaByType('lunch');
        break;
      case 'security-1':
        setAmenities([...amenities, 'cctv']);
        break;
      default:
        alert('Manual action required. Please follow the recommendation manually.');
    }
    
    // Remove applied recommendation
    setAiRecommendations(aiRecommendations.filter(r => r.id !== recId));
  };
  
  // AI Auto-Design Feature
  const aiAutoDesign = () => {
    if (!selectedTemplate) {
      alert('Please choose a template first!');
      return;
    }
    
    const totalSeats = seats.length;
    
    // Auto-apply all high-priority recommendations
    const autoAmenities = ['wifi', 'power'];
    
    if (totalSeats >= 40) {
      autoAmenities.push('ac', 'water', 'cctv');
    }
    
    if (totalSeats >= 60) {
      autoAmenities.push('locker');
    }
    
    if (totalSeats >= 80) {
      autoAmenities.push('printer');
    }
    
    setAmenities(autoAmenities);
    
    // Auto-add optimal areas
    const autoAreas: any[] = [];
    
    // Always add washroom
    autoAreas.push({
      id: `area-${Date.now()}-1`,
      type: 'washroom',
      x: 50,
      y: 50,
      width: 150,
      height: 100,
      name: 'Washroom',
    });
    
    // Add 2nd washroom for 60+ seats
    if (totalSeats >= 60) {
      autoAreas.push({
        id: `area-${Date.now()}-2`,
        type: 'washroom',
        x: 250,
        y: 50,
        width: 150,
        height: 100,
        name: 'Washroom 2',
      });
    }
    
    // Add lunch area for 50+ seats
    if (totalSeats >= 50) {
      autoAreas.push({
        id: `area-${Date.now()}-3`,
        type: 'lunch',
        x: 450,
        y: 50,
        width: 150,
        height: 100,
        name: 'Cafeteria',
      });
    }
    
    // Add discussion room for 70+ seats
    if (totalSeats >= 70) {
      autoAreas.push({
        id: `area-${Date.now()}-4`,
        type: 'discussion',
        x: 650,
        y: 50,
        width: 150,
        height: 100,
        name: 'Discussion Room',
      });
    }
    
    setAreas(autoAreas);
    
    // Auto-mark zones
    const autoMarkedZones: any[] = [];
    
    // Premium zone (front area)
    autoMarkedZones.push({
      id: `zone-${Date.now()}-1`,
      x: 100,
      y: 150,
      width: 600,
      height: 160,
      type: 'premium',
      label: '⭐ Premium Zone (AC)',
    });
    
    // Silent zone (middle area)
    if (totalSeats >= 50) {
      autoMarkedZones.push({
        id: `zone-${Date.now()}-2`,
        x: 100,
        y: 330,
        width: 600,
        height: 160,
        type: 'silent',
        label: '🤫 Silent Study Zone',
      });
    }
    
    setMarkedZones(autoMarkedZones);
    
    alert('✨ AI has designed your library!\n\n' +
      `✓ ${autoAmenities.length} amenities added\n` +
      `✓ ${autoAreas.length} areas placed\n` +
      `✓ ${autoMarkedZones.length} zones marked\n\n` +
      'Review and customize as needed!');
    
    // Jump to preview step
    setActiveStep(4);
  };
  
  // Apply Theme
  const applyTheme = (theme: any) => {
    if (!selectedTemplate) {
      alert('Please choose a size template first!');
      return;
    }
    
    // Apply theme amenities
    setAmenities(theme.amenities);
    
    // Apply theme areas
    const themeAreas = theme.areas.map((area: any, index: number) => ({
      id: `area-${Date.now()}-${index}`,
      type: area.type,
      x: 50 + (index * 200),
      y: 50,
      width: 150,
      height: 100,
      name: area.name,
    }));
    setAreas(themeAreas);
    
    setLayoutName(`${selectedTemplate.name} - ${theme.name}`);
    
    alert(`✅ ${theme.name} theme applied!\nCustomize further as needed.`);
  };
  
  // Add Custom Area
  const addCustomArea = () => {
    if (!customAreaName.trim()) {
      alert('Please enter an area name!');
      return;
    }
    
    const newArea = {
      id: `area-${Date.now()}`,
      type: 'custom',
      x: 50 + (areas.length * 200),
      y: 50,
      width: 150,
      height: 100,
      name: customAreaName,
      color: customAreaColor,
    };
    
    setAreas([...areas, newArea]);
    setCustomAreaName('');
    setCustomAreaColor('#2196F3');
    setShowCustomAreaDialog(false);
    
    alert(`✅ Custom area "${customAreaName}" added!`);
  };

  const handleSeatClick = useCallback((seatId: string) => {
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  }, []);

  const bulkAssignZone = useCallback((zone: string) => {
    if (selectedSeats.length === 0) return;
    setSeats(prev => prev.map(seat =>
      selectedSeats.includes(seat.id) ? { ...seat, zone } : seat
    ));
    setSelectedSeats([]);
  }, [selectedSeats]);

  const selectRow = useCallback((rowIndex: number) => {
    const rowSeats = seats.filter(s => s.row === rowIndex).map(s => s.id);
    setSelectedSeats(rowSeats);
  }, [seats]);

  const selectColumn = useCallback((colIndex: number) => {
    const colSeats = seats.filter(s => s.col === colIndex).map(s => s.id);
    setSelectedSeats(colSeats);
  }, [seats]);

  const deleteSelected = useCallback(() => {
    setSeats(prev => prev.filter(s => !selectedSeats.includes(s.id)));
    setSelectedSeats([]);
  }, [selectedSeats]);

  const addArea = (type: string) => {
    const newArea = {
      id: `area-${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width: 150,
      height: 100,
      name: type === 'washroom' ? 'Washroom' : type === 'lunch' ? 'Lunch Area' : 'Discussion Zone',
    };
    setAreas([...areas, newArea]);
  };

  const zoneConfig = {
    premium: { label: '⭐ Premium', color: '#FFD700' },
    silent: { label: '🤫 Silent', color: '#2196F3' },
    'exam-prep': { label: '📝 Exam Prep', color: '#9C27B0' },
    reading: { label: '📖 Reading', color: '#4CAF50' },
    discussion: { label: '💬 Discussion', color: '#FF9800' },
  };

  const stats = useMemo(() => {
    const byZone = {
      premium: 0,
      silent: 0,
      'exam-prep': 0,
      reading: 0,
      discussion: 0,
    };
    
    seats.forEach(seat => {
      if (byZone.hasOwnProperty(seat.zone)) {
        byZone[seat.zone as keyof typeof byZone]++;
      }
    });
    
    return {
      total: seats.length,
      byZone,
    };
  }, [seats]);

  const saveLayout = () => {
    const layoutData = {
      name: layoutName,
      seats,
      areas,
      markedZones,
      amenities,
      config: { rows, cols, seatWidth, seatHeight, rowSpacing, colSpacing },
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('libraryLayout', JSON.stringify(layoutData));
    alert('✅ Layout saved successfully with all zones and amenities!');
  };

  return (
    <Box sx={{ 
      bgcolor: '#f5f7fa', 
      minHeight: '100vh', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Compact Header - 80px */}
      <Paper 
        elevation={2} 
        sx={{ 
          height: 80,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          px: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <AutoAwesome sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Library Designer
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Professional layout creator
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip 
            label={`${stats.total} Seats`} 
            sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold' }} 
            size="medium"
          />
          <Chip 
            label={`${areas.length} Areas`} 
            sx={{ bgcolor: 'white', color: 'success.main', fontWeight: 'bold' }} 
            size="medium"
          />
          <Chip 
            label={`${amenities.length} Amenities`} 
            sx={{ bgcolor: 'white', color: 'warning.main', fontWeight: 'bold' }} 
            size="medium"
          />
          <Button
            variant="contained"
            startIcon={<AutoAwesome />}
            onClick={aiAutoDesign}
            sx={{ 
              bgcolor: 'white',
              color: '#667eea',
              fontWeight: 'bold',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
            }}
          >
            AI Design
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={saveLayout}
            sx={{ 
              bgcolor: '#4CAF50',
              '&:hover': { bgcolor: '#45a049' }
            }}
          >
            Save
          </Button>
        </Stack>
      </Paper>

      {/* Main Dashboard - 3 Columns: LEFT | CANVAS | RIGHT */}
      <Box sx={{ 
        display: 'flex', 
        flex: 1,
        overflow: 'hidden',
        height: 'calc(100vh - 80px)',
        gap: 2,
        p: 2,
      }}>
        
        {/* LEFT PANEL - 250px */}
        <Paper 
          elevation={2} 
          sx={{ 
            width: 250, 
            overflow: 'auto', 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Template Selection */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📋 Template
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedTemplate?.name || ''}
                displayEmpty
                onChange={(e) => {
                  const template = templates.find(t => t.name === e.target.value);
                  if (template) {
                    applyTemplate(template);
                    setLayoutType('grid');
                    setLayoutName(template.name);
                  }
                }}
              >
                <MenuItem value="" disabled>Choose size...</MenuItem>
                {templates.map((template, index) => (
                  <MenuItem key={index} value={template.name}>
                    {template.icon} {template.name.replace(' Library', '')} ({template.seats})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider />

          {/* Layout Type */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🏛️ Layout
            </Typography>
            <RadioGroup row value={layoutType} onChange={(e) => setLayoutType(e.target.value as any)}>
              <FormControlLabel value="grid" control={<Radio size="small" />} label="Grid" />
              <FormControlLabel value="custom" control={<Radio size="small" />} label="Custom" />
            </RadioGroup>
          </Box>

          <Divider />

          {/* Areas */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              🏢 Areas ({areas.length})
              <IconButton size="small" onClick={() => setShowCustomAreaDialog(true)}>
                <Add fontSize="small" />
              </IconButton>
            </Typography>
            {areas.length === 0 ? (
              <Typography variant="caption" color="text.secondary">No areas added</Typography>
            ) : (
              <Stack spacing={0.5}>
                {areas.slice(0, 5).map((area) => {
                  const areaInfo = availableAreas.find(a => a.id === area.type);
                  return (
                    <Box key={area.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography fontSize="0.875rem">{areaInfo?.icon}</Typography>
                        <Typography variant="caption">{area.name}</Typography>
                      </Box>
                      <IconButton size="small" onClick={() => removeArea(area.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>

          <Divider />

          {/* Amenities */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              ⚡ Amenities ({amenities.length})
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              {availableAmenities.map((amenity) => {
                const isSelected = amenities.includes(amenity.id);
                return (
                  <Chip
                    key={amenity.id}
                    label={amenity.label}
                    size="small"
                    icon={<Typography fontSize="0.75rem">{amenity.icon}</Typography>}
                    color={isSelected ? "primary" : "default"}
                    variant={isSelected ? "filled" : "outlined"}
                    onClick={() => toggleAmenity(amenity.id)}
                    sx={{ fontSize: '0.75rem' }}
                  />
                );
              })}
            </Stack>
          </Box>
        </Paper>

        {/* CENTER CANVAS - Flex grow */}
        <Paper 
          elevation={3}
          ref={canvasRef}
          sx={{ 
            flex: 1,
            overflow: 'auto',
            position: 'relative',
            cursor: isDrawingZone ? 'crosshair' : 'default',
            bgcolor: '#fff',
          }}
          onMouseDown={startDrawingZone}
          onMouseMove={continueDrawingZone}
          onMouseUp={finishDrawingZone}
          onMouseLeave={finishDrawingZone}
        >
          {/* Canvas Toolbar */}
          <Box sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            p: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e0e0e0',
          }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Live Preview
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton size="small" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                <ZoomOut />
              </IconButton>
              <Chip label={`${(zoom * 100).toFixed(0)}%`} size="small" />
              <IconButton size="small" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                <ZoomIn />
              </IconButton>
            </Stack>
          </Box>

          {/* Seat Grid */}
          <Box
            sx={{
              width: 1000 * zoom,
              height: 700 * zoom,
              position: 'relative',
              margin: '20px auto',
            }}
          >
            {/* Marked Zones */}
            {markedZones.map((zone) => (
              <Box
                key={zone.id}
                sx={{
                  position: 'absolute',
                  left: zone.x * zoom,
                  top: zone.y * zoom,
                  width: zone.width * zoom,
                  height: zone.height * zoom,
                  bgcolor: `${zone.color}30`,
                  border: `2px dashed ${zone.color}`,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" fontWeight="bold" sx={{ color: zone.color }}>
                  {zone.label}
                </Typography>
              </Box>
            ))}

            {/* Seats */}
            {seats.map((seat) => {
              const isSelected = selectedSeats.includes(seat.id);
              const zoneInfo = zoneConfig[seat.zone as keyof typeof zoneConfig];
              return (
                <Tooltip key={seat.id} title={`Seat ${seat.number} - ${zoneInfo?.label || 'Unassigned'}`} arrow>
                  <Box
                    onClick={(e) => handleSeatClick(seat.id)}
                    sx={{
                      position: 'absolute',
                      left: seat.x * zoom,
                      top: seat.y * zoom,
                      width: seatWidth * zoom,
                      height: seatHeight * zoom,
                      bgcolor: isSelected ? '#2196F3' : zoneInfo?.color || '#9E9E9E',
                      border: '2px solid',
                      borderColor: isSelected ? '#1976D2' : 'white',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        zIndex: 10,
                        boxShadow: 4,
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      fontWeight="bold" 
                      sx={{ 
                        color: 'white',
                        fontSize: `${10 * zoom}px`,
                      }}
                    >
                      {seat.number}
                    </Typography>
                  </Box>
                </Tooltip>
              );
            })}

            {/* Empty State */}
            {seats.length === 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}
              >
                <AutoAwesome sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Select a template or use AI Design
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* RIGHT PANEL - 300px */}
        <Paper 
          elevation={2} 
          sx={{ 
            width: 300, 
            overflow: 'auto', 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* AI Recommendations */}
          {aiRecommendations.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lightbulb sx={{ color: '#FF9800', fontSize: 20 }} />
                Suggestions ({aiRecommendations.length})
              </Typography>
              <Stack spacing={1}>
                {aiRecommendations.slice(0, 3).map((rec) => (
                  <Card 
                    key={rec.id} 
                    variant="outlined"
                    sx={{
                      borderLeft: `4px solid ${
                        rec.priority === 'high' ? '#F44336' : 
                        rec.priority === 'medium' ? '#FF9800' : 
                        '#4CAF50'
                      }`,
                    }}
                  >
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="caption" fontWeight="bold" display="block">
                        {rec.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>
                        {rec.description}
                      </Typography>
                      {['amenity-1', 'amenity-2', 'layout-1', 'layout-2', 'security-1'].includes(rec.id) && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => applyAIRecommendation(rec.id)}
                          sx={{ mt: 0.5, fontSize: '0.7rem', py: 0.5 }}
                        >
                          Apply
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}

          <Divider />

          {/* Zone Tools */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              🎨 Zone Tools
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Select zone, then click & drag on canvas
            </Typography>
            <Stack spacing={0.5}>
              {Object.entries(zoneConfig).map(([key, value]) => (
                <Button
                  key={key}
                  variant={selectedZoneType === key ? 'contained' : 'outlined'}
                  size="small"
                  fullWidth
                  onClick={() => setSelectedZoneType(key)}
                  sx={{
                    justifyContent: 'flex-start',
                    bgcolor: selectedZoneType === key ? value.color : 'transparent',
                    color: selectedZoneType === key ? 'white' : 'inherit',
                    borderColor: value.color,
                    '&:hover': {
                      bgcolor: selectedZoneType === key ? value.color : `${value.color}20`,
                      borderColor: value.color,
                    },
                  }}
                >
                  {value.label}
                </Button>
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Zone Stats */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              📊 Zone Stats
            </Typography>
            {stats.total > 0 ? (
              <Stack spacing={0.5}>
                {Object.entries(stats.byZone).map(([zone, count]) => {
                  const zoneInfo = zoneConfig[zone as keyof typeof zoneConfig];
                  return count > 0 ? (
                    <Box key={zone} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption">{zoneInfo?.label}</Typography>
                      <Chip label={`${count} seats`} size="small" sx={{ bgcolor: zoneInfo?.color, color: 'white' }} />
                    </Box>
                  ) : null;
                })}
              </Stack>
            ) : (
              <Typography variant="caption" color="text.secondary">
                No seats assigned to zones yet
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Dialogs */}
      <ZoneEditDialog
        open={editingZone !== null}
        zone={editingZone}
        onClose={() => setEditingZone(null)}
        onSave={(updatedZone) => {
          setMarkedZones(markedZones.map(z => z.id === updatedZone.id ? updatedZone : z));
          setEditingZone(null);
        }}
      />

      <Dialog open={showCustomAreaDialog} onClose={() => setShowCustomAreaDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Custom Area</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Area Name"
              fullWidth
              value={customAreaName}
              onChange={(e) => setCustomAreaName(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select
                value={customAreaColor}
                onChange={(e) => setCustomAreaColor(e.target.value)}
                label="Color"
              >
                <MenuItem value="#FF5722">Red</MenuItem>
                <MenuItem value="#2196F3">Blue</MenuItem>
                <MenuItem value="#4CAF50">Green</MenuItem>
                <MenuItem value="#FF9800">Orange</MenuItem>
                <MenuItem value="#9C27B0">Purple</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCustomAreaDialog(false)}>Cancel</Button>
          <Button onClick={addCustomArea} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserFriendlyDesigner;
