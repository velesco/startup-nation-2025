import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Event as EventIcon,
  Group as GroupIcon
} from '@mui/icons-material';

const ClientInfoCard = ({ client }) => {
  return (
    <Paper sx={{ height: '100%' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Informații client
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <List dense disablePadding>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <PersonIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Nume"
              secondary={client.name}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
          
          <ListItem disableGutters sx={{ mt: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <EmailIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Email"
              secondary={client.email}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
          
          <ListItem disableGutters sx={{ mt: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <PhoneIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Telefon"
              secondary={client.phone}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
          
          <ListItem disableGutters sx={{ mt: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <EventIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Data înregistrării"
              secondary={client.registrationDate}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
          
          <ListItem disableGutters sx={{ mt: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <GroupIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Grupă"
              secondary={client.group}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
        </List>
      </Box>
    </Paper>
  );
};

export default ClientInfoCard;
