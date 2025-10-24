import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
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
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Snackbar,
  InputAdornment,
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
  Coffee,
  MeetingRoom,
  Stairs,
  ExitToApp,
  LocalParking,
  AcUnit,
  Wifi,
  ZoomIn,
  ZoomOut,
  GridOn,
  Undo,
  Redo,
  Download,
  Upload,
  Search,
  Clear,
  ContentCopy,
  ContentPaste,
  KeyboardArrowUp,
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

interface HistoryEntry {
  elements: LayoutElement[];
  action: string;
}

const EnhancedLayoutDesigner: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<LayoutElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<LayoutElement | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [gridSize] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [layoutName, setLayoutName] = useState('My Library Layout');
  
  // New enhancement states
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [draggedElement, setDraggedElement] = useState<LayoutElement | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [copiedElement, setCopiedElement] = useState<LayoutElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [quickFilter, setQuickFilter] = useState<'all' | 'seats' | 'areas' | 'amenities'>('all');

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

  // Add to history
  const addToHistory = useCallback((newElements: LayoutElement[], action: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ elements: newElements, action });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1].elements);
      showSnackbar('Undo: ' + history[historyIndex].action, 'info');
    }
  }, [historyIndex, history]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1].elements);
      showSnackbar('Redo: ' + history[historyIndex + 1].action, 'info');
    }
  }, [historyIndex, history]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z - Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Shift+Z or Ctrl+Y - Redo
      if ((e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }
      // Ctrl+C - Copy
      if (e.ctrlKey && e.key === 'c' && selectedElement) {
        e.preventDefault();
        handleCopy();
      }
      // Ctrl+V - Paste
      if (e.ctrlKey && e.key === 'v' && copiedElement) {
        e.preventDefault();
        handlePaste();
      }
      // Delete - Remove element
      if (e.key === 'Delete' && selectedElement) {
        e.preventDefault();
        handleDeleteElement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, copiedElement, handleUndo, handleRedo]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || activeTab === 0) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom / gridSize) * gridSize;
    const y = Math.round((e.clientY - rect.top) / zoom / gridSize) * gridSize;

    if (activeTab === 1) {
      addSeat(x, y);
    }
  }, [activeTab, zoom, gridSize]);

  const addSeat = (x: number, y: number) => {
    const newSeat: LayoutElement = {
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
    const newElements = [...elements, newSeat];
    setElements(newElements);
    addToHistory(newElements, 'Add seat');
    showSnackbar('Seat added', 'success');
  };

  const addArea = (areaType: keyof typeof areaTemplates) => {
    const template = areaTemplates[areaType];
    const newArea: LayoutElement = {
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
    const newElements = [...elements, newArea];
    setElements(newElements);
    addToHistory(newElements, `Add ${template.name}`);
    showSnackbar(`${template.name} added`, 'success');
  };

  const addAmenity = (amenityType: keyof typeof amenityTemplates) => {
    const template = amenityTemplates[amenityType];
    const newAmenity: LayoutElement = {
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
    const newElements = [...elements, newAmenity];
    setElements(newElements);
    addToHistory(newElements, `Add ${template.name}`);
    showSnackbar(`${template.name} added`, 'success');
  };

  // Drag and drop
  const handleMouseDown = useCallback((e: React.MouseEvent, element: LayoutElement) => {
    e.stopPropagation();
    if (activeTab !== 0) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDraggedElement(element);
    setDragOffset({
      x: (e.clientX - rect.left) / zoom - element.x,
      y: (e.clientY - rect.top) / zoom - element.y,
    });
    setSelectedElement(element);
  }, [activeTab, zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedElement || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.round(((e.clientX - rect.left) / zoom - dragOffset.x) / gridSize) * gridSize;
    const newY = Math.round(((e.clientY - rect.top) / zoom - dragOffset.y) / gridSize) * gridSize;

    setElements(prev => prev.map(el =>
      el.id === draggedElement.id ? { ...el, x: newX, y: newY } : el
    ));
  }, [draggedElement, zoom, dragOffset, gridSize]);

  const handleMouseUp = useCallback(() => {
    if (draggedElement) {
      addToHistory(elements, `Move ${draggedElement.type}`);
      showSnackbar('Element moved', 'success');
      setDraggedElement(null);
    }
  }, [draggedElement, elements]);

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
    const newElements = elements.filter(e => e.id !== selectedElement.id);
    setElements(newElements);
    addToHistory(newElements, `Delete ${selectedElement.type}`);
    showSnackbar('Element deleted', 'success');
    setSelectedElement(null);
  };

  const handleCopy = () => {
    if (!selectedElement) return;
    setCopiedElement(selectedElement);
    showSnackbar('Element copied (Ctrl+V to paste)', 'info');
  };

  const handlePaste = () => {
    if (!copiedElement) return;
    const newElement = {
      ...copiedElement,
      id: `${copiedElement.type}-${Date.now()}`,
      x: copiedElement.x + 40,
      y: copiedElement.y + 40,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements, 'Paste element');
    showSnackbar('Element pasted', 'success');
  };

  const updateElement = (updates: Partial<LayoutElement>) => {
    if (!selectedElement) return;
    const newElements = elements.map(e =>
      e.id === selectedElement.id ? { ...e, ...updates } : e
    );
    setElements(newElements);
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

    localStorage.setItem('libraryLayout', JSON.stringify(layoutData));
    showSnackbar('Layout saved successfully!', 'success');
  };

  const loadLayout = () => {
    const saved = localStorage.getItem('libraryLayout');
    if (saved) {
      const layoutData = JSON.parse(saved);
      setElements(layoutData.elements);
      setLayoutName(layoutData.name);
      addToHistory(layoutData.elements, 'Load layout');
      showSnackbar('Layout loaded successfully!', 'success');
    } else {
      showSnackbar('No saved layout found!', 'error');
    }
  };

  const exportLayout = () => {
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

    const dataStr = JSON.stringify(layoutData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${layoutName.replace(/\s+/g, '_')}_layout.json`;
    link.click();
    URL.revokeObjectURL(url);
    showSnackbar('Layout exported!', 'success');
  };

  const importLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const layoutData = JSON.parse(e.target?.result as string);
        setElements(layoutData.elements);
        setLayoutName(layoutData.name);
        addToHistory(layoutData.elements, 'Import layout');
        showSnackbar('Layout imported successfully!', 'success');
      } catch (error) {
        showSnackbar('Error importing layout!', 'error');
      }
    };
    reader.readAsText(file);
  };

  const clearCanvas = () => {
    if (window.confirm('Clear entire canvas? This cannot be undone.')) {
      setElements([]);
      addToHistory([], 'Clear canvas');
      showSnackbar('Canvas cleared', 'info');
    }
  };

  const generateSmartLayout = () => {
    const newElements: LayoutElement[] = [];

    newElements.push({
      id: 'entrance-1',
      type: 'area',
      x: 300,
      y: 20,
      width: 300,
      height: 80,
      data: { name: 'Main Entrance', areaType: 'entrance', color: '#FFF9C4' },
    });

    newElements.push({
      id: 'washroom-1',
      type: 'area',
      x: 20,
      y: 20,
      width: 120,
      height: 100,
      data: { name: 'Washroom', areaType: 'washroom', color: '#E3F2FD' },
    });

    newElements.push({
      id: 'lunch-1',
      type: 'area',
      x: 700,
      y: 20,
      width: 180,
      height: 120,
      data: { name: 'Lunch Area', areaType: 'lunch', color: '#FFF3E0' },
    });

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
        });

        seatCount++;
      }
    }

    setElements(newElements);
    addToHistory(newElements, 'Generate smart layout');
    showSnackbar('Smart layout generated!', 'success');
  };

  const filteredElements = useMemo(() => {
    let filtered = elements;

    // Quick filter
    if (quickFilter !== 'all') {
      filtered = filtered.filter(e => {
        if (quickFilter === 'seats') return e.type === 'seat';
        if (quickFilter === 'areas') return e.type === 'area';
        if (quickFilter === 'amenities') return e.type === 'amenity';
        return true;
      });
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(e => {
        const searchLower = searchQuery.toLowerCase();
        if (e.type === 'seat') {
          return e.data.number.toLowerCase().includes(searchLower);
        }
        if (e.type === 'area' || e.type === 'amenity') {
          return e.data.name.toLowerCase().includes(searchLower);
        }
        return false;
      });
    }

    return filtered;
  }, [elements, quickFilter, searchQuery]);

  const stats = useMemo(() => ({
    seats: elements.filter(e => e.type === 'seat').length,
    areas: elements.filter(e => e.type === 'area').length,
    amenities: elements.filter(e => e.type === 'amenity').length,
  }), [elements]);

  const speedDialActions = [
    { icon: <Undo />, name: 'Undo (Ctrl+Z)', onClick: handleUndo, disabled: historyIndex <= 0 },
    { icon: <Redo />, name: 'Redo (Ctrl+Y)', onClick: handleRedo, disabled: historyIndex >= history.length - 1 },
    { icon: <Download />, name: 'Export', onClick: exportLayout },
    { icon: <Save />, name: 'Save', onClick: saveLayout },
    { icon: <Clear />, name: 'Clear All', onClick: clearCanvas },
  ];

  return (
    <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4">🎨 Enhanced Layout Designer</Typography>
          <Typography variant="body2" color="text.secondary">
            Drag-drop, undo/redo, shortcuts, export/import - Full-featured designer
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip label={`${stats.seats} Seats`} color="primary" />
          <Chip label={`${stats.areas} Areas`} color="success" />
          <Chip label={`${stats.amenities} Amenities`} color="warning" />
          <Chip 
            label={historyIndex >= 0 ? `History: ${historyIndex + 1}/${history.length}` : 'No history'} 
            size="small" 
          />
        </Stack>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <Tabs value={quickFilter} onChange={(e, v) => setQuickFilter(v)} variant="standard">
            <Tab label="All" value="all" />
            <Tab label="Seats" value="seats" />
            <Tab label="Areas" value="areas" />
            <Tab label="Amenities" value="amenities" />
          </Tabs>
        </Stack>
      </Paper>

      <Stack direction="row" spacing={2}>
        {/* Left Sidebar */}
        <Box sx={{ width: 280 }}>
          <Stack spacing={2}>
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
                    Generate Layout
                  </Button>
                  <Stack direction="row" spacing={1}>
                    <Button
                      fullWidth
                      variant="outlined"
                      component="label"
                      startIcon={<Upload />}
                      size="small"
                    >
                      Import
                      <input type="file" hidden accept=".json" onChange={importLayout} />
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={exportLayout}
                      size="small"
                    >
                      Export
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
                  <Tab label="Drag" />
                  <Tab label="Add" />
                </Tabs>

                {activeTab === 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <strong>Drag Mode:</strong> Click and drag elements to move them
                    </Alert>
                    <Typography variant="caption" display="block" gutterBottom>
                      <strong>Shortcuts:</strong>
                    </Typography>
                    <Typography variant="caption" display="block">• Ctrl+Z: Undo</Typography>
                    <Typography variant="caption" display="block">• Ctrl+Y: Redo</Typography>
                    <Typography variant="caption" display="block">• Ctrl+C: Copy</Typography>
                    <Typography variant="caption" display="block">• Ctrl+V: Paste</Typography>
                    <Typography variant="caption" display="block">• Delete: Remove</Typography>
                  </Box>
                )}

                {activeTab === 1 && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        const rect = canvasRef.current?.getBoundingClientRect();
                        if (rect) addSeat(200, 200);
                      }}
                      sx={{ mb: 1 }}
                    >
                      + Add Seat
                    </Button>
                    <Divider sx={{ my: 1 }}>Areas</Divider>
                    <Stack spacing={0.5}>
                      {Object.entries(areaTemplates).slice(0, 4).map(([key, value]) => (
                        <Button
                          key={key}
                          size="small"
                          variant="text"
                          startIcon={value.icon}
                          onClick={() => addArea(key as keyof typeof areaTemplates)}
                          sx={{ justifyContent: 'flex-start' }}
                        >
                          {value.name}
                        </Button>
                      ))}
                    </Stack>
                    <Divider sx={{ my: 1 }}>Amenities</Divider>
                    <Stack spacing={0.5}>
                      {Object.entries(amenityTemplates).slice(0, 3).map(([key, value]) => (
                        <Button
                          key={key}
                          size="small"
                          variant="text"
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

            {selectedElement && (
              <Card sx={{ border: '2px solid', borderColor: 'primary.main' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ✏️ Selected
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {selectedElement.type}: {selectedElement.data.number || selectedElement.data.name}
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={handleEditElement}
                        size="small"
                      >
                        Edit
                      </Button>
                      <IconButton color="primary" onClick={handleCopy}>
                        <ContentCopy />
                      </IconButton>
                    </Stack>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={handleDeleteElement}
                      size="small"
                    >
                      Delete
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🔍 View
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Zoom: {(zoom * 100).toFixed(0)}%
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                        <ZoomOut />
                      </IconButton>
                      <IconButton size="small" onClick={() => setZoom(1)}>
                        Reset
                      </IconButton>
                      <IconButton size="small" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
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
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            sx={{
              width: '100%',
              height: 700,
              overflow: 'auto',
              bgcolor: '#fff',
              position: 'relative',
              cursor: activeTab === 0 ? 'grab' : activeTab === 1 ? 'crosshair' : 'default',
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
              {filteredElements.map((element) => (
                <Tooltip
                  key={element.id}
                  title={`${element.type}: ${element.data.number || element.data.name} (${element.x}, ${element.y})`}
                >
                  <Box
                    onMouseDown={(e) => handleMouseDown(e, element)}
                    onClick={(e) => handleElementClick(e, element)}
                    sx={{
                      position: 'absolute',
                      left: element.x * zoom,
                      top: element.y * zoom,
                      width: element.width * zoom,
                      height: element.height * zoom,
                      border: selectedElement?.id === element.id ? '3px solid #1976D2' : '2px solid #666',
                      borderRadius: 1,
                      cursor: activeTab === 0 ? 'grab' : 'pointer',
                      transition: draggedElement?.id === element.id ? 'none' : 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      bgcolor: element.type === 'area' ? (element as any).data.color :
                              element.type === 'seat' ? '#4CAF50' : '#FFD700',
                      '&:hover': {
                        boxShadow: 4,
                        zIndex: 10,
                      },
                      '&:active': {
                        cursor: activeTab === 0 ? 'grabbing' : 'pointer',
                      },
                    }}
                  >
                    {element.type === 'seat' && (
                      <>
                        <EventSeat sx={{ fontSize: 20 * zoom, color: 'white' }} />
                        <Typography variant="caption" sx={{ color: 'white', fontSize: 10 * zoom, fontWeight: 'bold' }}>
                          {element.data.number}
                        </Typography>
                      </>
                    )}
                    {element.type === 'area' && (
                      <>
                        {areaTemplates[(element.data as any).areaType as keyof typeof areaTemplates]?.icon}
                        <Typography variant="caption" sx={{ fontSize: 11 * zoom, fontWeight: 'bold', mt: 0.5 }}>
                          {element.data.name}
                        </Typography>
                      </>
                    )}
                    {element.type === 'amenity' && (
                      <Typography sx={{ fontSize: 24 * zoom }}>
                        {element.data.icon}
                      </Typography>
                    )}
                  </Box>
                </Tooltip>
              ))}

              {filteredElements.length === 0 && (
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}>
                  <Typography variant="h6" color="text.secondary">
                    {searchQuery ? 'No elements match your search' : 'Canvas is empty'}
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

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Quick actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
            FabProps={{ disabled: action.disabled }}
          />
        ))}
      </SpeedDial>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit {selectedElement?.type}
        </DialogTitle>
        <DialogContent>
          {selectedElement?.type === 'seat' && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Seat Number"
                value={selectedElement.data.number}
                onChange={(e) => updateElement({
                  data: { ...selectedElement.data, number: e.target.value }
                })}
              />
              <FormControl fullWidth>
                <InputLabel>Zone</InputLabel>
                <Select
                  value={selectedElement.data.zone}
                  onChange={(e) => updateElement({
                    data: { ...selectedElement.data, zone: e.target.value }
                  })}
                >
                  <MenuItem value="silent">🤫 Silent Study</MenuItem>
                  <MenuItem value="reading">📖 Reading</MenuItem>
                  <MenuItem value="discussion">💬 Discussion</MenuItem>
                  <MenuItem value="exam-prep">📝 Exam Prep</MenuItem>
                  <MenuItem value="premium">⭐ Premium</MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Hourly (₹)"
                  type="number"
                  value={selectedElement.data.pricing.hourly}
                  onChange={(e) => updateElement({
                    data: {
                      ...selectedElement.data,
                      pricing: { ...selectedElement.data.pricing, hourly: Number(e.target.value) }
                    }
                  })}
                />
                <TextField
                  label="Monthly (₹)"
                  type="number"
                  value={selectedElement.data.pricing.monthly}
                  onChange={(e) => updateElement({
                    data: {
                      ...selectedElement.data,
                      pricing: { ...selectedElement.data.pricing, monthly: Number(e.target.value) }
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
                value={selectedElement.data.name}
                onChange={(e) => updateElement({
                  data: { ...selectedElement.data, name: e.target.value }
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setEditDialogOpen(false)} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default EnhancedLayoutDesigner;

