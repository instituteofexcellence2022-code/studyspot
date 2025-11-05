import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import {
  Search,
  MenuBook,
  PictureAsPdf,
  Article,
  Download,
  Bookmark,
  BookmarkBorder,
  Visibility,
  FilterList,
} from '@mui/icons-material';
import Layout from '../components/MobileLayout';
import api from '../services/api';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'ebook' | 'pdf' | 'article' | 'newspaper';
  category: string;
  coverImage?: string;
  fileSize?: string;
  pages?: number;
  author?: string;
  isBookmarked?: boolean;
  readProgress?: number;
}

export default function ResourcesPage({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [filterDialog, setFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await api.get('/api/resources');
      setResources(response.data.data || mockResources);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      setResources(mockResources);
    }
  };

  const mockResources: Resource[] = [
    {
      id: '1',
      title: 'Physics Class 12 NCERT',
      description: 'Complete NCERT textbook for Physics Class 12',
      type: 'ebook',
      category: 'Academic',
      author: 'NCERT',
      coverImage: 'https://via.placeholder.com/150x200?text=Physics+12',
      fileSize: '25 MB',
      pages: 320,
      isBookmarked: true,
      readProgress: 45,
    },
    {
      id: '2',
      title: 'The Hindu - Daily Edition',
      description: 'Today\'s newspaper with current affairs and editorials',
      type: 'newspaper',
      category: 'News',
      coverImage: 'https://via.placeholder.com/150x200?text=The+Hindu',
      fileSize: '12 MB',
      pages: 24,
      isBookmarked: false,
    },
    {
      id: '3',
      title: 'UPSC Prelims 2024 - Study Material',
      description: 'Comprehensive study material for UPSC Civil Services Prelims',
      type: 'pdf',
      category: 'Competitive Exams',
      author: 'Vision IAS',
      coverImage: 'https://via.placeholder.com/150x200?text=UPSC+2024',
      fileSize: '45 MB',
      pages: 450,
      isBookmarked: true,
      readProgress: 20,
    },
    {
      id: '4',
      title: 'Data Structures & Algorithms',
      description: 'Complete guide to DSA with code examples in C++ and Java',
      type: 'ebook',
      category: 'Technology',
      author: 'Cormen',
      coverImage: 'https://via.placeholder.com/150x200?text=DSA',
      fileSize: '35 MB',
      pages: 580,
      isBookmarked: false,
    },
    {
      id: '5',
      title: 'Indian Economy - Current Affairs',
      description: 'Monthly compilation of economic developments and analysis',
      type: 'article',
      category: 'Economics',
      author: 'Economic Times',
      coverImage: 'https://via.placeholder.com/150x200?text=Economy',
      fileSize: '8 MB',
      pages: 50,
      isBookmarked: true,
    },
    {
      id: '6',
      title: 'English Grammar & Composition',
      description: 'Wren & Martin - Essential for competitive exams',
      type: 'ebook',
      category: 'English',
      author: 'Wren & Martin',
      coverImage: 'https://via.placeholder.com/150x200?text=Grammar',
      fileSize: '22 MB',
      pages: 380,
      isBookmarked: false,
    },
  ];

  const handleBookmark = async (resourceId: string) => {
    try {
      await api.post(`/api/resources/${resourceId}/bookmark`);
      setResources(resources.map(r => 
        r.id === resourceId ? { ...r, isBookmarked: !r.isBookmarked } : r
      ));
    } catch (error) {
      console.error('Failed to bookmark:', error);
      // Update locally anyway
      setResources(resources.map(r => 
        r.id === resourceId ? { ...r, isBookmarked: !r.isBookmarked } : r
      ));
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      const response = await api.get(`/api/resources/${resource.id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resource.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download feature coming soon!');
    }
  };

  const handleView = (resource: Resource) => {
    setSelectedResource(resource);
    setViewDialog(true);
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(search.toLowerCase()) ||
                         resource.description.toLowerCase().includes(search.toLowerCase());
    const matchesTab = tab === 0 || (tab === 1 && resource.isBookmarked);
    const matchesCategory = filters.category === 'all' || resource.category === filters.category;
    const matchesType = filters.type === 'all' || resource.type === filters.type;
    
    return matchesSearch && matchesTab && matchesCategory && matchesType;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'ebook': return <MenuBook />;
      case 'pdf': return <PictureAsPdf />;
      case 'article': return <Article />;
      case 'newspaper': return <Article />;
      default: return <MenuBook />;
    }
  };

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📚 Digital Resources
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Access e-books, study materials, newspapers, and research papers
          </Typography>
        </Box>

        {/* Search & Filter */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setFilterDialog(true)}
          >
            Filter
          </Button>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label={`All Resources (${resources.length})`} />
          <Tab label={`Bookmarked (${resources.filter(r => r.isBookmarked).length})`} />
        </Tabs>

        {/* Resources Grid */}
        <Grid container spacing={3}>
          {filteredResources.map((resource) => (
            <Grid item xs={12} sm={6} md={4} key={resource.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={resource.coverImage}
                  alt={resource.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" fontWeight="600" sx={{ flex: 1 }}>
                      {resource.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleBookmark(resource.id)}
                      color={resource.isBookmarked ? 'primary' : 'default'}
                    >
                      {resource.isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip
                      icon={getResourceIcon(resource.type)}
                      label={resource.type}
                      size="small"
                      variant="outlined"
                    />
                    <Chip label={resource.category} size="small" color="primary" />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {resource.description}
                  </Typography>

                  {resource.author && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      By {resource.author}
                    </Typography>
                  )}

                  <Typography variant="caption" color="text.secondary" display="block">
                    {resource.pages} pages • {resource.fileSize}
                  </Typography>

                  {resource.readProgress !== undefined && resource.readProgress > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {resource.readProgress}%
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={resource.readProgress} />
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleView(resource)}
                    >
                      Read
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<Download />}
                      onClick={() => handleDownload(resource)}
                    >
                      Download
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredResources.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <MenuBook sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No resources found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        )}

        {/* View Dialog */}
        <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedResource?.title}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <MenuBook sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                PDF Viewer Coming Soon!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You'll be able to read resources directly in the app. For now, please download to read.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() => {
                  if (selectedResource) handleDownload(selectedResource);
                  setViewDialog(false);
                }}
              >
                Download to Read
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={filterDialog} onClose={() => setFilterDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Filter Resources</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              select
              label="Category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              margin="normal"
              SelectProps={{ native: true }}
            >
              <option value="all">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Competitive Exams">Competitive Exams</option>
              <option value="Technology">Technology</option>
              <option value="News">News</option>
              <option value="Economics">Economics</option>
              <option value="English">English</option>
            </TextField>
            <TextField
              fullWidth
              select
              label="Type"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              margin="normal"
              SelectProps={{ native: true }}
            >
              <option value="all">All Types</option>
              <option value="ebook">E-books</option>
              <option value="pdf">PDF Documents</option>
              <option value="article">Articles</option>
              <option value="newspaper">Newspapers</option>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setFilters({ category: 'all', type: 'all' });
              setFilterDialog(false);
            }}>
              Clear
            </Button>
            <Button onClick={() => setFilterDialog(false)} variant="contained">
              Apply
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

