import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import axios from 'axios';
import DocumentUploadForm from './DocumentUploadForm';

const DocumentsList = ({ clientId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, you would fetch from your API
        // const response = await axios.get(`/api/clients/${clientId}/documents`);
        // setDocuments(response.data.data);
        
        // Mock data for demonstration
        setTimeout(() => {
          setDocuments([
            {
              id: '1',
              name: 'Plan de afaceri',
              type: 'Plan de afaceri',
              filePath: '/documents/plan_afaceri.pdf',
              fileSize: 1245678,
              mimeType: 'application/pdf',
              status: 'Aprobat',
              uploadedBy: 'Admin User',
              createdAt: '2025-02-15T10:30:45.123Z'
            },
            {
              id: '2',
              name: 'Act identitate',
              type: 'Act identitate',
              filePath: '/documents/id_card.pdf',
              fileSize: 567890,
              mimeType: 'application/pdf',
              status: 'Nou',
              uploadedBy: 'Admin User',
              createdAt: '2025-02-16T14:20:15.123Z'
            },
            {
              id: '3',
              name: 'Certificat înregistrare',
              type: 'Certificat înregistrare',
              filePath: '/documents/certificat.pdf',
              fileSize: 789012,
              mimeType: 'application/pdf',
              status: 'Respins',
              uploadedBy: 'Admin User',
              createdAt: '2025-02-18T09:45:30.123Z'
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setError('A apărut o eroare la încărcarea documentelor.');
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [clientId, uploadSuccess]);
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status chip props
  const getStatusChip = (status) => {
    switch (status) {
      case 'Aprobat':
        return {
          color: 'success',
          icon: <CheckCircleIcon fontSize="small" />
        };
      case 'Respins':
        return {
          color: 'error',
          icon: <CancelIcon fontSize="small" />
        };
      case 'Verificat':
        return {
          color: 'info',
          icon: <CheckCircleIcon fontSize="small" />
        };
      case 'Nou':
      default:
        return {
          color: 'default',
          icon: <PendingIcon fontSize="small" />
        };
    }
  };
  
  // Handle upload document
  const handleUploadSuccess = (document) => {
    setOpenUploadDialog(false);
    setUploadSuccess(true);
    
    // Reset upload success after 3 seconds
    setTimeout(() => {
      setUploadSuccess(false);
    }, 3000);
  };
  
  // Handle view document
  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setOpenViewDialog(true);
  };
  
  // Handle delete document
  const handleDeleteDocument = async (documentId) => {
    try {
      // In a real implementation, you would call your API
      // await axios.delete(`/api/documents/${documentId}`);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update documents list
      setDocuments(documents.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('A apărut o eroare la ștergerea documentului.');
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
          Documente ({documents.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenUploadDialog(true)}
        >
          Încarcă document
        </Button>
      </Box>
      
      {/* Success alert */}
      {uploadSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Document încărcat cu succes!
        </Alert>
      )}
      
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Documents table */}
      {documents.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nume</TableCell>
                <TableCell>Tip</TableCell>
                <TableCell>Dimensiune</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data încărcării</TableCell>
                <TableCell align="right">Acțiuni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((document) => {
                const { color, icon } = getStatusChip(document.status);
                
                return (
                  <TableRow key={document.id}>
                    <TableCell>{document.name}</TableCell>
                    <TableCell>{document.type}</TableCell>
                    <TableCell>{formatFileSize(document.fileSize)}</TableCell>
                    <TableCell>
                      <Chip
                        label={document.status}
                        color={color}
                        icon={icon}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(document.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Vizualizare">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDocument(document)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Descărcare">
                        <IconButton size="small">
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ștergere">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteDocument(document.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Nu există documente pentru acest client.
          </Typography>
        </Box>
      )}
      
      {/* Upload Dialog */}
      <DocumentUploadForm
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        clientId={clientId}
        onUploadSuccess={handleUploadSuccess}
      />
      
      {/* View Document Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedDocument?.name}
        </DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box sx={{ height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="body1">
                Previzualizarea documentului nu este disponibilă în acest demo.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>
            Închide
          </Button>
          <Button variant="contained">
            Descarcă
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentsList;
