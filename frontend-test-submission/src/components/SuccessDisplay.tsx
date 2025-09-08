import React from 'react';
import { 
  Alert, 
  AlertTitle, 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton,
  Stack
} from '@mui/material';
import { ContentCopy, OpenInNew } from '@mui/icons-material';
import { CreateUrlResponse } from '../types';
import logger from '../utils/logger';

interface SuccessDisplayProps {
  successes: CreateUrlResponse[];
  title?: string;
}

export const SuccessDisplay: React.FC<SuccessDisplayProps> = ({ 
  successes, 
  title = 'URLs Created Successfully' 
}) => {
  if (successes.length === 0) return null;

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

  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity="success" sx={{ mb: 2 }}>
        <AlertTitle>{title}</AlertTitle>
        {successes.length} URL{successes.length > 1 ? 's' : ''} created successfully
      </Alert>
      
      <Stack spacing={1}>
        {successes.map((success, index) => (
          <Card key={index} variant="outlined" sx={{ bgcolor: 'rgba(76, 175, 80, 0.04)' }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography variant="body2" sx={{ fontFamily: 'monospace', flexGrow: 1, minWidth: 0 }}>
                  {success.shortLink}
                </Typography>
                
                <Stack direction="row" spacing={0.5}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleCopyToClipboard(success.shortLink)}
                    title="Copy to clipboard"
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                  
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenUrl(success.shortLink)}
                    title="Open URL"
                  >
                    <OpenInNew fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
              
              <Typography variant="caption" color="textSecondary">
                Expires: {new Date(success.expiry).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};
