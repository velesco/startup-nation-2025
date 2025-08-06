import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  LinearProgress,
  Alert,
  Divider,
  Grid,
  Chip,
  Paper
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  AutoFixHigh as ExtractIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import apiService from '../../services/api';

const IDCardUpload = ({ user, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [extractError, setExtractError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    
    try {
      const formData = new FormData();
      formData.append('idCard', file);
      
      const response = await apiService.users.uploadIDCard(formData);
      
      setUploadedFile({
        name: response.data.originalName,
        size: response.data.size,
        path: response.data.path
      });
      setUploadSuccess('Buletinul a fost incarcat cu succes!');
      
      if (onUpdate) {
        onUpdate();
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.response?.data?.message || 'Eroare la incarcarea buletinului');
    } finally {
      setUploading(false);
    }
  }, [onUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleExtractData = async () => {
    setExtracting(true);
    setExtractError(null);
    setExtractedData(null);
    
    try {
      const response = await apiService.users.extractIDCardData();
      setExtractedData(response.data.extractedData);
      
      if (onUpdate) {
        onUpdate();
      }
      
    } catch (error) {
      console.error('Extraction error:', error);
      setExtractError(error.response?.data?.message || 'Eroare la extragerea datelor din buletin');
    } finally {
      setExtracting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('ro-RO');
    } catch {
      return dateString;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasIDCardImage = user?.idCard?.imagePath || uploadedFile;
  const isVerified = user?.idCard?.verified;
  const hasExtractedData = user?.idCard?.CNP || extractedData;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Incarcare Buletin de Identitate
        </Typography>
        
        {/* Upload Area */}
        <Box sx={{ mb: 3 }}>
          <Paper
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
          >
            <input {...getInputProps()} />
            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              {isDragActive
                ? 'Elibereaza fisierul aici...'
                : 'Trage si lasa buletinul aici sau click pentru a selecta'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Formate acceptate: JPG, PNG, GIF, WebP (max. 10MB)
            </Typography>
          </Paper>
        </Box>

        {/* Upload Progress */}
        {uploading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Incarcare in curs...
            </Typography>
          </Box>
        )}

        {/* Upload Success */}
        {uploadSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} icon={<SuccessIcon />}>
            {uploadSuccess}
          </Alert>
        )}

        {/* Upload Error */}
        {uploadError && (
          <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorIcon />}>
            {uploadError}
          </Alert>
        )}

        {/* Uploaded File Info */}
        {(uploadedFile || user?.idCard?.imagePath) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Fisier incarcat:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip
                icon={<SuccessIcon />}
                label={uploadedFile ? uploadedFile.name : 'Buletin.jpg'}
                color="success"
                size="small"
              />
              {uploadedFile && (
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(uploadedFile.size)}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Extract Data Section */}
        {hasIDCardImage && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Extragere Date OCR
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<ExtractIcon />}
                onClick={handleExtractData}
                disabled={extracting}
                fullWidth
              >
                {extracting ? 'Extragere in curs...' : 'Extrage date din buletin'}
              </Button>
            </Box>

            {/* Extraction Progress */}
            {extracting && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Se analizeaza imaginea cu OpenAI...
                </Typography>
              </Box>
            )}

            {/* Extraction Error */}
            {extractError && (
              <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorIcon />}>
                {extractError}
              </Alert>
            )}

            {/* Extracted Data Display */}
            {(hasExtractedData || extractedData) && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Date Extrase:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">CNP:</Typography>
                    <Typography variant="body1">
                      {extractedData?.CNP || user?.idCard?.CNP || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Nume Complet:</Typography>
                    <Typography variant="body1">
                      {extractedData?.fullName || user?.idCard?.fullName || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Adresa:</Typography>
                    <Typography variant="body1">
                      {extractedData?.address || user?.idCard?.address || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Serie:</Typography>
                    <Typography variant="body1">
                      {extractedData?.series || user?.idCard?.series || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Numar:</Typography>
                    <Typography variant="body1">
                      {extractedData?.number || user?.idCard?.number || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Emis de:</Typography>
                    <Typography variant="body1">
                      {extractedData?.issuedBy || user?.idCard?.issuedBy || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">Data nasterii:</Typography>
                    <Typography variant="body1">
                      {formatDate(extractedData?.birthDate || user?.idCard?.birthDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">Data eliberarii:</Typography>
                    <Typography variant="body1">
                      {formatDate(extractedData?.issueDate || user?.idCard?.issueDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">Data expirarii:</Typography>
                    <Typography variant="body1">
                      {formatDate(extractedData?.expiryDate || user?.idCard?.expiryDate)}
                    </Typography>
                  </Grid>
                </Grid>
                
                {/* Verification Status */}
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={isVerified ? <SuccessIcon /> : <ErrorIcon />}
                    label={isVerified ? 'Verificat' : 'Neverificat'}
                    color={isVerified ? 'success' : 'warning'}
                    size="small"
                  />
                  {user?.idCard?.extractedAt && (
                    <Typography variant="body2" color="text.secondary">
                      Ultima extragere: {formatDate(user.idCard.extractedAt)}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IDCardUpload;