import React, { useState, useRef, useMemo, useCallback } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Save,
  Delete,
  Edit,
  EventSeat,
  Wc,
  Restaurant,
  Groups,
  LocalLibrary,
  Print,
  Coffee,
  MeetingRoom,
  Stairs,
  ExitToApp,
  LocalParking,
  AcUnit,
  Wifi,
  LocalCafe,
  ZoomIn,
  ZoomOut,
  GridOn,
  Undo,
  Redo,
} from '@mui/icons-material';

interface LayoutElement {
  id: string;
  type: 'seat' | 'area' | 'amenity';
  x: number;
  y: number;
  width: number;
  height: number;
  data: any;
}

interface Seat extends LayoutElement {
  type: 'seat';
  data: {
    number: string;
    zone: string;
    features: string[];
    pricing: { hourly: number; daily: number; weekly: number; monthly: number };
  };
}

interface Area extends LayoutElement {
  type: 'area';
  data: {
    name: string;
    areaType: 'washroom' | 'lunch' | 'discussion' | 'library' | 'entrance' | 'stairs' | 'exit' | 'parking';
    color: string;
  };
}

interface Amenity extends LayoutElement {
  type: 'amenity';
  data: {
    name: string;
    amenityType: 'ac' | 'wifi' | 'printer' | 'coffee' | 'water';
    icon: string;
  };
}

const LayoutDesigner: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<LayoutElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<LayoutElement | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [gridSize] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [draggedElement, setDraggedElement] = useState<LayoutElement | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [layoutName, setLayoutName] = useState('My Library Layout');

  // Template configurations
  const seatTemplate = {
    width: 60,
    height: 60,
    zones: ['silent', 'reading', 'discussion', 'exam-prep', 'premium'],
    features: ['window', 'power', 'wifi', 'locker', 'ac', 'naturalLight', 'cushionedChair'],
  };

  const areaTemplates = {
    washroom: { name: 'Washroom', color: '#E3F2FD', icon: <Wc /> },
    lunch: { name: 'Lunch Area', color: '#FFF3E0', icon: <Restaurant /> },
    discussion: { name: 'Discussion Zone', color: '#F3E5F5', icon: <Groups /> },
    library: { name: 'Book Shelves', color: '#E8F5E9', icon: <LocalLibrary /> },
    entrance: { name: 'Entrance', color: '#FFF9C4', icon: <MeetingRoom /> },
    stairs: { name: 'Stairs', color: '#CFD8DC', icon: <Stairs /> },
    exit: { name: 'Exit', color: '#FFEBEE', icon: <ExitToApp /> },
    parking: { name: 'Parking', color: '#E0E0E0', icon: <LocalParking /> },
  };

  const amenityTemplates = {
    ac: { name: 'AC Unit', icon: '❄️' },
    wifi: { name: 'WiFi Router', icon: '📶' },
    printer: { name: 'Printer', icon: '🖨️' },
    coffee: { name: 'Coffee Machine', icon: '☕' },
    water: { name: 'Water Cooler', icon: '💧' },
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || activeTab === 0) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom / gridSize) * gridSize;
    const y = Math.round((e.clientY - rect.top) / zoom / gridSize) * gridSize;

    if (activeTab === 1) {
      // Add Seat
      addSeat(x, y);
    }
  }, [activeTab, zoom, gridSize]);

  const addSeat = (x: number, y: number) => {
    const newSeat: Seat = {
      id: `seat-${Date.now()}`,
      type: 'seat',
      x,
      y,
      width: seatTemplate.width,
      height: seatTemplate.height,
      data: {
        number: `S${elements.filter(e => e.type === 'seat').length + 1}`,
        zone: 'reading',
        features: ['wifi'],
        pricing: { hourly: 15, daily: 120, weekly: 650, monthly: 2000 },
      },
    };
    setElements([...elements, newSeat]);
  };

  const addArea = (areaType: keyof typeof areaTemplates) => {
    const template = areaTemplates[areaType];
    const newArea: Area = {
      id: `area-${Date.now()}`,
      type: 'area',
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      data: {
        name: template.name,
        areaType,
        color: template.color,
      },
    };
    setElements([...elements, newArea]);
  };

  const addAmenity = (amenityType: keyof typeof amenityTemplates) => {
    const template = amenityTemplates[amenityType];
    const newAmenity: Amenity = {
      id: `amenity-${Date.now()}`,
      type: 'amenity',
      x: 150,
      y: 150,
      width: 40,
      height: 40,
      data: {
        name: template.name,
        amenityType,
        icon: template.icon,
      },
    };
    setElements([...elements, newAmenity]);
  };

  const handleElementClick = useCallback((e: React.MouseEvent, element: LayoutElement) => {
    e.stopPropagation();
    setSelectedElement(element);
  }, []);

  const handleEditElement = () => {
    if (!selectedElement) return;
    setEditDialogOpen(true);
  };

  const handleDeleteElement = () => {
    if (!selectedElement) return;
    setElements(elements.filter(e => e.id !== selectedElement.id));
    setSelectedElement(null);
  };

  const updateElement = (updates: Partial<LayoutElement>) => {
    if (!selectedElement) return;
    setElements(elements.map(e => 
      e.id === selectedElement.id ? { ...e, ...updates } : e
    ));
    setSelectedElement({ ...selectedElement, ...updates });
  };

  const saveLayout = () => {
    const layoutData = {
      name: layoutName,
      elements,
      metadata: {
        totalSeats: elements.filter(e => e.type === 'seat').length,
        areas: elements.filter(e => e.type === 'area').length,
        amenities: elements.filter(e => e.type === 'amenity').length,
        createdAt: new Date().toISOString(),
      },
    };
    
    // Save to localStorage for demo
    localStorage.setItem('libraryLayout', JSON.stringify(layoutData));
    
    alert('Layout saved successfully!');
  };

  const loadLayout = () => {
    const saved = localStorage.getItem('libraryLayout');
    if (saved) {
      const layoutData = JSON.parse(saved);
      setElements(layoutData.elements);
      setLayoutName(layoutData.name);
      alert('Layout loaded successfully!');
    } else {
      alert('No saved layout found!');
    }
  };

  const generateSmartLayout = () => {
    const newElements: LayoutElement[] = [];
    
    // Add entrance area
    newElements.push({
      id: 'entrance-1',
      type: 'area',
      x: 300,
      y: 20,
      width: 300,
      height: 80,
      data: { name: 'Main Entrance', areaType: 'entrance', color: '#FFF9C4' },
    } as Area);

    // Add washrooms
    newElements.push({
      id: 'washroom-1',
      type: 'area',
      x: 20,
      y: 20,
      width: 120,
      height: 100,
      data: { name: 'Washroom', areaType: 'washroom', color: '#E3F2FD' },
    } as Area);

    // Add lunch area
    newElements.push({
      id: 'lunch-1',
      type: 'area',
      x: 700,
      y: 20,
      width: 180,
      height: 120,
      data: { name: 'Lunch Area', areaType: 'lunch', color: '#FFF3E0' },
    } as Area);

    // Add discussion area
    newElements.push({
      id: 'discussion-1',
      type: 'area',
      x: 700,
      y: 500,
      width: 180,
      height: 150,
      data: { name: 'Discussion Zone', areaType: 'discussion', color: '#F3E5F5' },
    } as Area);

    // Add seats in grid
    let seatCount = 1;
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        const x = 160 + col * 80;
        const y = 150 + row * 80;
        
        newElements.push({
          id: `seat-${seatCount}`,
          type: 'seat',
          x,
          y,
          width: 60,
          height: 60,
          data: {
            number: `S${seatCount}`,
            zone: row < 2 ? 'premium' : row < 4 ? 'silent' : 'reading',
            features: ['wifi', 'power'],
            pricing: { hourly: 20, daily: 150, weekly: 800, monthly: 2500 },
          },
        } as Seat);
        
        seatCount++;
      }
    }

    // Add amenities
    newElements.push({
      id: 'ac-1',
      type: 'amenity',
      x: 100,
      y: 150,
      width: 40,
      height: 40,
      data: { name: 'AC Unit', amenityType: 'ac', icon: '❄️' },
    } as Amenity);

    newElements.push({
      id: 'wifi-1',
      type: 'amenity',
      x: 450,
      y: 120,
      width: 40,
      height: 40,
      data: { name: 'WiFi Router', amenityType: 'wifi', icon: '📶' },
    } as Amenity);

    setElements(newElements);
  };

  const stats = useMemo(() => ({
    seats: elements.filter(e => e.type === 'seat').length,
    areas: elements.filter(e => e.type === 'area').length,
    amenities: elements.filter(e => e.type === 'amenity').length,
  }), [elements]);

  return (
    <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4">🎨 Library Layout Designer</Typography>
          <Typography variant="body2" color="text.secondary">
            Create your custom library layout with seats, areas, and amenities
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip label={`${stats.seats} Seats`} color="primary" />
          <Chip label={`${stats.areas} Areas`} color="success" />
          <Chip label={`${stats.amenities} Amenities`} color="warning" />
        </Stack>
      </Box>

      <Stack direction="row" spacing={2}>
        {/* Left Sidebar - Tools */}
        <Box sx={{ width: 280 }}>
          <Stack spacing={2}>
            {/* Layout Info */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📋 Layout Info
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="Layout Name"
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Stack spacing={1}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<GridOn />}
                    onClick={generateSmartLayout}
                  >
                    Generate Smart Layout
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Save />}
                    onClick={saveLayout}
                  >
                    Save Layout
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={loadLayout}
                  >
                    Load Layout
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Add Elements */}
            <Card>
              <CardContent>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
                  <Tab label="Select" />
                  <Tab label="Seats" />
                  <Tab label="Areas" />
                  <Tab label="Amenities" />
                </Tabs>

                {activeTab === 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="info">
                      Click on any element to select and edit it
                    </Alert>
                  </Box>
                )}

                {activeTab === 1 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Click on canvas to add seats
                    </Typography>
                    <Alert severity="success" sx={{ mt: 1 }}>
                      Seats will snap to grid automatically
                    </Alert>
                  </Box>
                )}

                {activeTab === 2 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Add Areas:
                    </Typography>
                    <Stack spacing={1}>
                      {Object.entries(areaTemplates).map(([key, value]) => (
                        <Button
                          key={key}
                          fullWidth
                          variant="outlined"
                          startIcon={value.icon}
                          onClick={() => addArea(key as keyof typeof areaTemplates)}
                          sx={{ justifyContent: 'flex-start' }}
                        >
                          {value.name}
                        </Button>
                      ))}
                    </Stack>
                  </Box>
                )}

                {activeTab === 3 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Add Amenities:
                    </Typography>
                    <Stack spacing={1}>
                      {Object.entries(amenityTemplates).map(([key, value]) => (
                        <Button
                          key={key}
                          fullWidth
                          variant="outlined"
                          onClick={() => addAmenity(key as keyof typeof amenityTemplates)}
                          sx={{ justifyContent: 'flex-start' }}
                        >
                          {value.icon} {value.name}
                        </Button>
                      ))}
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Selected Element Editor */}
            {selectedElement && (
              <Card sx={{ border: '2px solid', borderColor: 'primary.main' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ✏️ Selected Element
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Type: {selectedElement.type}
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={handleEditElement}
                    >
                      Edit Details
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={handleDeleteElement}
                    >
                      Delete
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* View Controls */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🔍 View Controls
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Zoom: {(zoom * 100).toFixed(0)}%
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                        <ZoomOut />
                      </IconButton>
                      <IconButton onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                        <ZoomIn />
                      </IconButton>
                    </Stack>
                  </Box>
                  <FormControlLabel
                    control={<Switch checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />}
                    label="Show Grid"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {/* Main Canvas */}
        <Box sx={{ flex: 1 }}>
          <Paper 
            ref={canvasRef}
            onClick={handleCanvasClick}
            sx={{ 
              width: '100%',
              height: 700,
              overflow: 'auto',
              bgcolor: '#fff',
              position: 'relative',
              cursor: activeTab === 1 ? 'crosshair' : 'default',
            }}
          >
            <Box
              sx={{
                width: 1000 * zoom,
                height: 700 * zoom,
                position: 'relative',
                backgroundImage: showGrid ? `
                  repeating-linear-gradient(0deg, #e0e0e0, #e0e0e0 1px, transparent 1px, transparent ${gridSize * zoom}px),
                  repeating-linear-gradient(90deg, #e0e0e0, #e0e0e0 1px, transparent 1px, transparent ${gridSize * zoom}px)
                ` : 'none',
              }}
            >
              {elements.map((element) => (
                <Box
                  key={element.id}
                  onClick={(e) => handleElementClick(e, element)}
                  sx={{
                    position: 'absolute',
                    left: element.x * zoom,
                    top: element.y * zoom,
                    width: element.width * zoom,
                    height: element.height * zoom,
                    border: selectedElement?.id === element.id ? '3px solid #1976D2' : '1px solid #666',
                    borderRadius: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    bgcolor: element.type === 'area' ? (element as Area).data.color : 
                            element.type === 'seat' ? '#4CAF50' : '#FFD700',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  {element.type === 'seat' && (
                    <>
                      <EventSeat sx={{ fontSize: 20 * zoom, color: 'white' }} />
                      <Typography variant="caption" sx={{ color: 'white', fontSize: 10 * zoom, fontWeight: 'bold' }}>
                        {(element as Seat).data.number}
                      </Typography>
                    </>
                  )}
                  {element.type === 'area' && (
                    <>
                      {areaTemplates[(element as Area).data.areaType]?.icon}
                      <Typography variant="caption" sx={{ fontSize: 11 * zoom, fontWeight: 'bold', mt: 0.5 }}>
                        {(element as Area).data.name}
                      </Typography>
                    </>
                  )}
                  {element.type === 'amenity' && (
                    <Typography sx={{ fontSize: 24 * zoom }}>
                      {(element as Amenity).data.icon}
                    </Typography>
                  )}
                </Box>
              ))}

              {elements.length === 0 && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}>
                  <Typography variant="h6" color="text.secondary">
                    Your canvas is empty
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use the left panel to add seats, areas, and amenities
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<GridOn />}
                    onClick={generateSmartLayout}
                    sx={{ mt: 2 }}
                  >
                    Generate Smart Layout
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      </Stack>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit {selectedElement?.type === 'seat' ? 'Seat' : selectedElement?.type === 'area' ? 'Area' : 'Amenity'}
        </DialogTitle>
        <DialogContent>
          {selectedElement?.type === 'seat' && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Seat Number"
                value={(selectedElement as Seat).data.number}
                onChange={(e) => updateElement({
                  data: { ...(selectedElement as Seat).data, number: e.target.value }
                })}
              />
              <FormControl fullWidth>
                <InputLabel>Zone</InputLabel>
                <Select
                  value={(selectedElement as Seat).data.zone}
                  onChange={(e) => updateElement({
                    data: { ...(selectedElement as Seat).data, zone: e.target.value }
                  })}
                >
                  <MenuItem value="silent">🤫 Silent Study</MenuItem>
                  <MenuItem value="reading">📖 Reading</MenuItem>
                  <MenuItem value="discussion">💬 Discussion</MenuItem>
                  <MenuItem value="exam-prep">📝 Exam Prep</MenuItem>
                  <MenuItem value="premium">⭐ Premium</MenuItem>
                </Select>
              </FormControl>
              <Divider>Pricing</Divider>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Hourly (₹)"
                  type="number"
                  value={(selectedElement as Seat).data.pricing.hourly}
                  onChange={(e) => updateElement({
                    data: {
                      ...(selectedElement as Seat).data,
                      pricing: { ...(selectedElement as Seat).data.pricing, hourly: Number(e.target.value) }
                    }
                  })}
                />
                <TextField
                  label="Monthly (₹)"
                  type="number"
                  value={(selectedElement as Seat).data.pricing.monthly}
                  onChange={(e) => updateElement({
                    data: {
                      ...(selectedElement as Seat).data,
                      pricing: { ...(selectedElement as Seat).data.pricing, monthly: Number(e.target.value) }
                    }
                  })}
                />
              </Stack>
            </Stack>
          )}

          {selectedElement?.type === 'area' && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Area Name"
                value={(selectedElement as Area).data.name}
                onChange={(e) => updateElement({
                  data: { ...(selectedElement as Area).data, name: e.target.value }
                })}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Width"
                  type="number"
                  value={selectedElement.width}
                  onChange={(e) => updateElement({ width: Number(e.target.value) })}
                />
                <TextField
                  label="Height"
                  type="number"
                  value={selectedElement.height}
                  onChange={(e) => updateElement({ height: Number(e.target.value) })}
                />
              </Stack>
            </Stack>
          )}

          {selectedElement?.type === 'amenity' && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Amenity Name"
                value={(selectedElement as Amenity).data.name}
                onChange={(e) => updateElement({
                  data: { ...(selectedElement as Amenity).data, name: e.target.value }
                })}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setEditDialogOpen(false)} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LayoutDesigner;

