/**
 * ML Service Management Page
 * Comprehensive machine learning service monitoring and configuration
 * 
 * Features:
 * - Model Training
 * - Model Prediction
 * - Model Evaluation
 * - Model Deployment
 * - Training Jobs
 * - Performance Metrics
 * - Data Management
 * - Experiment Tracking
 */

import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Chip, LinearProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, Divider, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Alert, TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel } from '@mui/material';
import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckIcon,
  DataObject as DataObjectIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Error as ErrorIcon,
  Group as GroupIcon,
  Memory as MemoryIcon,
  ModelTraining as ModelTrainingIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Psychology as PsychologyIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  Stop as StopIcon,
  Timeline as TimelineIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter

  } from 'recharts';

interface MLModel {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'regression' | 'clustering' | 'deep_learning' | 'nlp';
  algorithm: string;
  status: 'training' | 'trained' | 'deployed' | 'failed' | 'deprecated';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingData: number;
  validationData: number;
  createdAt: string;
  lastTrained: string;
  deployedAt?: string;
  performance: ModelPerformance;
}

interface ModelPerformance {
  trainingLoss: number;
  validationLoss: number;
  trainingAccuracy: number;
  validationAccuracy: number;
  epochs: number;
  learningRate: number;
  batchSize: number;
}

interface TrainingJob {
  id: string;
  modelId: string;
  modelName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  progress: number;
  epochs: number;
  currentEpoch: number;
  loss: number;
  accuracy: number;
  logs: string[];
  hyperparameters: any;
}

interface PredictionRequest {
  id: string;
  modelId: string;
  modelName: string;
  inputData: any;
  prediction: any;
  confidence: number;
  timestamp: string;
  processingTime: number;
  status: 'success' | 'failed';
  errorMessage?: string;
}

interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  metrics: ExperimentMetrics;
  hyperparameters: any;
  results: any;
}

interface ExperimentMetrics {
  bestAccuracy: number;
  bestLoss: number;
  totalRuns: number;
  successfulRuns: number;
  averageTime: number;
}

const MLServiceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [models, setModels] = useState<MLModel[]>([
    {
      id: 'm1',
      name: 'User Behavior Classifier',
      version: '2.1.0',
      type: 'classification',
      algorithm: 'Random Forest',
      status: 'deployed',
      accuracy: 94.2,
      precision: 93.8,
      recall: 94.5,
      f1Score: 94.1,
      trainingData: 50000,
      validationData: 10000,
      createdAt: '2025-10-15',
      lastTrained: '2025-10-25',
      deployedAt: '2025-10-26',
      performance: {
        trainingLoss: 0.12,
        validationLoss: 0.15,
        trainingAccuracy: 95.8,
        validationAccuracy: 94.2,
        epochs: 100,
        learningRate: 0.001,
        batchSize: 32}},
    {
      id: 'm2',
      name: 'Seat Occupancy Predictor',
      version: '1.5.0',
      type: 'regression',
      algorithm: 'XGBoost',
      status: 'trained',
      accuracy: 89.7,
      precision: 88.9,
      recall: 90.2,
      f1Score: 89.5,
      trainingData: 75000,
      validationData: 15000,
      createdAt: '2025-10-10',
      lastTrained: '2025-10-24',
      performance: {
        trainingLoss: 0.08,
        validationLoss: 0.12,
        trainingAccuracy: 91.2,
        validationAccuracy: 89.7,
        epochs: 150,
        learningRate: 0.01,
        batchSize: 64}},
    {
      id: 'm3',
      name: 'Customer Segmentation',
      version: '1.0.0',
      type: 'clustering',
      algorithm: 'K-Means',
      status: 'training',
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      trainingData: 30000,
      validationData: 5000,
      createdAt: '2025-10-27',
      lastTrained: '2025-10-27',
      performance: {
        trainingLoss: 0.25,
        validationLoss: 0.28,
        trainingAccuracy: 0,
        validationAccuracy: 0,
        epochs: 50,
        learningRate: 0.1,
        batchSize: 128}},
    {
      id: 'm4',
      name: 'Sentiment Analysis',
      version: '3.0.0',
      type: 'nlp',
      algorithm: 'BERT',
      status: 'failed',
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      trainingData: 100000,
      validationData: 20000,
      createdAt: '2025-10-20',
      lastTrained: '2025-10-26',
      performance: {
        trainingLoss: 0.45,
        validationLoss: 0.52,
        trainingAccuracy: 0,
        validationAccuracy: 0,
        epochs: 200,
        learningRate: 0.0001,
        batchSize: 16}},
  ]);

  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([
    {
      id: 'j1',
      modelId: 'm3',
      modelName: 'Customer Segmentation',
      status: 'running',
      startedAt: '2025-10-27 10:30:00',
      progress: 65,
      epochs: 50,
      currentEpoch: 32,
      loss: 0.25,
      accuracy: 0,
      logs: [
        'Starting training job...',
        'Loading training data...',
        'Initializing K-Means algorithm...',
        'Training epoch 1/50...',
        'Training epoch 32/50...',
      ],
      hyperparameters: {
        n_clusters: 5,
        max_iter: 50,
        random_state: 42}},
    {
      id: 'j2',
      modelId: 'm1',
      modelName: 'User Behavior Classifier',
      status: 'completed',
      startedAt: '2025-10-25 14:00:00',
      completedAt: '2025-10-25 16:30:00',
      duration: 150,
      progress: 100,
      epochs: 100,
      currentEpoch: 100,
      loss: 0.12,
      accuracy: 94.2,
      logs: [
        'Starting training job...',
        'Loading training data...',
        'Initializing Random Forest...',
        'Training completed successfully',
        'Model accuracy: 94.2%',
      ],
      hyperparameters: {
        n_estimators: 100,
        max_depth: 10,
        random_state: 42}},
    {
      id: 'j3',
      modelId: 'm4',
      modelName: 'Sentiment Analysis',
      status: 'failed',
      startedAt: '2025-10-26 09:00:00',
      completedAt: '2025-10-26 11:15:00',
      duration: 135,
      progress: 45,
      epochs: 200,
      currentEpoch: 90,
      loss: 0.45,
      accuracy: 0,
      logs: [
        'Starting training job...',
        'Loading BERT model...',
        'Training epoch 1/200...',
        'ERROR: Out of memory at epoch 90',
        'Training failed due to memory constraints',
      ],
      hyperparameters: {
        model_name: 'bert-base-uncased',
        learning_rate: 0.0001,
        batch_size: 16}},
  ]);

  const [predictions, setPredictions] = useState<PredictionRequest[]>([
    {
      id: 'p1',
      modelId: 'm1',
      modelName: 'User Behavior Classifier',
      inputData: { userId: 'u1', sessionDuration: 120, pagesVisited: 8 },
      prediction: { class: 'engaged', probability: 0.942 },
      confidence: 94.2,
      timestamp: '2025-10-27 14:20:00',
      processingTime: 0.15,
      status: 'success'},
    {
      id: 'p2',
      modelId: 'm2',
      modelName: 'Seat Occupancy Predictor',
      inputData: { time: '14:30', dayOfWeek: 1, libraryId: 'lib1' },
      prediction: { occupancy: 0.78, confidence: 0.897 },
      confidence: 89.7,
      timestamp: '2025-10-27 14:18:00',
      processingTime: 0.08,
      status: 'success'},
    {
      id: 'p3',
      modelId: 'm1',
      modelName: 'User Behavior Classifier',
      inputData: { userId: 'u2', sessionDuration: 5, pagesVisited: 1 },
      prediction: null,
      confidence: 0,
      timestamp: '2025-10-27 14:15:00',
      processingTime: 0.12,
      status: 'failed',
      errorMessage: 'Invalid input data format'},
  ]);

  const [experiments, setExperiments] = useState<Experiment[]>([
    {
      id: 'e1',
      name: 'Hyperparameter Optimization',
      description: 'Testing different learning rates and batch sizes',
      status: 'completed',
      createdAt: '2025-10-20',
      completedAt: '2025-10-22',
      metrics: {
        bestAccuracy: 94.2,
        bestLoss: 0.12,
        totalRuns: 25,
        successfulRuns: 23,
        averageTime: 45.5},
      hyperparameters: {
        learning_rates: [0.001, 0.01, 0.1],
        batch_sizes: [16, 32, 64],
        epochs: 100},
      results: {
        best_params: { learning_rate: 0.001, batch_size: 32 },
        best_score: 0.942}},
    {
      id: 'e2',
      name: 'Algorithm Comparison',
      description: 'Comparing Random Forest vs XGBoost vs Neural Networks',
      status: 'running',
      createdAt: '2025-10-25',
      metrics: {
        bestAccuracy: 0,
        bestLoss: 0,
        totalRuns: 3,
        successfulRuns: 1,
        averageTime: 0},
      hyperparameters: {
        algorithms: ['Random Forest', 'XGBoost', 'Neural Network'],
        test_size: 0.2,
        random_state: 42},
      results: {}},
  ]);

  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [selectedJob, setSelectedJob] = useState<TrainingJob | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionRequest | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [modelDetailsOpen, setModelDetailsOpen] = useState(false);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [predictionDetailsOpen, setPredictionDetailsOpen] = useState(false);
  const [experimentDetailsOpen, setExperimentDetailsOpen] = useState(false);
  const [createModelOpen, setCreateModelOpen] = useState(false);

  // Mock data for charts
  const modelPerformanceData = [
    { model: 'Behavior Classifier', accuracy: 94.2, precision: 93.8, recall: 94.5 },
    { model: 'Occupancy Predictor', accuracy: 89.7, precision: 88.9, recall: 90.2 },
    { model: 'Customer Segmentation', accuracy: 0, precision: 0, recall: 0 },
    { model: 'Sentiment Analysis', accuracy: 0, precision: 0, recall: 0 },
  ];

  const trainingProgressData = [
    { epoch: 1, loss: 0.8, accuracy: 65 },
    { epoch: 10, loss: 0.6, accuracy: 72 },
    { epoch: 20, loss: 0.4, accuracy: 78 },
    { epoch: 30, loss: 0.3, accuracy: 82 },
    { epoch: 40, loss: 0.25, accuracy: 85 },
    { epoch: 50, loss: 0.2, accuracy: 88 },
  ];

  const predictionVolumeData = [
    { time: '00:00', predictions: 120, errors: 2 },
    { time: '04:00', predictions: 80, errors: 1 },
    { time: '08:00', predictions: 350, errors: 5 },
    { time: '12:00', predictions: 450, errors: 8 },
    { time: '16:00', predictions: 380, errors: 6 },
    { time: '20:00', predictions: 200, errors: 3 },
  ];

  const experimentResultsData = [
    { run: 1, accuracy: 0.89, loss: 0.15, color: '#6366f1' },
    { run: 2, accuracy: 0.91, loss: 0.13, color: '#16a34a' },
    { run: 3, accuracy: 0.88, loss: 0.16, color: '#d97706' },
    { run: 4, accuracy: 0.93, loss: 0.12, color: '#16a34a' },
    { run: 5, accuracy: 0.90, loss: 0.14, color: '#6366f1' },
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'trained': return '#16a34a';
      case 'deployed': return '#16a34a';
      case 'completed': return '#16a34a';
      case 'training': return '#d97706';
      case 'running': return '#d97706';
      case 'pending': return '#6366f1';
      case 'failed': return '#dc2626';
      case 'cancelled': return '#6b7280';
      case 'deprecated': return '#6b7280';
      case 'success': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'trained': return <CheckIcon />;
      case 'deployed': return <CheckIcon />;
      case 'completed': return <CheckIcon />;
      case 'training': return <PlayIcon />;
      case 'running': return <PlayIcon />;
      case 'pending': return <ScheduleIcon />;
      case 'failed': return <ErrorIcon />;
      case 'cancelled': return <StopIcon />;
      case 'deprecated': return <ErrorIcon />;
      case 'success': return <CheckIcon />;
      default: return <ErrorIcon />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'classification': return <AssessmentIcon />;
      case 'regression': return <TrendingUpIcon />;
      case 'clustering': return <GroupIcon />;
      case 'deep_learning': return <PsychologyIcon />;
      case 'nlp': return <AutoAwesomeIcon />;
      default: return <PsychologyIcon />;
    }
  };

  const handleModelClick = (model: MLModel) => {
    setSelectedModel(model);
    setModelDetailsOpen(true);
  };

  const handleJobClick = (job: TrainingJob) => {
    setSelectedJob(job);
    setJobDetailsOpen(true);
  };

  const handlePredictionClick = (prediction: PredictionRequest) => {
    setSelectedPrediction(prediction);
    setPredictionDetailsOpen(true);
  };

  const handleExperimentClick = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    setExperimentDetailsOpen(true);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const refreshData = () => {
    console.log('Refreshing ML service data...');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            ML Service Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor machine learning models, training jobs, and predictions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
          >
            Refresh Data
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateModelOpen(true)}
          >
            Create Model
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#6366f1', mr: 2 }}>
                  <PsychologyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Active Models</Typography>
                  <Typography variant="h4" color="primary">
                    {models.filter((m: any) => m.status === 'deployed').length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total: {models.length} models
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#16a34a', mr: 2 }}>
                  <CheckIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Avg Accuracy</Typography>
                  <Typography variant="h4" color="success.main">
                    {Math.round(models.filter((m: any) => m.accuracy > 0).reduce((acc, m) => acc + m.accuracy, 0) / models.filter((m: any) => m.accuracy > 0).length * 10) / 10}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.round(models.filter((m: any) => m.accuracy > 0).reduce((acc, m) => acc + m.accuracy, 0) / models.filter((m: any) => m.accuracy > 0).length * 10) / 10}
                sx={{ mt: 1 }}
                color="success"
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#d97706', mr: 2 }}>
                  <PlayIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Training Jobs</Typography>
                  <Typography variant="h4" color="warning.main">
                    {trainingJobs.filter((j: any) => j.status === 'running').length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Active training
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#dc2626', mr: 2 }}>
                  <SpeedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Predictions</Typography>
                  <Typography variant="h4" color="error.main">
                    {predictions.filter((p: any) => p.status === 'success').length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Last 24 hours
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Models" />
          <Tab label="Training Jobs" />
          <Tab label="Predictions" />
          <Tab label="Experiments" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {models.map((model) => (
            <Box sx={{ flex: '1 1 350px', minWidth: 350 }} key={model.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4}}}
                onClick={() => handleModelClick(model)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: getStatusColor(model.status), mr: 2 }}>
                      {getTypeIcon(model.type)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{model.name}</Typography>
                      <Chip
                        label={`v${model.version}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {model.type} • {model.algorithm}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Accuracy: {model.accuracy}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {model.status}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Training Data: {model.trainingData.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last Trained: {model.lastTrained}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Precision: {model.precision}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Recall: {model.recall}%
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" color="primary">
                      <PlayIcon />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <PauseIcon />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Training Jobs
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Model</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Epoch</TableCell>
                    <TableCell>Loss</TableCell>
                    <TableCell>Accuracy</TableCell>
                    <TableCell>Started</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trainingJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>{job.modelName}</TableCell>
                      <TableCell>
                        <Chip
                          label={job.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(job.status),
                            color: 'white'}}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {job.progress}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={job.progress}
                            sx={{ width: 50, height: 6 }}
                            color={job.progress > 80 ? 'success' : job.progress > 50 ? 'warning' : 'error'}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{job.currentEpoch}/{job.epochs}</TableCell>
                      <TableCell>{job.loss.toFixed(3)}</TableCell>
                      <TableCell>{job.accuracy > 0 ? `${job.accuracy}%` : '-'}</TableCell>
                      <TableCell>{job.startedAt}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleJobClick(job)}>
                            <ViewIcon />
                          </IconButton>
                          {job.status === 'running' && (
                            <IconButton size="small" color="error">
                              <StopIcon />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Predictions
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Model</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Processing Time</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {predictions.map((prediction) => (
                    <TableRow key={prediction.id}>
                      <TableCell>{prediction.modelName}</TableCell>
                      <TableCell>
                        <Chip
                          label={prediction.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(prediction.status),
                            color: 'white'}}
                        />
                      </TableCell>
                      <TableCell>
                        {prediction.confidence > 0 ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              {prediction.confidence}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={prediction.confidence}
                              sx={{ width: 50, height: 6 }}
                              color={prediction.confidence > 90 ? 'success' : prediction.confidence > 70 ? 'warning' : 'error'}
                            />
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{prediction.processingTime}s</TableCell>
                      <TableCell>{prediction.timestamp}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handlePredictionClick(prediction)}>
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <DownloadIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {experiments.map((experiment) => (
            <Box sx={{ flex: '1 1 350px', minWidth: 350 }} key={experiment.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4}}}
                onClick={() => handleExperimentClick(experiment)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: getStatusColor(experiment.status), mr: 2 }}>
                      <TimelineIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{experiment.name}</Typography>
                      <Chip
                        label={experiment.status}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(experiment.status),
                          color: 'white'}}
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {experiment.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Best Accuracy: {experiment.metrics.bestAccuracy}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Runs: {experiment.metrics.totalRuns}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate: {Math.round(experiment.metrics.successfulRuns / experiment.metrics.totalRuns * 100)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Time: {experiment.metrics.averageTime}s
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" color="primary">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {activeTab === 4 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '2 1 600px', minWidth: 400 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Model Performance Comparison
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={modelPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="model" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="accuracy" fill="#16a34a" name="Accuracy (%)" />
                    <Bar dataKey="precision" fill="#6366f1" name="Precision (%)" />
                    <Bar dataKey="recall" fill="#d97706" name="Recall (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Training Progress
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trainingProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="epoch" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="loss" stroke="#dc2626" strokeWidth={2} />
                    <Line type="monotone" dataKey="accuracy" stroke="#16a34a" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '2 1 600px', minWidth: 400 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Prediction Volume (24h)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={predictionVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="predictions"
                      stackId="1"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="errors"
                      stackId="2"
                      stroke="#dc2626"
                      fill="#dc2626"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Experiment Results
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={experimentResultsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="run" />
                    <YAxis />
                    <RechartsTooltip />
                    <Scatter dataKey="accuracy" fill="#16a34a" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Model Details Dialog */}
      <Dialog
        open={modelDetailsOpen}
        onClose={() => setModelDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedModel?.name} - Model Details
        </DialogTitle>
        <DialogContent>
          {selectedModel && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Version
                  </Typography>
                  <Typography variant="h6">
                    {selectedModel.version}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="h6">
                    {selectedModel.type}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Algorithm
                  </Typography>
                  <Typography variant="h6">
                    {selectedModel.algorithm}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedModel.status}
                    sx={{
                      bgcolor: getStatusColor(selectedModel.status),
                      color: 'white'}}
                  />
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Accuracy
                  </Typography>
                  <Typography variant="h6">
                    {selectedModel.accuracy}%
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Precision
                  </Typography>
                  <Typography variant="h6">
                    {selectedModel.precision}%
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Recall
                  </Typography>
                  <Typography variant="h6">
                    {selectedModel.recall}%
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    F1 Score
                  </Typography>
                  <Typography variant="h6">
                    {selectedModel.f1Score}%
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Training Information
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Training Data
                  </Typography>
                  <Typography variant="h6">
                    {selectedModel.trainingData.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Validation Data
                  </Typography>
                  <Typography variant="h6">
                    {selectedModel.validationData.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Epochs
                  </Typography>
                  <Typography variant="h6">
                    {selectedModel.performance.epochs}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Learning Rate
                  </Typography>
                  <Typography variant="h6">
                    {selectedModel.performance.learningRate}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModelDetailsOpen(false)}>
            Close
          </Button>
          <Button variant="contained">
            Retrain Model
          </Button>
        </DialogActions>
      </Dialog>

      {/* Job Details Dialog */}
      <Dialog
        open={jobDetailsOpen}
        onClose={() => setJobDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedJob?.modelName} - Training Job Details
        </DialogTitle>
        <DialogContent>
          {selectedJob && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedJob.status}
                    sx={{
                      bgcolor: getStatusColor(selectedJob.status),
                      color: 'white'}}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="h6">
                    {selectedJob.progress}%
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Current Epoch
                  </Typography>
                  <Typography variant="h6">
                    {selectedJob.currentEpoch}/{selectedJob.epochs}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Loss
                  </Typography>
                  <Typography variant="h6">
                    {selectedJob.loss.toFixed(3)}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Hyperparameters
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                <Typography variant="body2" fontFamily="monospace">
                  {JSON.stringify(selectedJob.hyperparameters, null, 2)}
                </Typography>
              </Paper>
              
              <Typography variant="h6" gutterBottom>
                Training Logs
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', maxHeight: 200, overflow: 'auto' }}>
                {selectedJob.logs.map((log, index) => (
                  <Typography key={index} variant="body2" fontFamily="monospace" sx={{ mb: 0.5 }}>
                    {log}
                  </Typography>
                ))}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJobDetailsOpen(false)}>
            Close
          </Button>
          <Button variant="contained">
            Download Logs
          </Button>
        </DialogActions>
      </Dialog>

      {/* Prediction Details Dialog */}
      <Dialog
        open={predictionDetailsOpen}
        onClose={() => setPredictionDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedPrediction?.modelName} - Prediction Details
        </DialogTitle>
        <DialogContent>
          {selectedPrediction && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedPrediction.status}
                    sx={{
                      bgcolor: getStatusColor(selectedPrediction.status),
                      color: 'white'}}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Confidence
                  </Typography>
                  <Typography variant="h6">
                    {selectedPrediction.confidence}%
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Processing Time
                  </Typography>
                  <Typography variant="h6">
                    {selectedPrediction.processingTime}s
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Timestamp
                  </Typography>
                  <Typography variant="h6">
                    {selectedPrediction.timestamp}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Input Data
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                <Typography variant="body2" fontFamily="monospace">
                  {JSON.stringify(selectedPrediction.inputData, null, 2)}
                </Typography>
              </Paper>
              
              <Typography variant="h6" gutterBottom>
                Prediction Result
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                <Typography variant="body2" fontFamily="monospace">
                  {JSON.stringify(selectedPrediction.prediction, null, 2)}
                </Typography>
              </Paper>
              
              {selectedPrediction.errorMessage && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Error Message
                  </Typography>
                  <Alert severity="error">
                    {selectedPrediction.errorMessage}
                  </Alert>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPredictionDetailsOpen(false)}>
            Close
          </Button>
          <Button variant="contained">
            Download Result
          </Button>
        </DialogActions>
      </Dialog>

      {/* Experiment Details Dialog */}
      <Dialog
        open={experimentDetailsOpen}
        onClose={() => setExperimentDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedExperiment?.name} - Experiment Details
        </DialogTitle>
        <DialogContent>
          {selectedExperiment && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedExperiment.status}
                    sx={{
                      bgcolor: getStatusColor(selectedExperiment.status),
                      color: 'white'}}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Best Accuracy
                  </Typography>
                  <Typography variant="h6">
                    {selectedExperiment.metrics.bestAccuracy}%
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Runs
                  </Typography>
                  <Typography variant="h6">
                    {selectedExperiment.metrics.totalRuns}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Success Rate
                  </Typography>
                  <Typography variant="h6">
                    {Math.round(selectedExperiment.metrics.successfulRuns / selectedExperiment.metrics.totalRuns * 100)}%
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedExperiment.description}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Hyperparameters
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                <Typography variant="body2" fontFamily="monospace">
                  {JSON.stringify(selectedExperiment.hyperparameters, null, 2)}
                </Typography>
              </Paper>
              
              <Typography variant="h6" gutterBottom>
                Results
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="body2" fontFamily="monospace">
                  {JSON.stringify(selectedExperiment.results, null, 2)}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExperimentDetailsOpen(false)}>
            Close
          </Button>
          <Button variant="contained">
            Export Results
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Model Dialog */}
      <Dialog
        open={createModelOpen}
        onClose={() => setCreateModelOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Create New ML Model
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Model Name"
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type">
                <MenuItem value="classification">Classification</MenuItem>
                <MenuItem value="regression">Regression</MenuItem>
                <MenuItem value="clustering">Clustering</MenuItem>
                <MenuItem value="deep_learning">Deep Learning</MenuItem>
                <MenuItem value="nlp">Natural Language Processing</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Algorithm</InputLabel>
              <Select label="Algorithm">
                <MenuItem value="random_forest">Random Forest</MenuItem>
                <MenuItem value="xgboost">XGBoost</MenuItem>
                <MenuItem value="neural_network">Neural Network</MenuItem>
                <MenuItem value="kmeans">K-Means</MenuItem>
                <MenuItem value="bert">BERT</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Training Data Size"
              fullWidth
              variant="outlined"
              type="number"
            />
            <TextField
              label="Validation Data Size"
              fullWidth
              variant="outlined"
              type="number"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Start training immediately"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateModelOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Create Model
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MLServiceManagement;
