import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Rating,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Grid,
  Divider,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  RateReview,
  ThumbUp,
  Edit,
  Delete,
  Image as ImageIcon,
  Close,
} from '@mui/icons-material';
import Layout from '../components/StudyFocusedLayout';
import api from '../services/api';

interface Review {
  id: string;
  libraryId: string;
  libraryName: string;
  rating: number;
  title: string;
  comment: string;
  photos?: string[];
  date: string;
  helpful: number;
  isMyReview: boolean;
}

interface LibraryRating {
  libraryId: string;
  libraryName: string;
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function ReviewsPage({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState<LibraryRating | null>(null);
  const [reviewForm, setReviewForm] = useState({
    libraryId: '',
    libraryName: '',
    rating: 0,
    title: '',
    comment: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/api/reviews/my-reviews');
      setReviews(response.data.data || mockReviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      setReviews(mockReviews);
    }
  };

  const mockReviews: Review[] = [
    {
      id: '1',
      libraryId: '1',
      libraryName: 'Central Library',
      rating: 5,
      title: 'Excellent study environment!',
      comment: 'Very quiet and peaceful. AC works perfectly. Staff is helpful. WiFi speed is great. Highly recommend for serious students.',
      date: '2024-11-01',
      helpful: 12,
      isMyReview: true,
    },
    {
      id: '2',
      libraryId: '2',
      libraryName: 'Knowledge Hub',
      rating: 4,
      title: 'Good but can improve',
      comment: 'Overall good experience. Seats are comfortable. Only issue is WiFi sometimes disconnects in the evening.',
      photos: ['https://via.placeholder.com/100'],
      date: '2024-10-28',
      helpful: 5,
      isMyReview: true,
    },
  ];

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }
    
    setPhotos([...photos, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreview(photoPreview.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    try {
      const formData = new FormData();
      formData.append('libraryId', reviewForm.libraryId);
      formData.append('rating', String(reviewForm.rating));
      formData.append('title', reviewForm.title);
      formData.append('comment', reviewForm.comment);
      
      photos.forEach(photo => {
        formData.append('photos', photo);
      });

      await api.post('/api/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Review submitted successfully!');
      setReviewDialog(false);
      resetForm();
      fetchReviews();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.delete(`/api/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (error) {
      console.error('Failed to delete review:', error);
      setReviews(reviews.filter(r => r.id !== reviewId));
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      await api.post(`/api/reviews/${reviewId}/helpful`);
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r));
    } catch (error) {
      console.error('Failed to mark helpful:', error);
    }
  };

  const resetForm = () => {
    setReviewForm({
      libraryId: '',
      libraryName: '',
      rating: 0,
      title: '',
      comment: '',
    });
    setPhotos([]);
    setPhotoPreview([]);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'success.main';
    if (rating >= 3) return 'warning.main';
    return 'error.main';
  };

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              ⭐ My Reviews
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Share your experience and help others
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RateReview />}
            onClick={() => setReviewDialog(true)}
          >
            Write Review
          </Button>
        </Box>

        {/* Reviews List */}
        <Grid container spacing={3}>
          {reviews.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        {review.libraryName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="body2" fontWeight="600">
                          {review.rating}.0
                        </Typography>
                        <Chip label={review.date} size="small" variant="outlined" />
                      </Box>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                        {review.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {review.comment}
                      </Typography>

                      {review.photos && review.photos.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          {review.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Review photo ${index + 1}`}
                              style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                            />
                          ))}
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" startIcon={<ThumbUp />} onClick={() => handleHelpful(review.id)}>
                          Helpful ({review.helpful})
                        </Button>
                      </Box>
                    </Box>

                    {review.isMyReview && (
                      <Box>
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteReview(review.id)}>
                          <Delete />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {reviews.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <RateReview sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No reviews yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Share your experience by writing a review
            </Typography>
            <Button variant="contained" onClick={() => setReviewDialog(true)}>
              Write Your First Review
            </Button>
          </Box>
        )}

        {/* Write Review Dialog */}
        <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Library Name"
              value={reviewForm.libraryName}
              onChange={(e) => setReviewForm({ ...reviewForm, libraryName: e.target.value })}
              margin="normal"
              placeholder="e.g., Central Library"
            />

            <Box sx={{ my: 2 }}>
              <Typography variant="body2" gutterBottom>
                Your Rating
              </Typography>
              <Rating
                value={reviewForm.rating}
                onChange={(e, value) => setReviewForm({ ...reviewForm, rating: value || 0 })}
                size="large"
              />
            </Box>

            <TextField
              fullWidth
              label="Review Title"
              value={reviewForm.title}
              onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
              margin="normal"
              placeholder="e.g., Great study environment!"
            />

            <TextField
              fullWidth
              label="Your Review"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              placeholder="Share your detailed experience..."
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Add Photos (Optional, max 5)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {photoPreview.map((preview, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white' }}
                      onClick={() => handleRemovePhoto(index)}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {photos.length < 5 && (
                  <Button
                    component="label"
                    variant="outlined"
                    sx={{ width: 100, height: 100, borderStyle: 'dashed' }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <ImageIcon />
                      <Typography variant="caption">Add</Typography>
                    </Box>
                    <input type="file" hidden accept="image/*" onChange={handlePhotoSelect} />
                  </Button>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setReviewDialog(false); resetForm(); }}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmitReview}
              disabled={!reviewForm.rating || !reviewForm.title || !reviewForm.comment}
            >
              Submit Review
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

