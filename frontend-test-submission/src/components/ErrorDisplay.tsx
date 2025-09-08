import React from 'react';
import { Alert, AlertTitle, Box, List, ListItem, ListItemText } from '@mui/material';

interface ErrorDisplayProps {
  errors: string[];
  title?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  errors, 
  title = 'Errors Occurred' 
}) => {
  if (errors.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity="error">
        <AlertTitle>{title}</AlertTitle>
        {errors.length === 1 ? (
          errors[0]
        ) : (
          <List dense>
            {errors.map((error, index) => (
              <ListItem key={index} disablePadding>
                <ListItemText primary={`• ${error}`} />
              </ListItem>
            ))}
          </List>
        )}
      </Alert>
    </Box>
  );
};
