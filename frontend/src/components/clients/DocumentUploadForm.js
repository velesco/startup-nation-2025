import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { Upload as UploadIcon, Close as CloseIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const DocumentUploadForm = ({ open, onClose, clientId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  // Document types
  const documentTypes = [
    'Plan de afaceri',
    'Act identitate',
    'Certificat înregistrare',
    'Bilanț',
    'Factură',
    'Cerere finanțare',
    'Altele'
  ];
  
  // Max file size in bytes (10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  
  // Allowed file types
  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ];
  
  // File dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      const selectedFile = acceptedFiles[0];
      
      // Check file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(`Fișierul este prea mare. Dimensiunea maximă permisă este 10MB.`);
        return;
      }
      
      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
        setError('Tipul fișierului nu este acceptat. Tipurile acceptate sunt: PDF, Word, Excel, imagini.');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      
      // Set document name if not already set
      if (!name) {
        setName(selectedFile.name.split('.')[0]);
      }
    },
    multiple: false
  });
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Get file type label
  const getFileTypeLabel = (mimeType) => {
    switch (mimeType) {
      case 'application/pdf':
        return 'PDF';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'Document Word';
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'Document Excel';
      case 'image/jpeg':
      case 'image/png':
        return 'Imagine';
      default:
        return 'Fișier';
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!file) {
      setError('Vă rugăm să selectați un fișier.');
      return;
    }
    
    if (!name) {
      setError('Vă rugăm să introduceți numele documentului.');
      return;
    }
    
    if (!type) {
      setError('Vă rugăm să selectați tipul documentului.');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      // In a real implementation, you would upload the file to your API
      // const formData = new FormData();
      // formData.append('document', file);
      // formData.append('name', name);
      // formData.append('type', type);
      // const response = await axios.post(`/api/clients/${clientId}/documents`, formData);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call success callback
      onUploadSuccess({
        id: Date.now().toString(),
        name,
        type,
        filePath: URL.createObjectURL(file),
        fileSize: file.size,
        mimeType: file.type,
        status: 'Nou',
        uploadedBy: 'Current User',
        createdAt: new Date().toISOString()
      });
      
      // Reset form
      setFile(null);
      setName('');
      setType('');
      setUploading(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('A apărut o eroare la încărcarea documentului.');
      setUploading(false);
    }
  };
  
  // Handle dialog close
  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setName('');
      setType('');
      setError(null);
      onClose();
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>Încărcare document nou</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 1 }}>
            {/* File dropzone */}
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.400',
                borderRadius: 1,
                p: 3,
                mb: 3,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isDragActive ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <input {...getInputProps()} />
              {file ? (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Fișier selectat
                  </Typography>
                  <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body1">{file.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getFileTypeLabel(file.type)} • {formatFileSize(file.size)}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </Button>
                  </Paper>
                </Box>
              ) : (
                <Box>
                  <UploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    {isDragActive ? 'Plasați fișierul aici...' : 'Trageți și plasați fișierul aici, sau'}
                  </Typography>
                  <Button variant="outlined" component="span">
                    Selectați fișierul
                  </Button>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Tipuri de fișiere acceptate: PDF, Word, Excel, imagini
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dimensiune maximă: 10MB
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Document name */}
            <TextField
              label="Nume document"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              disabled={uploading}
              required
            />
            
            {/* Document type */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="document-type-label">Tip document</InputLabel>
              <Select
                labelId="document-type-label"
                value={type}
                onChange={(e) => setType(e.target.value)}
                label="Tip document"
                disabled={uploading}
              >
                {documentTypes.map((docType) => (
                  <MenuItem key={docType} value={docType}>
                    {docType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Error message */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={uploading}>
            Anulare
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
            disabled={uploading || !file}
          >
            {uploading ? 'Se încarcă...' : 'Încarcă'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DocumentUploadForm;
