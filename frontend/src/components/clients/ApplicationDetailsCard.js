import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  AccountBalance as FundingIcon,
  Savings as ContributionIcon,
  Work as JobsIcon,
  LocationCity as RegionIcon
} from '@mui/icons-material';

const ApplicationDetailsCard = ({ applicationDetails }) => {
  if (!applicationDetails) {
    return (
      <Paper sx={{ height: '100%' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Detalii aplicație
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Nu există detalii despre aplicație.
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <Paper sx={{ height: '100%' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Detalii aplicație
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <List dense disablePadding>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <MoneyIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Valoare proiect"
              secondary={applicationDetails.projectValue ? formatCurrency(applicationDetails.projectValue) : 'N/A'}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
          
          <ListItem disableGutters sx={{ mt: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <FundingIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Finanțare solicitată"
              secondary={applicationDetails.fundingAmount ? formatCurrency(applicationDetails.fundingAmount) : 'N/A'}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
          
          <ListItem disableGutters sx={{ mt: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <ContributionIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Contribuție proprie"
              secondary={applicationDetails.ownContribution ? formatCurrency(applicationDetails.ownContribution) : 'N/A'}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
          
          <ListItem disableGutters sx={{ mt: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <JobsIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Locuri de muncă estimate"
              secondary={applicationDetails.expectedJobsCreated ?? 'N/A'}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
          
          <ListItem disableGutters sx={{ mt: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <RegionIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Regiunea"
              secondary={applicationDetails.region || 'N/A'}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
        </List>
      </Box>
    </Paper>
  );
};

export default ApplicationDetailsCard;
