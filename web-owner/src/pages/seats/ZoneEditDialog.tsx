import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Box,
} from '@mui/material';

interface ZoneEditDialogProps {
  open: boolean;
  zone: any;
  zoneConfig: any;
  onClose: () => void;
  onSave: (zoneId: string, label: string, type: string) => void;
}

const ZoneEditDialog: React.FC<ZoneEditDialogProps> = ({
  open,
  zone,
  zoneConfig,
  onClose,
  onSave,
}) => {
  const [label, setLabel] = useState(zone?.label || '');
  const [type, setType] = useState(zone?.type || 'premium');

  React.useEffect(() => {
    if (zone) {
      setLabel(zone.label);
      setType(zone.type);
    }
  }, [zone]);

  const handleSave = () => {
    if (zone) {
      onSave(zone.id, label, type);
      onClose();
    }
  };

  if (!zone) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Zone</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Zone Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            fullWidth
            helperText="Give this zone a custom name"
          />

          <FormControl fullWidth>
            <InputLabel>Zone Type</InputLabel>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              label="Zone Type"
            >
              {Object.entries(zoneConfig).map(([key, value]: [string, any]) => (
                <MenuItem key={key} value={key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: 1,
                        bgcolor: value.color,
                      }}
                    />
                    <Typography>{value.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Zone Size: {Math.round(zone.width)}×{Math.round(zone.height)}px
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Position: ({Math.round(zone.x)}, {Math.round(zone.y)})
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ZoneEditDialog;















