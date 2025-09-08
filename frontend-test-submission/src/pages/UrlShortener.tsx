import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Divider,
  Paper,
  Stack
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Add, Delete, Send } from '@mui/icons-material';
import { FormUrlData, CreateUrlRequest } from '../types';
import { useUrlShortener } from '../hooks/useUrlShortener';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { SuccessDisplay } from '../components/SuccessDisplay';
import logger from '../utils/logger';

export const UrlShortener: React.FC = () => {
  const [urlForms, setUrlForms] = useState<FormUrlData[]>([
    { id: '1', url: '', validity: 30, shortcode: '' }
  ]);

  const { createUrls, loading, errors, successes, clearResults } = useUrlShortener();

  // Generate unique ID for new forms
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const addUrlForm = useCallback(() => {
    if (urlForms.length >= 5) {
      logger.warn('frontend', 'page', 'Maximum 5 URLs allowed');
      return;
    }
    
    const newForm: FormUrlData = {
      id: generateId(),
      url: '',
      validity: 30,
      shortcode: ''
    };
    
    setUrlForms(prev => [...prev, newForm]);
    logger.debug('frontend', 'page', `Added URL form ${newForm.id}`);
  }, [urlForms.length]);

  const removeUrlForm = useCallback((id: string) => {
    if (urlForms.length <= 1) return;
    
    setUrlForms(prev => prev.filter(form => form.id !== id));
    logger.debug('frontend', 'page', `Removed URL form ${id}`);
  }, [urlForms.length]);

  const updateUrlForm = useCallback((id: string, field: keyof Omit<FormUrlData, 'id'>, value: string | number) => {
    setUrlForms(prev => 
      prev.map(form => 
        form.id === id ? { ...form, [field]: value } : form
      )
    );
  }, []);

  const validateForm = (form: FormUrlData): string | null => {
    if (!form.url.trim()) {
      return 'URL is required';
    }

    try {
      new URL(form.url);
    } catch (error) {
      return 'Invalid URL format';
    }

    if (form.validity && (form.validity < 1 || !Number.isInteger(Number(form.validity)))) {
      return 'Validity must be a positive integer';
    }

    if (form.shortcode && form.shortcode.trim()) {
      if (!/^[a-zA-Z0-9]+$/.test(form.shortcode.trim())) {
        return 'Shortcode must be alphanumeric';
      }
      if (form.shortcode.trim().length < 3 || form.shortcode.trim().length > 20) {
        return 'Shortcode must be 3-20 characters';
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    logger.info('frontend', 'page', `Submitting ${urlForms.length} URLs for shortening`);
    
    // Clear previous results
    clearResults();

    // Validate all forms
    const validationErrors: string[] = [];
    const validRequests: CreateUrlRequest[] = [];

    urlForms.forEach((form, index) => {
      const validationError = validateForm(form);
      if (validationError) {
        validationErrors.push(`URL ${index + 1}: ${validationError}`);
      } else {
        const request: CreateUrlRequest = {
          url: form.url.trim(),
          validity: form.validity || 30,
          shortcode: form.shortcode?.trim() || undefined
        };
        validRequests.push(request);
      }
    });

    if (validationErrors.length > 0) {
      logger.warn('frontend', 'page', `Form validation failed: ${validationErrors.length} errors`);
      return;
    }

    if (validRequests.length === 0) {
      logger.warn('frontend', 'page', 'No valid URLs to process');
      return;
    }

    try {
      await createUrls(validRequests);
    } catch (error) {
      logger.error('frontend', 'page', 'URL creation process failed');
    }
  };

  const canAddMore = urlForms.length < 5;
  const canRemove = urlForms.length > 1;
  const hasValidData = urlForms.some(form => form.url.trim());

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          URL Shortener
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Create up to 5 shortened URLs with custom codes and expiry times
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h6">
            URL Forms ({urlForms.length}/5)
          </Typography>
          
          <Button
            startIcon={<Add />}
            onClick={addUrlForm}
            disabled={!canAddMore}
            variant="outlined"
            size="small"
          >
            Add URL
          </Button>
        </Box>

        <Stack spacing={2}>
          {urlForms.map((form, index) => (
            <Card key={form.id} variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    URL {index + 1}
                  </Typography>
                  
                  {canRemove && (
                    <IconButton 
                      onClick={() => removeUrlForm(form.id)}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid xs={12}>
                    <TextField
                      label="Original URL"
                      placeholder="https://example.com/very/long/url"
                      value={form.url}
                      onChange={(e) => updateUrlForm(form.id, 'url', e.target.value)}
                      fullWidth
                      required
                      helperText="Enter the URL you want to shorten"
                    />
                  </Grid>
                  
                  <Grid xs={12} sm={6}>
                    <TextField
                      label="Validity (minutes)"
                      type="number"
                      value={form.validity}
                      onChange={(e) => updateUrlForm(form.id, 'validity', parseInt(e.target.value) || 30)}
                      fullWidth
                      inputProps={{ min: 1 }}
                      helperText="How long the link should remain active"
                    />
                  </Grid>
                  
                  <Grid xs={12} sm={6}>
                    <TextField
                      label="Custom Shortcode (optional)"
                      placeholder="mylink123"
                      value={form.shortcode}
                      onChange={(e) => updateUrlForm(form.id, 'shortcode', e.target.value)}
                      fullWidth
                      helperText="3-20 alphanumeric characters"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Box textAlign="center">
          <Button
            variant="contained"
            size="large"
            startIcon={loading ? null : <Send />}
            onClick={handleSubmit}
            disabled={loading || !hasValidData}
            sx={{ minWidth: 200 }}
          >
            {loading ? 'Creating URLs...' : 'Create Short URLs'}
          </Button>
        </Box>
      </Paper>

      {/* Results Section */}
      {loading && (
        <LoadingSpinner message="Creating your short URLs..." />
      )}

      <ErrorDisplay errors={errors} title="URL Creation Errors" />
      <SuccessDisplay successes={successes} />

      {/* Info Section */}
      <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="body2" color="textSecondary" paragraph>
          <strong>Tips:</strong>
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 3 }}>
          <li><Typography variant="body2" color="textSecondary">URLs must include http:// or https://</Typography></li>
          <li><Typography variant="body2" color="textSecondary">Custom shortcodes must be unique and alphanumeric</Typography></li>
          <li><Typography variant="body2" color="textSecondary">Default validity is 30 minutes if not specified</Typography></li>
          <li><Typography variant="body2" color="textSecondary">You can create up to 5 URLs at once</Typography></li>
        </Box>
      </Paper>
    </Container>
  );
};
