import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 10,
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: { xs: '6rem', md: '10rem' }, fontWeight: 'bold', color: 'primary.main' }}>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Pagina nu a fost găsită
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 480, mb: 4 }}>
          Ne pare rău, pagina pe care încerci să o accesezi nu există sau a fost mutată.
          Verifică adresa URL sau întoarce-te la pagina principală.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            size="large"
          >
            Pagina principală
          </Button>
          <Button
            component={RouterLink}
            to="/dashboard"
            variant="outlined"
            size="large"
          >
            Dashboard
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
