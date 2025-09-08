import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Alert,
  Button,
  Stack,
  Divider
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  OpenInNew,
  ContentCopy,
  ExpandMore,
  ExpandLess,
  Refresh,
  Analytics,
  Link,
  AccessTime
} from '@mui/icons-material';
import { useStatistics } from '../hooks/useStatistics';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { UrlData, ClickData } from '../types';
import logger from '../utils/logger';

interface UrlStatsCardProps {
  urlData: UrlData;
}

const UrlStatsCard: React.FC<UrlStatsCardProps> = ({ urlData }) => {
  const [expanded, setExpanded] = useState(false);

  const handleCopyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      logger.info('frontend', 'component', `URL copied to clipboard: ${url}`);
    } catch (error) {
      logger.error('frontend', 'component', 'Failed to copy URL to clipboard');
    }
  };

  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    logger.info('frontend', 'component', `Opened URL: ${url}`);
  };

  const isExpired = new Date(urlData.expires_at) < new Date();
  const createdDate = new Date(urlData.created_at);
  const expiryDate = new Date(urlData.expires_at);

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        {/* Header Section */}
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Link color="primary" />
          <Box flexGrow={1} minWidth={0}>
            <Typography variant="h6" noWrap>
              {urlData.shortLink}
            </Typography>
            <Typography variant="body2" color="textSecondary" noWrap>
              {urlData.original_url}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={0.5}>
            <IconButton 
              size="small" 
              onClick={() => handleCopyToClipboard(urlData.shortLink)}
              title="Copy short URL"
            >
              <ContentCopy fontSize="small" />
            </IconButton>
            
            <IconButton 
              size="small" 
              onClick={() => handleOpenUrl(urlData.shortLink)}
              title="Open short URL"
              disabled={isExpired}
            >
              <OpenInNew fontSize="small" />
            </IconButton>

            <IconButton 
              size="small" 
              onClick={() => setExpanded(!expanded)}
              title={expanded ? "Hide details" : "Show details"}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Stack>
        </Stack>

        {/* Status and Stats Row */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid xs={12} sm={6} md={3}>
            <Chip 
              label={isExpired ? "Expired" : "Active"} 
              color={isExpired ? "error" : "success"}
              size="small"
              variant="outlined"
            />
          </Grid>
          
          <Grid xs={12} sm={6} md={3}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Analytics fontSize="small" color="primary" />
              <Typography variant="body2">
                {urlData.click_count} clicks
              </Typography>
            </Stack>
          </Grid>
          
          <Grid xs={12} sm={6} md={3}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AccessTime fontSize="small" color="action" />
              <Typography variant="caption" color="textSecondary">
                Created: {createdDate.toLocaleDateString()}
              </Typography>
            </Stack>
          </Grid>
          
          <Grid xs={12} sm={6} md={3}>
            <Typography variant="caption" color={isExpired ? "error" : "textSecondary"}>
              Expires: {expiryDate.toLocaleString()}
            </Typography>
          </Grid>
        </Grid>

        {/* Expandable Click Details */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ mb: 2 }} />
          
          {urlData.clicks && urlData.clicks.length > 0 ? (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Click Analytics ({urlData.clicks.length} clicks)
              </Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>User Agent</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {urlData.clicks.map((click: ClickData, index: number) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(click.timestamp).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap title={click.source}>
                            {click.source === 'Direct' ? (
                              <Chip label="Direct" size="small" variant="outlined" />
                            ) : (
                              click.source
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={click.location || 'Unknown'} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="textSecondary" title={click.userAgent}>
                            {click.userAgent ? 
                              click.userAgent.substring(0, 50) + (click.userAgent.length > 50 ? '...' : '') 
                              : 'Unknown'
                            }
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Alert severity="info" sx={{ mt: 1 }}>
              No clicks recorded yet for this URL.
            </Alert>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

export const Statistics: React.FC = () => {
  const { data, loading, error, refresh } = useStatistics();

  React.useEffect(() => {
    logger.info('frontend', 'page', 'Statistics page mounted');
    
    return () => {
      logger.debug('frontend', 'page', 'Statistics page unmounted');
    };
  }, []);

  const handleRefresh = async () => {
    logger.info('frontend', 'page', 'Refreshing statistics data');
    await refresh();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LoadingSpinner message="Loading URL statistics..." />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Failed to Load Statistics</Typography>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleRefresh} startIcon={<Refresh />}>
          Retry
        </Button>
      </Container>
    );
  }

  const stats = data;
  const totalClicks = stats?.urls.reduce((sum, url) => sum + url.click_count, 0) || 0;
  const activeUrls = stats?.urls.filter(url => new Date(url.expires_at) >= new Date()).length || 0;
  const expiredUrls = (stats?.total || 0) - activeUrls;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            URL Statistics
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Comprehensive analytics for all your shortened URLs
          </Typography>
        </Box>
        
        <Button 
          variant="outlined" 
          startIcon={<Refresh />} 
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {stats?.total || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total URLs Created
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                {activeUrls}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active URLs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" gutterBottom>
                {expiredUrls}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Expired URLs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" gutterBottom>
                {totalClicks}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Clicks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* URLs List */}
      {stats && stats.urls.length > 0 ? (
        <>
          <Typography variant="h5" gutterBottom>
            URL Details ({stats.urls.length})
          </Typography>
          
          {stats.urls.map((urlData) => (
            <UrlStatsCard key={urlData.id} urlData={urlData} />
          ))}
        </>
      ) : (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No URLs Found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create some shortened URLs to see statistics here.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};
