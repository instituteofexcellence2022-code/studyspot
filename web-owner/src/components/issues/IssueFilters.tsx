import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { IssueCategory, IssuePriority, IssueStatus } from '../../services/issueService';

interface IssueFiltersProps {
  open: boolean;
  onClose: () => void;
  filters: {
    status: string;
    priority: string;
    category: string;
    assigned_to: string;
    library_id: string;
  };
  onFiltersChange: (filters: any) => void;
  categories: IssueCategory[];
  priorities: IssuePriority[];
  statuses: IssueStatus[];
}

const IssueFilters: React.FC<IssueFiltersProps> = ({
  open,
  onClose,
  filters,
  onFiltersChange,
  categories,
  priorities,
  statuses,
}) => {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      status: '',
      priority: '',
      category: '',
      assigned_to: '',
      library_id: '',
    });
  };

  const handleClose = () => {
    onClose();
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Filter Issues
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getActiveFiltersCount() > 0 && (
              <Chip
                label={`${getActiveFiltersCount()} active`}
                size="small"
                color="primary"
              />
            )}
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Status Filter */}
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label="Status"
            >
              <MenuItem value="">
                <em>All Statuses</em>
              </MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status.id} value={status.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: status.color,
                      }}
                    />
                    <Typography>{status.display_name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Priority Filter */}
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              label="Priority"
            >
              <MenuItem value="">
                <em>All Priorities</em>
              </MenuItem>
              {priorities.map((priority) => (
                <MenuItem key={priority.id} value={priority.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: priority.color,
                      }}
                    />
                    <Typography>{priority.display_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({priority.sla_hours}h SLA)
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Category Filter */}
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              label="Category"
            >
              <MenuItem value="">
                <em>All Categories</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{category.icon}</Typography>
                    <Typography>{category.display_name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Assigned To Filter */}
          <FormControl fullWidth>
            <InputLabel>Assigned To</InputLabel>
            <Select
              value={filters.assigned_to}
              onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
              label="Assigned To"
            >
              <MenuItem value="">
                <em>All Assignments</em>
              </MenuItem>
              <MenuItem value="unassigned">
                <Typography>Unassigned</Typography>
              </MenuItem>
              <MenuItem value="assigned">
                <Typography>Assigned</Typography>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Library Filter */}
          <FormControl fullWidth>
            <InputLabel>Library</InputLabel>
            <Select
              value={filters.library_id}
              onChange={(e) => handleFilterChange('library_id', e.target.value)}
              label="Library"
            >
              <MenuItem value="">
                <em>All Libraries</em>
              </MenuItem>
              {/* This would be populated with actual library data */}
              <MenuItem value="library1">
                <Typography>Main Library</Typography>
              </MenuItem>
              <MenuItem value="library2">
                <Typography>Branch Library</Typography>
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClearFilters}
          startIcon={<ClearIcon />}
          disabled={getActiveFiltersCount() === 0}
        >
          Clear All
        </Button>
        <Button onClick={handleClose} variant="contained">
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IssueFilters;


