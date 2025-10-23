import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

interface LibraryFiltersProps {
  filters: {
    search: string;
    priceRange: number[];
    amenities: string[];
    availability: string;
    sortBy: string;
  };
  onFilterChange: (filters: any) => void;
}

const LibraryFilters: React.FC<LibraryFiltersProps> = ({ filters, onFilterChange }) => {
  const amenitiesList = [
    'WiFi',
    'AC',
    'Parking',
    'Cafeteria',
    'Locker',
    'Printer',
    'Water',
    'Restroom',
  ];

  const handlePriceChange = (_event: Event, newValue: number | number[]) => {
    onFilterChange({
      ...filters,
      priceRange: newValue as number[],
    });
  };

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity];
    
    onFilterChange({
      ...filters,
      amenities: newAmenities,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      priceRange: [0, 10000],
      amenities: [],
      availability: 'all',
      sortBy: 'name',
    });
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search libraries by name or location..."
        value={filters.search}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        sx={{ mb: 2 }}
        aria-label="Search libraries"
      />

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-label="Expand filters">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography>Filters</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Price Range */}
            <Box>
              <Typography gutterBottom>
                Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
              </Typography>
              <Slider
                value={filters.priceRange}
                onChange={handlePriceChange}
                valueLabelDisplay="auto"
                min={0}
                max={10000}
                step={500}
                aria-label="Price range"
              />
            </Box>

            {/* Amenities */}
            <Box>
              <Typography gutterBottom>Amenities</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {amenitiesList.map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    color={filters.amenities?.includes(amenity) ? 'primary' : 'default'}
                    variant={filters.amenities?.includes(amenity) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>

            {/* Availability and Sort By */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px' }}>
                <FormControl fullWidth>
                  <InputLabel>Availability</InputLabel>
                  <Select
                    value={filters.availability}
                    label="Availability"
                    onChange={(e) => onFilterChange({ ...filters, availability: e.target.value })}
                    aria-label="Filter by availability"
                  >
                    <MenuItem value="all">All Libraries</MenuItem>
                    <MenuItem value="available">Available Now</MenuItem>
                    <MenuItem value="today">Available Today</MenuItem>
                    <MenuItem value="week">Available This Week</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: '1 1 200px' }}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.sortBy}
                    label="Sort By"
                    onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
                    aria-label="Sort libraries"
                  >
                    <MenuItem value="name">Name (A-Z)</MenuItem>
                    <MenuItem value="price-low">Price (Low to High)</MenuItem>
                    <MenuItem value="price-high">Price (High to Low)</MenuItem>
                    <MenuItem value="rating">Rating</MenuItem>
                    <MenuItem value="distance">Distance</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Clear Filters */}
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              fullWidth
            >
              Clear All Filters
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default LibraryFilters;


