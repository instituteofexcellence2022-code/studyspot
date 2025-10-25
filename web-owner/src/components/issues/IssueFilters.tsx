import React, { useState } from 'react';
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
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Slider,
  Autocomplete,
  Divider,
  Tabs,
  Tab,
  Switch,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Save as SaveIcon,
  Bookmark as BookmarkIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
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
    date_range?: {
      start: string;
      end: string;
    };
    satisfaction_rating?: {
      min: number;
      max: number;
    };
    tags?: string[];
    has_attachments?: boolean;
    is_overdue?: boolean;
    reported_by?: string;
    resolved_by?: string;
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
  const [activeTab, setActiveTab] = useState(0);
  const [savedFilters, setSavedFilters] = useState<any[]>([
    { id: 1, name: 'My High Priority Issues', filters: { priority: 'high', assigned_to: 'me' } },
    { id: 2, name: 'Overdue Issues', filters: { is_overdue: true } },
    { id: 3, name: 'Recent Issues', filters: { date_range: { start: '2024-01-01', end: '2024-12-31' } } },
  ]);

  const handleFilterChange = (key: string, value: any) => {
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
      date_range: undefined,
      satisfaction_rating: undefined,
      tags: [],
      has_attachments: undefined,
      is_overdue: undefined,
      reported_by: '',
      resolved_by: '',
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'date_range' && value && typeof value === 'object' && 'start' in value && 'end' in value && value.start && value.end) count++;
      else if (key === 'satisfaction_rating' && value && typeof value === 'object' && 'min' in value && 'max' in value && (value.min > 0 || value.max < 5)) count++;
      else if (key === 'tags' && Array.isArray(value) && value.length > 0) count++;
      else if (typeof value === 'string' && value !== '') count++;
      else if (typeof value === 'boolean' && value !== undefined) count++;
    });
    return count;
  };

  const handleSaveFilter = () => {
    const filterName = prompt('Enter a name for this filter:');
    if (filterName) {
      const newFilter = {
        id: Date.now(),
        name: filterName,
        filters: { ...filters }
      };
      setSavedFilters([...savedFilters, newFilter]);
    }
  };

  const handleLoadFilter = (savedFilter: any) => {
    onFiltersChange(savedFilter.filters);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            Advanced Filters
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleSaveFilter} size="small" title="Save Filter">
              <SaveIcon />
            </IconButton>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Basic Filters" icon={<FilterIcon />} />
            <Tab label="Advanced Filters" icon={<SearchIcon />} />
            <Tab label="Saved Filters" icon={<BookmarkIcon />} />
          </Tabs>
        </Box>

        {/* Basic Filters Tab */}
        {activeTab === 0 && (
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {statuses.map((status) => (
                    <MenuItem key={status.id} value={status.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: status.color,
                          }}
                        />
                        {status.display_name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  {priorities.map((priority) => (
                    <MenuItem key={priority.id} value={priority.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: priority.color,
                          }}
                        />
                        {priority.display_name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: category.color,
                          }}
                        />
                        {category.display_name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Assigned To</InputLabel>
                <Select
                  value={filters.assigned_to}
                  onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
                  label="Assigned To"
                >
                  <MenuItem value="">All Assignees</MenuItem>
                  <MenuItem value="unassigned">Unassigned</MenuItem>
                  <MenuItem value="me">Assigned to Me</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        )}

        {/* Advanced Filters Tab */}
        {activeTab === 1 && (
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Date Range Filter */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayIcon />
                  Date Range
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={filters.date_range?.start || ''}
                    onChange={(e) => handleFilterChange('date_range', {
                      ...filters.date_range,
                      start: e.target.value
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={filters.date_range?.end || ''}
                    onChange={(e) => handleFilterChange('date_range', {
                      ...filters.date_range,
                      end: e.target.value
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Satisfaction Rating Filter */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon />
                  Satisfaction Rating
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ px: 2 }}>
                  <Typography gutterBottom>
                    Rating Range: {filters.satisfaction_rating?.min || 0} - {filters.satisfaction_rating?.max || 5}
                  </Typography>
                  <Slider
                    value={[filters.satisfaction_rating?.min || 0, filters.satisfaction_rating?.max || 5]}
                    onChange={(e, newValue) => {
                      const [min, max] = newValue as number[];
                      handleFilterChange('satisfaction_rating', { min, max });
                    }}
                    valueLabelDisplay="auto"
                    min={0}
                    max={5}
                    step={0.5}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 1, label: '1' },
                      { value: 2, label: '2' },
                      { value: 3, label: '3' },
                      { value: 4, label: '4' },
                      { value: 5, label: '5' },
                    ]}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Additional Filters */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FlagIcon />
                  Additional Filters
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.has_attachments || false}
                        onChange={(e) => handleFilterChange('has_attachments', e.target.checked)}
                      />
                    }
                    label="Has Attachments"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.is_overdue || false}
                        onChange={(e) => handleFilterChange('is_overdue', e.target.checked)}
                      />
                    }
                    label="Overdue Issues"
                  />
                  <TextField
                    fullWidth
                    label="Reported By"
                    value={filters.reported_by || ''}
                    onChange={(e) => handleFilterChange('reported_by', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Resolved By"
                    value={filters.resolved_by || ''}
                    onChange={(e) => handleFilterChange('resolved_by', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        )}

        {/* Saved Filters Tab */}
        {activeTab === 2 && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="h6" gutterBottom>
              Saved Filter Presets
            </Typography>
            {savedFilters.map((savedFilter) => (
              <Paper key={savedFilter.id} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle1">{savedFilter.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Object.keys(savedFilter.filters).length} filters applied
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleLoadFilter(savedFilter)}
                  >
                    Apply
                  </Button>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClearFilters} startIcon={<ClearIcon />}>
          Clear All
        </Button>
        <Button onClick={onClose} variant="contained">
          Apply Filters ({getActiveFiltersCount()})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IssueFilters;