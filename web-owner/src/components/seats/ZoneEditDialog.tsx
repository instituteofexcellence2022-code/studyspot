import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
} from '@mui/material';

interface Zone {
  id: string;
  name: string;
  type: string;
  color: string;
  capacity: number;
  amenities: string[];
}

interface ZoneEditDialogProps {
  open: boolean;
  zone: Zone | null;
  onClose: () => void;
  onSave: (zone: Zone) => void;
}

const ZoneEditDialog: React.FC<ZoneEditDialogProps> = ({
  open,
  zone,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Zone>({
    id: '',
    name: '',
    type: 'study',
    color: '#2196F3',
    capacity: 1,
    amenities: [],
  });

  useEffect(() => {
    if (zone) {
      setFormData(zone);
    }
  }, [zone]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleChange = (field: keyof Zone, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const availableAmenities = [
    { id: 'ac', label: 'Air Conditioning', icon: '❄️' },
    { id: 'wifi', label: 'High-Speed WiFi', icon: '📶' },
    { id: 'power', label: 'Power Outlets', icon: '🔌' },
    { id: 'locker', label: 'Personal Lockers', icon: '🔐' },
    { id: 'water', label: 'Water Cooler', icon: '💧' },
    { id: 'printer', label: 'Printer/Scanner', icon: '🖨️' },
  ];

  const toggleAmenity = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Zone</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Zone Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Zone Type</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <MenuItem value="study">Study Area</MenuItem>
              <MenuItem value="quiet">Quiet Zone</MenuItem>
              <MenuItem value="group">Group Study</MenuItem>
              <MenuItem value="computer">Computer Lab</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 1)}
            margin="normal"
            inputProps={{ min: 1, max: 100 }}
          />

          <TextField
            fullWidth
            label="Color"
            type="color"
            value={formData.color}
            onChange={(e) => handleChange('color', e.target.value)}
            margin="normal"
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Amenities
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              {availableAmenities.map((amenity) => (
                <Chip
                  key={amenity.id}
                  label={amenity.label}
                  size="small"
                  icon={<Typography fontSize="0.75rem">{amenity.icon}</Typography>}
                  color={formData.amenities.includes(amenity.id) ? "primary" : "default"}
                  variant={formData.amenities.includes(amenity.id) ? "filled" : "outlined"}
                  onClick={() => toggleAmenity(amenity.id)}
                />
              ))}
            </Stack>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Zone
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ZoneEditDialog;
