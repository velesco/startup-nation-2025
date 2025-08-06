import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Tab,
  Tabs,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Badge as BadgeIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layouts/DashboardLayout';
import IDCardUpload from '../components/users/IDCardUpload';
import apiService from '../services/api';

const ProfilePage = () => {
  const { currentUser, refreshUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await apiService.users.getProfile();
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Eroare la incarcarea profilului');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileUpdate = async () => {
    // Refresh user data after ID card update
    try {
      const response = await apiService.users.getProfile();
      setUser(response.data.user);
      // Also refresh the auth context
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg">
          <Alert severity="error">{error}</Alert>
        </Container>
      </DashboardLayout>
    );
  }

  const TabPanel = ({ children, value, index }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`profile-tabpanel-${index}`}
        aria-labelledby={`profile-tab-${index}`}
      >
        {value === index && (
          <Box sx={{ py: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Profil Utilizator
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <PersonIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              </Grid>
              <Grid item xs>
                <Typography variant="h5">{user?.name}</Typography>
                <Typography variant="body1" color="text.secondary">
                  {user?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rol: {user?.role === 'partner' ? 'Partener' : user?.role === 'admin' ? 'Administrator' : user?.role}
                </Typography>
                {user?.organization && (
                  <Typography variant="body2" color="text.secondary">
                    {user.organization}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab 
                icon={<PersonIcon />} 
                label="Informatii Generale" 
                id="profile-tab-0"
                aria-controls="profile-tabpanel-0"
              />
              <Tab 
                icon={<BadgeIcon />} 
                label="Buletin Identitate" 
                id="profile-tab-1"
                aria-controls="profile-tabpanel-1"
              />
              <Tab 
                icon={<SettingsIcon />} 
                label="Setari" 
                id="profile-tab-2"
                aria-controls="profile-tabpanel-2"
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Informatii Personale
                    </Typography>
                    <Box sx={{ '& > div': { mb: 2 } }}>
                      <div>
                        <Typography variant="body2" color="text.secondary">Nume:</Typography>
                        <Typography variant="body1">{user?.name}</Typography>
                      </div>
                      <div>
                        <Typography variant="body2" color="text.secondary">Email:</Typography>
                        <Typography variant="body1">{user?.email}</Typography>
                      </div>
                      <div>
                        <Typography variant="body2" color="text.secondary">Telefon:</Typography>
                        <Typography variant="body1">{user?.phone || 'N/A'}</Typography>
                      </div>
                      <div>
                        <Typography variant="body2" color="text.secondary">Organizatia:</Typography>
                        <Typography variant="body1">{user?.organization || 'N/A'}</Typography>
                      </div>
                      <div>
                        <Typography variant="body2" color="text.secondary">Pozitia:</Typography>
                        <Typography variant="body1">{user?.position || 'N/A'}</Typography>
                      </div>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Informatii Cont
                    </Typography>
                    <Box sx={{ '& > div': { mb: 2 } }}>
                      <div>
                        <Typography variant="body2" color="text.secondary">Rol:</Typography>
                        <Typography variant="body1">
                          {user?.role === 'partner' ? 'Partener' : 
                           user?.role === 'admin' ? 'Administrator' : 
                           user?.role}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" color="text.secondary">Status:</Typography>
                        <Typography variant="body1" color={user?.isActive ? 'success.main' : 'error.main'}>
                          {user?.isActive ? 'Activ' : 'Inactiv'}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" color="text.secondary">Ultima logare:</Typography>
                        <Typography variant="body1">
                          {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ro-RO') : 'N/A'}
                        </Typography>
                      </div>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <IDCardUpload user={user} onUpdate={handleProfileUpdate} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Setari Cont
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Functionalitatile de setari vor fi disponibile in curand.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>
        </Card>
      </Container>
    </DashboardLayout>
  );
};

export default ProfilePage;