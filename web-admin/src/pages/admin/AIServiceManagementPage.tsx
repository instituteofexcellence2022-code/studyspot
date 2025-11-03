import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Chip, LinearProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, Divider, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Alert, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, TextField } from '@mui/material';
import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
  AutoAwesome as AutoAwesomeIcon,
  Chat as ChatIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Error as ErrorIcon,
  Fingerprint as FingerprintIcon,
  Image as ImageIcon,
  Language as LanguageIcon,
  Memory as MemoryIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Psychology as AIIcon,
  Refresh as RefreshIcon,
  SentimentSatisfied as SentimentIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  Stop as StopIcon,
  TextFields as TextGenIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAIService } from '../../services';

const AIServiceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [createModelOpen, setCreateModelOpen] = useState(false);
  const [modelDetailsOpen, setModelDetailsOpen] = useState(false);
  const [testNLPOpen, setTestNLPOpen] = useState(false);
  const [testChatOpen, setTestChatOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [nlpText, setNlpText] = useState('');
  const [nlpResult, setNlpResult] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{message: string, response: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use real AI service hook
  const {
    status,
    metrics,
    error,
    models,
    insights,
    serviceControl,
    refresh,
    refreshMetrics,
    createModel,
    updateModel,
    deleteModel,
    processNLP,
    processImage,
    generateText,
    chat} = useAIService();

  useEffect(() => {
    refresh();
    refreshMetrics();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const refreshData = async () => {
    try {
      await refresh();
      await refreshMetrics();
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  const handleCreateModel = async (modelData: any) => {
    try {
      setIsLoading(true);
      // Mock implementation - replace with actual API call
      console.log('Creating model:', modelData);
      alert('AI Model created successfully!');
      setCreateModelOpen(false);
      await refreshData();
    } catch (err) {
      alert(`Failed to create model: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateModel = async (id: string, modelData: any) => {
    try {
      setIsLoading(true);
      // Mock implementation - replace with actual API call
      console.log('Updating model:', id, modelData);
      alert('AI Model updated successfully!');
      setModelDetailsOpen(false);
      await refreshData();
    } catch (err) {
      alert(`Failed to update model: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this AI model?')) {
      try {
        setIsLoading(true);
        // Mock implementation - replace with actual API call
        console.log('Deleting model:', id);
        alert('AI Model deleted successfully!');
        await refreshData();
      } catch (err) {
        alert(`Failed to delete model: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTestNLP = async () => {
    if (!nlpText.trim()) {
      alert('Please enter text to analyze');
      return;
    }
    try {
      setIsLoading(true);
      const result = await processNLP(nlpText);
      setNlpResult(result);
      alert('NLP analysis completed successfully!');
    } catch (err) {
      alert(`Failed to process NLP: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestChat = async () => {
    if (!chatMessage.trim()) {
      alert('Please enter a message');
      return;
    }
    try {
      setIsLoading(true);
      const response = await chat(chatMessage);
      setChatResponse(response.message || response.text || 'No response');
      setChatHistory(prev => [...prev, { message: chatMessage, response: response.message || response.text || 'No response' }]);
      setChatMessage('');
    } catch (err) {
      alert(`Failed to chat: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceControl = async (action: 'start' | 'stop' | 'restart') => {
    try {
      setIsLoading(true);
      // Mock implementation - replace with actual API call
      console.log('Service control action:', action);
      switch (action) {
        case 'start':
          console.log('Starting service...');
          break;
        case 'stop':
          console.log('Stopping service...');
          break;
        case 'restart':
          console.log('Restarting service...');
          break;
      }
      alert(`Service ${action}ed successfully!`);
      await refreshData();
    } catch (err) {
      alert(`Failed to ${action} service: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateText = async (prompt: string) => {
    try {
      setIsLoading(true);
      const result = await generateText(prompt);
      alert(`Generated text: ${result.text || result.generatedText || 'No text generated'}`);
    } catch (err) {
      alert(`Failed to generate text: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            AI Service Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage AI models, NLP processing, and chatbot functionality
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PlayIcon />}
            onClick={() => handleServiceControl('start')}
            disabled={isLoading || status.status === 'healthy'}
            color="success"
          >
            Start Service
          </Button>
          <Button
            variant="outlined"
            startIcon={<StopIcon />}
            onClick={() => handleServiceControl('stop')}
            disabled={isLoading || status.status === 'unhealthy'}
            color="error"
          >
            Stop Service
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => handleServiceControl('restart')}
            disabled={isLoading}
            color="warning"
          >
            Restart Service
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateModelOpen(true)}
          >
            Add Model
          </Button>
          <Button
            variant="outlined"
            startIcon={<TextGenIcon />}
            onClick={() => setTestNLPOpen(true)}
          >
            Test NLP
          </Button>
          <Button
            variant="outlined"
            startIcon={<ChatIcon />}
            onClick={() => setTestChatOpen(true)}
          >
            Test Chat
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
                  <AIIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Active Models</Typography>
                  <Typography variant="h4" color="primary">
                    {models.filter((m: any) => m.status === 'active').length}
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
                <Avatar sx={{ bgcolor: '#10b981', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Total Requests</Typography>
                  <Typography variant="h4" color="primary">
                    {metrics?.totalRequests || 0}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ color: '#16a34a', mr: 1, fontSize: 16 }} />
                <Typography variant="body2" color="success.main">
                  Active: {metrics?.activeConnections || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#f59e0b', mr: 2 }}>
                  <SpeedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Response Time</Typography>
                  <Typography variant="h4" color="primary">
                    {metrics?.responseTime || 0}ms
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Target: &lt;500ms
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#8b5cf6', mr: 2 }}>
                  <MemoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Error Rate</Typography>
                  <Typography variant="h4" color="primary">
                    {metrics?.errorRate || 0}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={metrics?.errorRate || 0} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Service Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Service Status</Typography>
            <Chip
              label={status.status}
              color={status.status === 'healthy' ? 'success' : 'error'}
              icon={status.status === 'healthy' ? <CheckIcon /> : <ErrorIcon />}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="body2" color="text.secondary">Uptime</Typography>
              <Typography variant="body1">{status.uptime || 'N/A'}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="body2" color="text.secondary">Version</Typography>
              <Typography variant="body1">{status.version || 'N/A'}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="body2" color="text.secondary">Last Updated</Typography>
              <Typography variant="body1">{metrics?.lastUpdated || 'N/A'}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Models" />
            <Tab label="Insights" />
            <Tab label="Performance" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Models Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">AI Models</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateModelOpen(true)}
                >
                  Add Model
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {models.map((model: any) => (
                  <Card key={model.id} sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6">{model.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{model.type}</Typography>
                        </Box>
                        <Chip
                          label={model.status}
                          color={model.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {model.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Accuracy</Typography>
                          <Typography variant="body1">{model.accuracy}%</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Requests</Typography>
                          <Typography variant="body1">{model.requests}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedModel(model);
                            setModelDetailsOpen(true);
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedModel(model);
                            setModelDetailsOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModel(model.id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {/* Insights Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>AI Insights</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {insights?.map((insight: any, index: number) => (
                  <Card key={index} sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{insight.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {insight.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Confidence</Typography>
                        <Typography variant="body2">{insight.confidence}%</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {/* Performance Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Trend</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Response Time</TableCell>
                      <TableCell>{metrics?.responseTime || 0}ms</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingDownIcon sx={{ color: '#16a34a', mr: 1 }} />
                          <Typography variant="body2" color="success.main">-5%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label="Good" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Throughput</TableCell>
                      <TableCell>{metrics?.activeConnections || 0} req/min</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingUpIcon sx={{ color: '#16a34a', mr: 1 }} />
                          <Typography variant="body2" color="success.main">+12%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label="Excellent" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Error Rate</TableCell>
                      <TableCell>{metrics?.errorRate || 0}%</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingDownIcon sx={{ color: '#16a34a', mr: 1 }} />
                          <Typography variant="body2" color="success.main">-2%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label="Good" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create Model Dialog */}
      <Dialog
        open={createModelOpen}
        onClose={() => setCreateModelOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create New AI Model
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Model Name"
              fullWidth
              variant="outlined"
              id="model-name"
            />
            <FormControl fullWidth>
              <InputLabel>Model Type</InputLabel>
              <Select label="Model Type" id="model-type">
                <MenuItem value="chatbot">Chatbot</MenuItem>
                <MenuItem value="sentiment">Sentiment Analysis</MenuItem>
                <MenuItem value="language_detection">Language Detection</MenuItem>
                <MenuItem value="text_generation">Text Generation</MenuItem>
                <MenuItem value="computer_vision">Computer Vision</MenuItem>
                <MenuItem value="nlp">NLP Processing</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              id="model-description"
            />
            <TextField
              label="Version"
              fullWidth
              variant="outlined"
              defaultValue="v1.0.0"
              id="model-version"
            />
            <FormControlLabel
              control={<Switch defaultChecked id="auto-training" />}
              label="Enable Auto-training"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateModelOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              const name = (document.getElementById('model-name') as HTMLInputElement)?.value;
              const type = (document.getElementById('model-type') as HTMLSelectElement)?.value;
              const description = (document.getElementById('model-description') as HTMLInputElement)?.value;
              const version = (document.getElementById('model-version') as HTMLInputElement)?.value;
              const autoTraining = (document.getElementById('auto-training') as HTMLInputElement)?.checked;
              
              if (!name || !type) {
                alert('Please fill in all required fields');
                return;
              }
              
              handleCreateModel({
                name,
                type,
                description,
                version,
                autoTraining,
                status: 'training',
                accuracy: 0,
                requests: 0,
                lastTrained: new Date().toISOString().split('T')[0]});
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Model'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test NLP Dialog */}
      <Dialog
        open={testNLPOpen}
        onClose={() => setTestNLPOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Test NLP Processing
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Text to Analyze"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={nlpText}
              onChange={(e) => setNlpText(e.target.value)}
              placeholder="Enter text for NLP analysis..."
            />
            {nlpResult && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Analysis Result:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <pre>{JSON.stringify(nlpResult, null, 2)}</pre>
                </Paper>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestNLPOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained"
            onClick={handleTestNLP}
            disabled={isLoading || !nlpText.trim()}
          >
            {isLoading ? 'Analyzing...' : 'Analyze Text'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Chat Dialog */}
      <Dialog
        open={testChatOpen}
        onClose={() => setTestChatOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Test AI Chat
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Your Message"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type your message here..."
            />
            {chatHistory.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Chat History:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5', maxHeight: 200, overflow: 'auto' }}>
                  {chatHistory.map((chat, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="body2" color="primary">
                        You: {chat.message}
                      </Typography>
                      <Typography variant="body2">
                        AI: {chat.response}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Box>
            )}
            {chatResponse && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Latest Response:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                  <Typography variant="body1">{chatResponse}</Typography>
                </Paper>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestChatOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained"
            onClick={handleTestChat}
            disabled={isLoading || !chatMessage.trim()}
          >
            {isLoading ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIServiceManagement;