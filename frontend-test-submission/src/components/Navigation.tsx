import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Container,
  Stack
} from '@mui/material';
import {
  Link as LinkIcon,
  Analytics,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import logger from '../utils/logger';

export const Navigation: React.FC = () => {
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleNavigation = (path: string, label: string) => {
    navigate(path);
    handleMobileMenuClose();
    logger.info('frontend', 'component', `Navigated to ${label} page`);
  };

  const navigationItems = [
    { path: '/', label: 'URL Shortener', icon: <LinkIcon /> },
    { path: '/statistics', label: 'Statistics', icon: <Analytics /> }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="sticky" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar>
          {/* Logo/Brand */}
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <LinkIcon sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{ 
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              onClick={() => handleNavigation('/', 'Home')}
            >
              URL Shortener
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Stack direction="row" alignItems="center" spacing={1}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path, item.label)}
                  sx={{
                    mx: 1,
                    fontWeight: isActive(item.path) ? 'bold' : 'normal',
                    backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={handleMobileMenuOpen}
              edge="end"
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {navigationItems.map((item) => (
              <MenuItem
                key={item.path}
                onClick={() => handleNavigation(item.path, item.label)}
                selected={isActive(item.path)}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  {item.icon}
                  <Typography>{item.label}</Typography>
                </Stack>
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
