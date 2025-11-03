/**
 * Review & Submit Step Component
 * Final step of tenant onboarding wizard
 */

import React from 'react';
import { Box, Typography, Card, CardContent, Divider, Alert } from '@mui/material';
import Grid from '@mui/material/Grid';

const ReviewSubmitStep: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review & Submit
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Please review your information before submitting
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Business Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Business Name:
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="body2">Example Library</Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Address:
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="body2">123 Study St, City, State</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Contact Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Name:
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="body2">John Doe</Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email:
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="body2">john@example.com</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Selected Plan
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" color="primary">
                Professional Plan
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ₹2,999/month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12}>
          <Alert severity="info">
            By submitting, you agree to our Terms of Service and Privacy Policy.
            Your account will be activated immediately after payment confirmation.
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReviewSubmitStep;


