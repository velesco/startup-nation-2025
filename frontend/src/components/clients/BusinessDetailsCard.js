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
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  LocationOn as LocationOnIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

const BusinessDetailsCard = ({ businessDetails }) => {
  if (!businessDetails) {
    return (
      <Paper sx={{ height: '100%' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Detalii afacere
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Nu există detalii despre afacere.
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ height: '100%' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Detalii afacere
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <List dense disablePadding>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <BusinessIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Denumire firmă"
              secondary={businessDetails.companyName || 'N/A'}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
          
          <ListItem disableGutters sx={{ mt: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <AssignmentIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="CUI"
              secondary={businessDetails.cui || 'N/A'}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
          
          <ListItem disableGutters sx={{ mt: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <InventoryIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Număr înregistrare"
              secondary={businessDetails.registrationNumber || 'N/A'}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
          
          <ListItem disableGutters sx={{ mt: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <LocationOnIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Adresă"
              secondary={businessDetails.address || 'N/A'}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
          
          <ListItem disableGutters sx={{ mt: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CategoryIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Domeniu de activitate"
              secondary={businessDetails.activityDomain || 'N/A'}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
        </List>
      </Box>
    </Paper>
  );
};

export default BusinessDetailsCard;
