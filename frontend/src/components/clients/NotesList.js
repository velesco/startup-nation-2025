import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  StickyNote2 as NoteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format, formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

const NotesList = ({ clientId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');
  
  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, you would fetch from your API
        // const response = await axios.get(`/api/clients/${clientId}/notes`);
        // setNotes(response.data.data);
        
        // Mock data for demonstration
        setTimeout(() => {
          setNotes([
            {
              id: '1',
              content: 'Client a trimis documentele necesare pentru aplicație.',
              createdBy: {
                _id: '101',
                name: 'Admin User'
              },
              createdAt: '2025-02-15T10:30:45.123Z'
            },
            {
              id: '2',
              content: 'Am discutat la telefon detaliile proiectului. Clientul solicită o întâlnire săptămâna viitoare pentru clarificări suplimentare.',
              createdBy: {
                _id: '101',
                name: 'Admin User'
              },
              createdAt: '2025-02-16T14:20:15.123Z'
            },
            {
              id: '3',
              content: 'Planul de afaceri necesită câteva corecții în secțiunea financiară. Am trimis un email cu detaliile necesare.',
              createdBy: {
                _id: '101',
                name: 'Admin User'
              },
              createdAt: '2025-02-18T09:45:30.123Z'
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching notes:', error);
        setError('A apărut o eroare la încărcarea notelor.');
        setLoading(false);
      }
    };
    
    fetchNotes();
  }, [clientId]);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const noteDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Today
    if (noteDate.getTime() === today.getTime()) {
      return `Astăzi, ${format(date, 'HH:mm', { locale: ro })}`;
    }
    
    // Yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (noteDate.getTime() === yesterday.getTime()) {
      return `Ieri, ${format(date, 'HH:mm', { locale: ro })}`;
    }
    
    // Within the last 7 days
    if ((today - noteDate) / (1000 * 60 * 60 * 24) < 7) {
      return formatDistanceToNow(date, { addSuffix: true, locale: ro });
    }
    
    // More than 7 days ago
    return format(date, 'd MMMM yyyy, HH:mm', { locale: ro });
  };
  
  // Handle menu open
  const handleMenuOpen = (event, note) => {
    setAnchorEl(event.currentTarget);
    setSelectedNote(note);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNote(null);
  };
  
  // Handle edit note
  const handleEditNote = () => {
    setEditMode(true);
    setEditContent(selectedNote.content);
    handleMenuClose();
  };
  
  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // In a real implementation, you would call your API
      // await axios.put(`/api/notes/${selectedNote.id}`, { content: editContent });
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update notes list
      setNotes(notes.map(note => 
        note.id === selectedNote.id 
          ? { ...note, content: editContent } 
          : note
      ));
      
      setEditMode(false);
      setEditContent('');
      setSelectedNote(null);
      setSubmitting(false);
    } catch (error) {
      console.error('Error updating note:', error);
      setError('A apărut o eroare la actualizarea notei.');
      setSubmitting(false);
    }
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditContent('');
    setSelectedNote(null);
  };
  
  // Handle delete note
  const handleDeleteNote = async () => {
    try {
      // In a real implementation, you would call your API
      // await axios.delete(`/api/notes/${selectedNote.id}`);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update notes list
      setNotes(notes.filter(note => note.id !== selectedNote.id));
      
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('A apărut o eroare la ștergerea notei.');
      handleMenuClose();
    }
  };
  
  // Handle add note
  const handleAddNote = async () => {
    if (!newNote.trim()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // In a real implementation, you would call your API
      // const response = await axios.post(`/api/clients/${clientId}/notes`, { content: newNote });
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add new note to list
      const newNoteObj = {
        id: Date.now().toString(),
        content: newNote,
        createdBy: {
          _id: '101',
          name: 'Current User'
        },
        createdAt: new Date().toISOString()
      };
      
      setNotes([newNoteObj, ...notes]);
      setNewNote('');
      setSubmitting(false);
    } catch (error) {
      console.error('Error adding note:', error);
      setError('A apărut o eroare la adăugarea notei.');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Note ({notes.length})
        </Typography>
      </Box>
      
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Add note form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Adaugă o notă nouă"
          multiline
          rows={3}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          disabled={submitting}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
            onClick={handleAddNote}
            disabled={submitting || !newNote.trim()}
          >
            {submitting ? 'Se adaugă...' : 'Adaugă notă'}
          </Button>
        </Box>
      </Paper>
      
      {/* Notes list */}
      {notes.length > 0 ? (
        <Paper>
          <List>
            {notes.map((note, index) => (
              <React.Fragment key={note.id}>
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    editMode && selectedNote?.id === note.id ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          onClick={handleCancelEdit}
                          disabled={submitting}
                        >
                          Anulare
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={handleSaveEdit}
                          disabled={submitting || !editContent.trim()}
                        >
                          {submitting ? <CircularProgress size={20} color="inherit" /> : 'Salvare'}
                        </Button>
                      </Box>
                    ) : (
                      <IconButton
                        edge="end"
                        aria-label="more"
                        onClick={(e) => handleMenuOpen(e, note)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <NoteIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2">
                          {note.createdBy.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(note.createdAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      editMode && selectedNote?.id === note.id ? (
                        <TextField
                          fullWidth
                          multiline
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          variant="outlined"
                          size="small"
                          margin="dense"
                          disabled={submitting}
                          autoFocus
                        />
                      ) : (
                        <Typography
                          variant="body1"
                          color="text.primary"
                          sx={{ mt: 1 }}
                        >
                          {note.content}
                        </Typography>
                      )
                    }
                  />
                </ListItem>
                {index < notes.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      ) : (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Nu există note pentru acest client. Adaugă prima notă folosind formularul de mai sus.
          </Typography>
        </Box>
      )}
      
      {/* Note actions menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditNote}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editare
        </MenuItem>
        <MenuItem onClick={handleDeleteNote}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Ștergere
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default NotesList;
