import React from 'react';

import TenantManagement from '../../components/admin/TenantManagement';
import { Box, Button, Card, CardContent, Typography, Avatar, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Divider, List, ListItem, ListItemIcon, ListItemText, LinearProgress, IconButton, CssBaseline, ThemeProvider, createTheme } from '@mui/material';


const AdminTenantsPage: React.FC = () => {
  return <TenantManagement />;
};

export default AdminTenantsPage;
