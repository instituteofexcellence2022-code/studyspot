import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchLibraries, deleteLibrary } from '../../store/slices/librarySlice';
import { showSnackbar } from '../../store/slices/uiSlice';
import { ROUTES } from '../../constants';
import { Library, LibraryStatus } from '../../types';

interface LibraryListProps {
  onEdit?: (library: Library) => void;
  onView?: (library: Library) => void;
}

const LibraryList: React.FC<LibraryListProps> = ({ onEdit, onView }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { libraries, isLoading, error } = useAppSelector((state) => state.library);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [libraryToDelete, setLibraryToDelete] = useState<Library | null>(null);

  useEffect(() => {
    dispatch(fetchLibraries({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Optimized with useCallback to prevent unnecessary re-renders
  const handleEdit = useCallback((library: Library) => {
    if (onEdit) {
      onEdit(library);
    } else {
      navigate(`${ROUTES.LIBRARY_EDIT.replace(':id', library.id)}`);
    }
  }, [onEdit, navigate]);

  const handleView = useCallback((library: Library) => {
    if (onView) {
      onView(library);
    } else {
      navigate(`${ROUTES.LIBRARY_DETAILS.replace(':id', library.id)}`);
    }
  }, [onView, navigate]);

  const handleDeleteClick = useCallback((library: Library) => {
    setLibraryToDelete(library);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (libraryToDelete) {
      try {
        await dispatch(deleteLibrary(libraryToDelete.id)).unwrap();
        dispatch(showSnackbar({
          message: 'Library deleted successfully',
          severity: 'success',
        }));
      } catch (error: any) {
        dispatch(showSnackbar({
          message: error || 'Failed to delete library',
          severity: 'error',
        }));
      }
    }
    setDeleteDialogOpen(false);
    setLibraryToDelete(null);
  }, [libraryToDelete, dispatch]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setLibraryToDelete(null);
  }, []);

  const getStatusColor = useCallback((status: LibraryStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'maintenance':
        return 'warning';
      case 'closed':
        return 'error';
      default:
        return 'default';
    }
  }, []);

  // Optimized with useMemo to prevent unnecessary recalculations
  const filteredLibraries = useMemo(() => 
    (libraries || []).filter(library =>
      library.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      library.address.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [libraries, searchTerm]
  );

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Box sx={{ fontWeight: 'bold' }}>{params.value}</Box>
          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            ID: {params.row.id}
          </Box>
        </Box>
      ),
    },
    {
      field: 'address',
      headerName: 'Address',
      width: 250,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Box sx={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: 'capacity',
      headerName: 'Capacity',
      width: 100,
      type: 'number',
    },
    {
      field: 'pricing',
      headerName: 'Hourly Rate',
      width: 120,
      renderCell: (params) => (
        <Box>
          ₹{params.value?.hourlyRate || 0}
        </Box>
      ),
    },
    {
      field: 'amenities',
      headerName: 'Amenities',
      width: 200,
      renderCell: (params) => {
        const amenities = params.value || {};
        const amenityCount = Object.values(amenities).filter(Boolean).length;
        return (
          <Chip 
            label={`${amenityCount} amenities`} 
            size="small" 
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      type: 'date',
      valueGetter: (params: any) => new Date(params.value),
      renderCell: (params: any) => (
        <Box sx={{ fontSize: '0.875rem' }}>
          {new Date(params.value).toLocaleDateString()}
        </Box>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="View"
          onClick={() => handleView(params.row)}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteClick(params.row)}
        />,
      ],
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder="Search libraries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
            sx={{ width: 300 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(ROUTES.LIBRARY_CREATE)}
        >
          Add Library
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Data Grid */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredLibraries}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #e0e0e0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              borderBottom: '2px solid #e0e0e0',
            },
          }}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the library "{libraryToDelete?.name}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Optimized with React.memo to prevent unnecessary re-renders
export default React.memo(LibraryList);

