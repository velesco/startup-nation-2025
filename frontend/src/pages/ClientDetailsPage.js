import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  FiberNew as FiberNewIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';
import DashboardLayout from '../components/layouts/DashboardLayout';
import DocumentsList from '../components/clients/DocumentsList';
import NotesList from '../components/clients/NotesList';
import ClientInfoCard from '../components/clients/ClientInfoCard';
import BusinessDetailsCard from '../components/clients/BusinessDetailsCard';
import ApplicationDetailsCard from '../components/clients/ApplicationDetailsCard';
import StatusUpdateDialog from '../components/clients/StatusUpdateDialog';

const ClientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  

  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle delete client
  const handleDeleteClient = async () => {
    try {
      setDeleteLoading(true);
      
      // In a real implementation, you would call your API
      // await axios.delete(`/api/clients/${id}`);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDeleteLoading(false);
      setOpenDeleteDialog(false);
      
      // Navigate back to clients list
      navigate('/clients', { state: { message: 'Client șters cu succes' } });
    } catch (error) {
      console.error('Error deleting client:', error);
      setDeleteLoading(false);
      setOpenDeleteDialog(false);
      setError('A apărut o eroare la ștergerea clientului.');
    }
  };
  
  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      // In a real implementation, you would call your API
      // await axios.put(`/api/clients/${id}/status`, { status: newStatus });
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update client status
      setClient({
        ...client,
        status: newStatus
      });
      
      setOpenStatusDialog(false);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('A apărut o eroare la actualizarea statusului.');
      setOpenStatusDialog(false);
    }
  };
  
  // Get status chip props
  const getStatusChip = (status) => {
    switch (status) {
      case 'Complet':
        return {
          color: 'success',
          icon: <CheckCircleIcon fontSize="small" />
        };
      case 'În progres':
        return {
          color: 'info',
          icon: <AccessTimeIcon fontSize="small" />
        };
      case 'Nou':
        return {
          color: 'warning',
          icon: <FiberNewIcon fontSize="small" />
        };
      case 'Anulat':
        return {
          color: 'error',
          icon: <CancelIcon fontSize="small" />
        };
      default:
        return {
          color: 'default',
          icon: null
        };
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/clients')}
          >
            Înapoi la lista de clienți
          </Button>
        </Container>
      </DashboardLayout>
    );
  }
  
  const { color, icon } = getStatusChip(client.status);
  
  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/clients')}
              sx={{ mr: 2 }}
            >
              Înapoi
            </Button>
            <Typography variant="h4" component="h1">
              {client.name}
            </Typography>
            <Chip
              label={client.status}
              color={color}
              icon={icon}
              sx={{ ml: 2 }}
            />
          </Box>
          <Box sx={{ display: 'flex', mt: { xs: 2, sm: 0 } }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/clients/${id}/edit`)}
              sx={{ mr: 1 }}
            >
              Editare
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setOpenStatusDialog(true)}
              sx={{ mr: 1 }}
            >
              Schimbă status
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setOpenDeleteDialog(true)}
            >
              Ștergere
            </Button>
          </Box>
        </Box>
        
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <ClientInfoCard client={client} />
          </Grid>
          <Grid item xs={12} md={4}>
            <BusinessDetailsCard businessDetails={client.businessDetails} />
          </Grid>
          <Grid item xs={12} md={4}>
            <ApplicationDetailsCard applicationDetails={client.applicationDetails} />
          </Grid>
        </Grid>
        
        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Documente" id="tab-0" />
            <Tab label="Note" id="tab-1" />
            <Tab label="Istoric" id="tab-2" />
          </Tabs>
          <Divider />
          
          {/* Tab Panels */}
          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <DocumentsList clientId={id} />
            )}
            {tabValue === 1 && (
              <NotesList clientId={id} />
            )}
            {tabValue === 2 && (
              <Typography variant="body1">
                Istoricul modificărilor va fi disponibil în curând.
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmare ștergere client
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Sunteți sigur că doriți să ștergeți clientul <strong>{client.name}</strong>? 
            Această acțiune nu poate fi anulată și toate datele asociate clientului vor fi șterse.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={deleteLoading}>
            Anulare
          </Button>
          <Button 
            onClick={handleDeleteClient} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Ștergere'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Status Update Dialog */}
      <StatusUpdateDialog
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
        currentStatus={client.status}
        onUpdateStatus={handleStatusUpdate}
      />
    </DashboardLayout>
  );
};

export default ClientDetailsPage;
