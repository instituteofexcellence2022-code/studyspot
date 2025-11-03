/**
 * Branding Step Component
 * Fifth step of tenant onboarding wizard
 */

import React from 'react';
import {
  Box,
  Typography,
  Button,
  GridLegacy as Grid,
  TextField,
  Card,
  CardContent,
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

const BrandingStep: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Customize Your Branding
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Make it yours with your logo and brand colors
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Logo Upload
              </Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 4,
                  textAlign: 'center',
                  mt: 2,
                }}
              >
                <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary" paragraph>
                  Drag and drop your logo here, or click to browse
                </Typography>
                <Button variant="outlined" component="label">
                  Choose File
                  <input type="file" hidden accept="image/*" />
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Recommended: PNG or SVG, max 2MB
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Primary Brand Color"
            type="color"
            defaultValue="#1976d2"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Secondary Brand Color"
            type="color"
            defaultValue="#dc004e"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Tagline (Optional)"
            placeholder="Your study space tagline"
            multiline
            rows={2}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BrandingStep;
