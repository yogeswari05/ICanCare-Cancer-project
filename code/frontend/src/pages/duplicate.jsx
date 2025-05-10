import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Paper
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar.jsx';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';

const CasePage = () => {
    const { caseId } = useParams();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDocumentDialog, setOpenDocumentDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [uploadLoading, setUploadLoading] = useState(false);
    
    const [uploadError, setUploadError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCaseDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/case/${caseId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setCaseData(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCaseDetails();
    }, [caseId]);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/documents/${caseId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setDocuments(response.data);
            } catch (err) {
                console.error("Error fetching documents:", err);
            }
        };

        if (!loading && caseId) {
            fetchDocuments();
        }
    }, [caseId, loading]);

    const handleAddDoctor = () => {
        localStorage.setItem('pendingCaseId', caseId);
        navigate('/doctors');
    };

    const handleOpenDocumentDialog = () => {
        setOpenDocumentDialog(true);
        setUploadError(null);
    };

    const handleCloseDocumentDialog = () => {
        setOpenDocumentDialog(false);
        setSelectedFile(null);
        setUploadError(null);
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUploadDocument = async () => {
        if (!selectedFile) return;
    
        setUploadLoading(true);
        setUploadError(null);
    
        const formData = new FormData();
        formData.append('document', selectedFile);
        formData.append('caseId', caseId);
    
        try {
            console.log('Uploading document:', selectedFile.name);
            const response = await axios.post('http://localhost:5000/api/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('Upload successful:', response.data);
            setDocuments([...documents, response.data]);
            handleCloseDocumentDialog();
        } catch (err) {
            console.error('Upload error:', err);
            setUploadError(err.response?.data?.message || err.message);
        } finally {
            setUploadLoading(false);
        }
    };
    
    const handleDownloadDocument = async (documentId, filename) => {
        try {
            console.log('Downloading document:', documentId);
            const response = await axios({
                url: `http://localhost:5000/api/documents/download/${documentId}`,
                method: 'GET',
                responseType: 'blob',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading document:', error);
        }
    };

    if (loading) {
        return (
            <>
                <NavBar />
                <Container sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Container>
            </>
        );
    }

    if (error) {
        return (
            <>
                <NavBar />
                <Container sx={{ mt: 10 }}>
                    <Alert severity="error">Error loading case details: {error}</Alert>
                </Container>
            </>
        );
    }

    return (
        <>
            <NavBar />
            <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
                <Box display="flex" flexDirection="column" gap={3}>
                    {/* Header Section */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h4" component="h1">
                            Case Details
                        </Typography>
                        <Box display="flex" gap={2}>
                            {/* Show Add Doctor button only for patients and primary doctors */}
                            {((user?.role === 'patient') || 
                               (user?.role === 'doctor' && isPrimaryDoctor && !loadingStatus)) && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleAddDoctor}
                            >
                                Add Doctor
                            </Button>)}
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => navigate(`/case/${caseId}/chat`)}
                            >
                                Open Chat
                            </Button>
                            <Button
                                variant="contained"
                                color="info"
                                startIcon={<FileUploadIcon />}
                                onClick={handleOpenDocumentDialog}
                            >
                                Add Document
                            </Button>
                        </Box>
                    </Box>

                    {/* Case Information */}
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Card elevation={3}>
                                <CardContent>
                                    <Box display="flex" flexDirection="column" gap={2}>
                                        {/* Basic Case Info */}
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Case ID: {caseId.slice(-6)}
                                            </Typography>
                                            <Typography color="text.secondary">
                                                Created: {new Date(caseData?.createdAt).toLocaleDateString()}
                                            </Typography>
                                            <Typography color="text.secondary">
                                                Last Updated: {new Date(caseData?.updatedAt).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        {/* Primary Doctor Section */}
                                        <Box mt={3}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="h6" gutterBottom>
                                                    Primary Doctor
                                                </Typography>
                                                {user?.role === 'patient' && approvedDoctors.length > 0 && (
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        size="small"
                                                        onClick={handleOpenChangePrimaryDialog}
                                                    >
                                                        Change
                                                    </Button>
                                                )}
                                            </Box>
                                            {!caseData?.primaryDoctorId ? (
                                                <Alert severity="info">
                                                    No primary doctor assigned yet
                                                </Alert>
                                            ) : (
                                                <Card variant="outlined">
                                                    <CardContent>
                                                        <Typography variant="subtitle1" gutterBottom>
                                                            {caseData?.primaryDoctorId.name}
                                                        </Typography>
                                                        <Typography color="text.secondary">
                                                            Specialization: {caseData?.primaryDoctorId.specialization}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </Box>

                                        {/* Doctors Section */}
                                        <Box mt={3}>
                                            
                                            <Typography variant="h6" gutterBottom>
                                                Assigned Doctors
                                            </Typography>
                                            {caseData?.doctors.length === 0 ? (
                                                <Alert severity="info">
                                                    No doctors assigned to this case yet
                                                </Alert>
                                            ) : (
                                                <Grid container spacing={2}>
                                                    {caseData?.doctors.map((doctor) => (
                                                        <Grid item xs={12} sm={6} md={4} key={doctor.doctorId._id}>
                                                             <Card variant="outlined" sx={{
                                                                border: caseData?.primaryDoctorId?._id === doctor.doctorId._id ? 
                                                                    '2px solid #1976d2' : 'none'
                                                            }}>
                                                                <CardContent>
                                                                    <Typography variant="subtitle1" gutterBottom>
                                                                        {doctor.doctorId.name}
                                                                        {caseData?.primaryDoctorId?._id === doctor.doctorId._id && (
                                                                            <Typography component="span" color="primary" ml={1}>
                                                                                (Primary)
                                                                            </Typography>
                                                                        )}
                                                                    </Typography>
                                                                    <Typography color="text.secondary" gutterBottom>
                                                                        Specialization: {doctor.doctorId.specialization}
                                                                    </Typography>
                                                                    <Typography
                                                                        color={
                                                                            doctor.status === 'approved' ? 'success.main' :
                                                                                doctor.status === 'rejected' ? 'error.main' :
                                                                                    'warning.main'
                                                                        }
                                                                    >
                                                                        Status: {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
                                                                    </Typography>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            )}
                                        </Box>

                                        {/* Documents Section */}
                                        <Box mt={3}>
                                            <Typography variant="h6" gutterBottom>
                                                Documents
                                            </Typography>
                                            {documents.length === 0 ? (
                                                <Alert severity="info">
                                                    No documents uploaded for this case yet
                                                </Alert>
                                            ) : (
                                                <List>
                                                    {documents.map((doc) => (
                                                        <ListItem key={doc._id} component={Paper} sx={{ mb: 2 }}>
                                                            <ListItemIcon>
                                                                <InsertDriveFileIcon />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={doc.filename}
                                                                secondary={`Uploaded on: ${new Date(doc.createdAt).toLocaleDateString()}`}
                                                            />
                                                            <IconButton
                                                                edge="end"
                                                                color="primary"
                                                                onClick={() => handleDownloadDocument(doc._id, doc.filename)}
                                                            >
                                                                <DownloadIcon />
                                                            </IconButton>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            )}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Container>

            {/* Document Upload Dialog */}
            <Dialog open={openDocumentDialog} onClose={handleCloseDocumentDialog}>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogContent>
                    <input type="file" onChange={handleFileChange} />
                    {uploadError && <Alert severity="error">{uploadError}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDocumentDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUploadDocument}
                        color="primary"
                        disabled={uploadLoading}
                    >
                        {uploadLoading ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CasePage;