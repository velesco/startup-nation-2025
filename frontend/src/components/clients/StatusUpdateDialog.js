import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  FiberNew as FiberNewIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const StatusUpdateDialog = ({ open, onClose, currentStatus, onUpdateStatus }) => {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Handle status change
  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (status === currentStatus) {
      onClose();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Call parent's update function
      await onUpdateStatus(status);
      
      setLoading(false);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('A apărut o eroare la actualizarea statusului.');
      setLoading(false);
    }
  };
  
  // Get icon based on status
  const getStatusIcon = (statusValue) => {
    switch (statusValue) {
      case 'Complet':
        return <CheckCircleIcon color="success" />;
      case 'În progres':
        return <AccessTimeIcon color="info" />;
      case 'Nou':
        return <FiberNewIcon color="warning" />;
      case 'Anulat':
        return <CancelIcon color="error" />;
      default:
        return null;
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Actualizare status client</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Status curent:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getStatusIcon(currentStatus)}
            <Typography variant="body1" sx={{ ml: 1 }}>
              {currentStatus}
            </Typography>
          </Box>
        </Box>
        
        <FormControl component="fieldset">
          <FormLabel component="legend">Selectează noul status:</FormLabel>
          <RadioGroup
            aria-label="status"
            name="status"
            value={status}
            onChange={handleStatusChange}
          >
            <FormControlLabel 
              value="Nou" 
              control={<Radio />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FiberNewIcon color="warning" sx={{ mr: 1 }} />
                  <Typography>Nou</Typography>
                </Box>
              } 
            />
            <FormControlLabel 
              value="În progres" 
              control={<Radio />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon color="info" sx={{ mr: 1 }} />
                  <Typography>În progres</Typography>
                </Box>
              } 
            />
            <FormControlLabel 
              value="Complet" 
              control={<Radio />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Typography>Complet</Typography>
                </Box>
              } 
            />
            <FormControlLabel 
              value="Anulat" 
              control={<Radio />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CancelIcon color="error" sx={{ mr: 1 }} />
                  <Typography>Anulat</Typography>
                </Box>
              } 
            />
          </RadioGroup>
        </FormControl>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Anulare
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || status === currentStatus}
        >
          {loading ? <CircularProgress size={24} /> : 'Actualizare status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusUpdateDialog;
