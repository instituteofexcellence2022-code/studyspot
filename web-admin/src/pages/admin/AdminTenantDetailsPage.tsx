import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

import TenantDetails from '../../components/admin/TenantDetails';
import { Box, Button, Card, CardContent, Typography, Avatar, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Divider, List, ListItem, ListItemIcon, ListItemText, LinearProgress, IconButton, CssBaseline, ThemeProvider, createTheme } from '@mui/material';


const AdminTenantDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to="/admin/tenants" replace />;
  }

  return <TenantDetails tenantId={id} />;
};

export default AdminTenantDetailsPage;
