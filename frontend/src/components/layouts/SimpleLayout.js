import React from 'react';
import { AppBar, Toolbar, Typography, Box, Container, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const SimpleLayout = ({ children }) => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'white' }}>
            Startup Nation 2025
          </Typography>
        </Toolbar>
      </AppBar>
      <Container component="main">
        {children}
      </Container>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            <Link color="inherit" href="/">
              Startup Nation 2025
            </Link>{' '}
            {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
    </>
  );
};

export default SimpleLayout;
