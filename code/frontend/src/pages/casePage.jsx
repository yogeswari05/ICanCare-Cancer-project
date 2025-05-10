import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container, Typography, Box, Button, Card, CardContent, Grid,
    CircularProgress, Alert, Dialog, DialogActions, DialogContent,
    DialogTitle, List, ListItem, ListItemIcon, ListItemText, IconButton,
    Paper, Menu, MenuItem, TextField, Divider, Chip, Tabs, Tab, Rating,
    DialogContentText, Avatar, useTheme, Tooltip, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import axios from 'axios';
import Layout from '../components/NavBar.jsx';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChatIcon from '@mui/icons-material/Chat';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SummarizeIcon from '@mui/icons-material/Summarize';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

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
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [isPrimaryDoctor, setIsPrimaryDoctor] = useState(false);
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
    const [openMeetingDialog, setOpenMeetingDialog] = useState(false);
    const [meetingDetails, setMeetingDetails] = useState({
        summary: '', description: '', startTime: '', endTime: '',
    });
    const [validationError, setValidationError] = useState('');
    const [meetingLoading, setMeetingLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
    const [selectedDoctorForFeedback, setSelectedDoctorForFeedback] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [feedbackGiven, setFeedbackGiven] = useState({});
    const [openChatSelectionDialog, setOpenChatSelectionDialog] = useState(false);
    const [openSummaryDialog, setOpenSummaryDialog] = useState(false);
    const [currentSummary, setCurrentSummary] = useState({
        documentId: null, filename: '', summary: '', loading: false, error: null
    });
    const [lymphLogs, setLymphLogs] = useState([]);
    const [lymphSize, setLymphSize] = useState('');
    const [lymphDate, setLymphDate] = useState('');
    const [lymphError, setLymphError] = useState('');

    const [p2Logs, setp2Logs] = useState([]);
    const [p2Size, setp2Size] = useState('');
    const [p2Date, setp2Date] = useState('');
    const [p2Error, setp2Error] = useState('');



    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        const fetchCaseDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/case/${caseId}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                setCaseData(response.data);
                setLymphLogs(response.data.lymphLogs || []);
            } catch (err) {
                console.error("Error fetching case details:", err);
                setError(err.response?.data?.message || err.message || "Failed to load case details.");
            } finally {
                setLoading(false);
            }
        };
        fetchCaseDetails();
    }, [caseId]);

    useEffect(() => {
        const fetchCaseDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/case/${caseId}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                setCaseData(response.data);
                setp2Logs(response.data.p2Logs || []);
            } catch (err) {
                console.error("Error fetching case details:", err);
                setError(err.response?.data?.message || err.message || "Failed to load case details.");
            } finally {
                setLoading(false);
            }
        };
        fetchCaseDetails();
    }, [caseId]);


    useEffect(() => {
        const fetchDocuments = async () => {
            if (!loading && caseId && !error) {
                try {
                    const response = await axios.get(
                        `http://localhost:5000/api/documents/${caseId}`,
                        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                    );
                    setDocuments(response.data);
                } catch (err) {
                    console.error("Error fetching documents:", err);
                    toast.error("Could not load documents.");
                }
            }
        };
        fetchDocuments();
    }, [caseId, loading, error]);

    useEffect(() => {
        const checkPrimaryDoctor = async () => {
            if (!loading && caseId && !error) {
                try {
                    const response = await axios.get(
                        `http://localhost:5000/api/case/${caseId}/is-primary-doctor`,
                        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                    );
                    setIsPrimaryDoctor(response.data.isPrimaryDoctor);
                } catch (err) {
                    console.error("Error checking primary doctor status:", err);
                }
            }
        };
        checkPrimaryDoctor();
    }, [caseId, loading, error]);

    useEffect(() => {
        const fetchFeedbackStatus = async () => {
            if (!loading && caseId && !error) {
                try {
                    const response = await axios.get(
                        `http://localhost:5000/api/case/${caseId}/feedback-status`,
                        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                    );
                    setFeedbackGiven(response.data);
                } catch (err) {
                    console.error("Error fetching feedback status:", err);
                }
            }
        };
        fetchFeedbackStatus();
    }, [caseId, loading, error]);

    useEffect(() => {
        // Fetch lymph logs from backend
        const fetchLymphLogs = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/case/${caseId}/lymph-logs`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                setLymphLogs(response.data);
            } catch (err) {
                setLymphLogs([]);
            }
        };
        if (caseId) fetchLymphLogs();
    }, [caseId]);

    useEffect(() => {
        // Fetch p2 logs from backend
        const fetchp2Logs = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/case/${caseId}/p2-logs`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                setp2Logs(response.data);
            } catch (err) {
                setp2Logs([]);
            }
        };
        if (caseId) fetchp2Logs();
    }, [caseId]);

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
            const response = await axios.post(
                'http://localhost:5000/api/documents/upload',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setDocuments([...documents, response.data]);
            handleCloseDocumentDialog();
            toast.success('Document uploaded successfully');
        } catch (err) {
            setUploadError(err.response?.data?.message || err.message);
        } finally {
            setUploadLoading(false);
        }
    };
    const handleDownloadDocument = async (documentId, filename) => {
        try {
            toast.info('Preparing download...');
            const response = await axios({
                url: `http://localhost:5000/api/documents/download/${documentId}`,
                method: 'GET',
                responseType: 'blob',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Download started');
        } catch (error) {
            console.error('Error downloading document:', error);
            toast.error('Download failed');
        }
    };
    const handleMenuOpen = (event, doctorId) => {
        setAnchorEl(event.currentTarget);
        setSelectedDoctorId(doctorId);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedDoctorId(null);
    };
    const handleUpdatePrimaryDoctor = async () => {
        try {
            const response = await axios.put(
                'http://localhost:5000/api/case/updatePrimaryDoctor',
                { caseId, doctorId: selectedDoctorId },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setCaseData(response.data.caseData);
            handleMenuClose();
            toast.success('Primary doctor updated successfully');
        } catch (error) {
            console.error('Failed to update primary doctor', error);
            toast.error('Failed to update primary doctor');
        }
    };
    const handleCreateMeeting = async () => {
        if (!meetingDetails.summary || !meetingDetails.description || !meetingDetails.startTime || !meetingDetails.endTime) {
            setValidationError('All fields are required.');
            return;
        }
        setMeetingLoading(true);
        setValidationError('');
        try {
            await axios.post(
                `http://localhost:5000/api/case/${caseId}/create-meeting`,
                meetingDetails,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setOpenMeetingDialog(false);
            toast.success('Meeting created successfully');
            setTimeout(() => { toast.success('Meeting link sent in the chat'); }, 1000);
        } catch (error) {
            console.error('Error creating meeting:', error);
            toast.error('Failed to create meeting');
        } finally {
            setMeetingLoading(false);
        }
    };
    const handleTabChange = (event, newValue) => { setTabValue(newValue); };
    const handleOpenFeedbackDialog = (doctor) => {
        setSelectedDoctorForFeedback(doctor);
        setFeedbackDialogOpen(true);
    };
    const handleCloseFeedbackDialog = () => {
        setFeedbackDialogOpen(false);
        setSelectedDoctorForFeedback(null);
        setRating(0);
        setComment('');
    };
    const handleSubmitFeedback = async () => {
        try {
            await axios.post(
                `http://localhost:5000/api/case/${caseId}/feedback`,
                { doctorId: selectedDoctorForFeedback._id, rating, comment },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            toast.success('Feedback submitted successfully');
            setFeedbackGiven({ ...feedbackGiven, [selectedDoctorForFeedback._id]: true });
            handleCloseFeedbackDialog();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error('Failed to submit feedback');
        }
    };
    const navigateToGeneralChat = () => { navigate(`/case/${caseId}/chat`); };
    const navigateToDoctorsChat = () => { navigate(`/case/${caseId}/doctors-chat`); };
    const handleChatButtonClick = () => {
        if (userRole === 'patient') {
            navigateToGeneralChat();
        } else {
            setOpenChatSelectionDialog(true);
        }
    };
    const handleCloseChatSelectionDialog = () => { setOpenChatSelectionDialog(false); };
    const handleGetSummary = async (documentId, filename) => {
        setCurrentSummary({ documentId, filename, summary: '', loading: true, error: null });
        setOpenSummaryDialog(true);
        try {
            const response = await axios.get(
                `http://localhost:5000/api/documents/summary/${documentId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setCurrentSummary(prev => ({ ...prev, summary: response.data.summary, loading: false }));
        } catch (error) {
            console.error('Error getting document summary:', error);
            setCurrentSummary(prev => ({
                ...prev,
                error: error.response?.data?.error || 'Failed to generate summary',
                loading: false
            }));
        }
    };
    const handleCloseSummaryDialog = () => { setOpenSummaryDialog(false); };
    const getPatientInfo = (field) => {
        if (!caseData || !caseData.patientId) return 'N/A';
        return caseData.patientId[field] || 'N/A';
    };

    const handleAddLymphLog = async () => {
        if (!lymphSize || !lymphDate) {
            setLymphError('Please enter both size and date.');
            return;
        }
        if (isNaN(Number(lymphSize))) {
            setLymphError('Lymph size must be a number.');
            return;
        }
        try {
            const response = await axios.post(
                `http://localhost:5000/api/case/${caseId}/lymph-log`,
                { size: Number(lymphSize), date: lymphDate },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setLymphLogs(response.data.lymphLogs);
            setLymphSize('');
            setLymphDate('');
            setLymphError('');
        } catch (err) {
            setLymphError(err.response?.data?.message || 'Failed to add log');
        }
    };


    const handleAddp2Log = async () => {
        if (!p2Size || !p2Date) {
            setp2Error('Please enter both size and date.');
            return;
        }
        if (isNaN(Number(p2Size))) {
            setp2Error('p2 size must be a number.');
            return;
        }
        try {
            const response = await axios.post(
                `http://localhost:5000/api/case/${caseId}/p2-log`,
                { size: Number(p2Size), date: p2Date },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setp2Logs(response.data.p2Logs);
            setp2Size('');
            setp2Date('');
            setp2Error('');
        } catch (err) {
            setp2Error(err.response?.data?.message || 'Failed to add log');
        }
    };

    if (loading) {
        return (
            <Layout>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 'calc(100vh - 150px)',
                        textAlign: 'center'
                    }}
                >
                    <CircularProgress size={60} sx={{ mb: 3 }} />
                    <Typography variant="h6" color="text.secondary">
                        Loading Case Details...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Please wait while we fetch the information.
                    </Typography>
                </Box>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            textAlign: 'center',
                            bgcolor: 'error.lighter',
                            border: `1px solid ${theme.palette.error.light}`
                        }}
                    >
                        <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 2 }}>!</Avatar>
                        <Typography variant="h5" fontWeight="bold" color="error.dark" gutterBottom>
                            Error Loading Case
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            We encountered a problem loading the details for this case.
                        </Typography>
                        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                            {error}
                        </Alert>
                        <Box>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/dashboard')}
                                sx={{ mr: 2 }}
                            >
                                Back to Dashboard
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => window.location.reload()}
                            >
                                Try Again
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            </Layout>
        );
    }

    return (
        <>
            <Layout>
                <Container maxWidth="lg" sx={{ mb: 6 }}>
                    {/* --- Hero Section --- */}
                    <Paper
                        elevation={3}
                        sx={{
                            p: { xs: 3, md: 4 },
                            mb: 4,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Decorative elements */}
                        <Box sx={{ position: 'absolute', top: -30, right: -20, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                        <Box sx={{ position: 'absolute', bottom: -40, left: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

                        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}>
                            {/* Left Side: Title and Info */}
                            <Box sx={{ mb: { xs: 3, md: 0 } }}>
                                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                                    {getPatientInfo('name')}
                                </Typography>
                                <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
                                    <Chip
                                        icon={<CalendarTodayIcon />}
                                        label={`Created: ${caseData?.createdAt ? new Date(caseData.createdAt).toLocaleDateString() : 'N/A'}`}
                                        variant="outlined"
                                        size="small"
                                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '& .MuiChip-icon': { color: 'white' } }}
                                    />
                                    <Chip
                                        icon={<AccessTimeIcon />}
                                        label={`Updated: ${caseData?.updatedAt ? new Date(caseData.updatedAt).toLocaleDateString() : 'N/A'}`}
                                        variant="outlined"
                                        size="small"
                                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '& .MuiChip-icon': { color: 'white' } }}
                                    />
                                </Box>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                    Case management and patient care details.
                                </Typography>
                            </Box>

                            {/* Right Side: Action Buttons */}
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, alignItems: { xs: 'center', md: 'flex-end' }, gap: 1.5, width: { xs: '100%', md: 'auto' } }}>
                                {(isPrimaryDoctor || userRole === 'patient') && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<PersonAddIcon />}
                                        onClick={handleAddDoctor}
                                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.7)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                                    >
                                        Add Doctor
                                    </Button>
                                )}
                                <Button
                                    variant="outlined"
                                    startIcon={<ChatIcon />}
                                    onClick={handleChatButtonClick}
                                    sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.7)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                                >
                                    Chat
                                </Button>
                                {isPrimaryDoctor && (
                                    <Button
                                        variant="contained"
                                        startIcon={<VideoCallIcon />}
                                        onClick={() => setOpenMeetingDialog(true)}
                                        sx={{ bgcolor: 'white', color: theme.palette.primary.main, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                                    >
                                        Schedule Meeting
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Paper>

                    {/* --- Patient Information Card --- */}
                    <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, mb: 4, borderRadius: 3 }}>
                        <Box display="flex" alignItems="center" mb={2.5}>
                            <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 1.5 }}>
                                <PersonIcon />
                            </Avatar>
                            <Typography variant="h6" fontWeight="bold">
                                Patient Information
                            </Typography>
                        </Box>
                        {/* Using Grid here is reasonable for responsive columns */}
                        <Grid container spacing={{ xs: 2, md: 3 }}>
                            <Grid item xs={6} sm={3}>
                                <Box>
                                    <Typography variant="overline" color="text.secondary">Name</Typography>
                                    <Typography variant="body1">{getPatientInfo('name')}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box>
                                    <Typography variant="overline" color="text.secondary">Age</Typography>
                                    <Typography variant="body1">{getPatientInfo('age')}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box>
                                    <Typography variant="overline" color="text.secondary">Gender</Typography>
                                    <Typography variant="body1">{getPatientInfo('gender')}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box>
                                    <Typography variant="overline" color="text.secondary">Contact</Typography>
                                    <Typography variant="body1">{getPatientInfo('contact')}</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>


                    {/* --- Tabs Section --- */}
                    <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            textColor="primary"
                            indicatorColor="primary"
                            variant="fullWidth"
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                bgcolor: theme.palette.background.paper
                            }}
                        >
                            <Tab
                                icon={<LocalHospitalIcon />}
                                iconPosition="start"
                                label="Assigned Doctors"
                                sx={{ py: 1.5, fontWeight: 'medium' }}
                            />
                            <Tab
                                icon={<DescriptionIcon />}
                                iconPosition="start"
                                label="Documents"
                                sx={{ py: 1.5, fontWeight: 'medium' }}
                            />
                        </Tabs>

                        {/* --- Tab Content: Doctors --- */}
                        {tabValue === 0 && (
                            <Box sx={{ p: { xs: 2, md: 3 } }}>
                                {!caseData.doctors || caseData.doctors.length === 0 ? (
                                    <Box sx={{ p: 4, borderRadius: 2, bgcolor: theme.palette.grey[50], textAlign: 'center' }}>
                                        <LocalHospitalIcon sx={{ fontSize: 50, color: theme.palette.grey[400], mb: 1 }} />
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            No Doctors Assigned
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            This case needs a medical team.
                                        </Typography>
                                        {(isPrimaryDoctor || userRole === 'patient') && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<PersonAddIcon />}
                                                onClick={handleAddDoctor}
                                            >
                                                Add Doctor
                                            </Button>
                                        )}
                                    </Box>
                                ) : (
                                    <Grid container spacing={3}>
                                        {caseData.doctors.map((doctor) => {
                                            if (!doctor.doctorId) return null;
                                            const isCurrentPrimary = caseData.primaryDoctor?._id === doctor.doctorId._id;
                                            const statusColors = { approved: 'success', pending: 'warning', rejected: 'error' };
                                            const statusColor = statusColors[doctor.status] || 'default';

                                            return (
                                                <Grid item xs={12} sm={6} md={4} key={doctor.doctorId._id}>
                                                    <Card
                                                        elevation={1}
                                                        sx={{
                                                            position: 'relative',
                                                            borderRadius: 3,
                                                            height: '100%',
                                                            border: isCurrentPrimary ? `2px solid ${theme.palette.success.main}` : `1px solid ${theme.palette.divider}`,
                                                            transition: 'box-shadow 0.3s',
                                                            '&:hover': { boxShadow: 3 }
                                                        }}
                                                    >
                                                        {isCurrentPrimary && (
                                                            <Tooltip title="Primary Doctor">
                                                                <Chip
                                                                    icon={<StarIcon />}
                                                                    label="Primary"
                                                                    size="small"
                                                                    color="success"
                                                                    sx={{
                                                                        position: 'absolute', top: 12, right: 12, zIndex: 1,
                                                                        bgcolor: 'success.main', color: 'white',
                                                                        '& .MuiChip-icon': { color: 'white' }
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        )}
                                                        <CardContent sx={{ pt: 2.5, pb: '16px !important' }}>
                                                            <Box display="flex" alignItems="center" mb={1.5}>
                                                                <Avatar sx={{ width: 48, height: 48, mr: 1.5, bgcolor: theme.palette.primary.light }}>
                                                                    {doctor.doctorId.name ? doctor.doctorId.name.charAt(0).toUpperCase() : 'D'}
                                                                </Avatar>
                                                                <Box flexGrow={1} minWidth={0}> {/* Added minWidth to prevent overflow */}
                                                                    <Typography variant="h6" fontWeight="medium" noWrap>
                                                                        {doctor.doctorId.name || 'Unknown Doctor'}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary" noWrap>
                                                                        {doctor.doctorId.specialization || 'Not specified'}
                                                                    </Typography>
                                                                </Box>
                                                                {!isCurrentPrimary && (isPrimaryDoctor || userRole === 'patient') && (
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={(e) => handleMenuOpen(e, doctor.doctorId._id)}
                                                                        sx={{ alignSelf: 'flex-start', ml: 1 }}
                                                                    >
                                                                        <MoreVertIcon />
                                                                    </IconButton>
                                                                )}
                                                            </Box>
                                                            <Chip
                                                                label={doctor.status ? (doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)) : 'Unknown'}
                                                                color={statusColor}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ mb: 1.5 }}
                                                            />
                                                            {userRole === 'patient' && !feedbackGiven[doctor.doctorId._id] && (
                                                                <Button
                                                                    fullWidth
                                                                    variant="outlined"
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={() => handleOpenFeedbackDialog(doctor.doctorId)}
                                                                    sx={{ mt: 'auto', fontWeight: 'medium' }}
                                                                >
                                                                    Give Feedback
                                                                </Button>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                )}
                            </Box>
                        )}

                        {/* --- Tab Content: Documents --- */}
                        {tabValue === 1 && (
                            <Box sx={{ p: { xs: 2, md: 3 } }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h6" fontWeight="bold">
                                        Medical Documents
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<FileUploadIcon />}
                                        onClick={handleOpenDocumentDialog}
                                        sx={{ fontWeight: 'medium' }}
                                    >
                                        Upload Document
                                    </Button>
                                </Box>
                                {documents.length === 0 ? (
                                    <Box sx={{ p: 4, borderRadius: 2, bgcolor: theme.palette.grey[50], textAlign: 'center' }}>
                                        <DescriptionIcon sx={{ fontSize: 50, color: theme.palette.grey[400], mb: 1 }} />
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            No Documents Found
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Upload reports, scans, or other medical files.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<FileUploadIcon />}
                                            onClick={handleOpenDocumentDialog}
                                        >
                                            Upload First Document
                                        </Button>
                                    </Box>
                                ) : (
                                    <List sx={{ p: 0 }}>
                                        {documents.map((doc) => (
                                            <ListItem
                                                key={doc._id}
                                                component={Paper}
                                                elevation={1}
                                                sx={{ mb: 1.5, borderRadius: 2, p: 1.5, '&:hover': { bgcolor: theme.palette.action.hover } }}
                                                secondaryAction={
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Tooltip title="Get AI Summary">
                                                            <IconButton size="small" color="secondary" onClick={() => handleGetSummary(doc._id, doc.filename)}>
                                                                <SummarizeIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Download Document">
                                                            <IconButton size="small" color="primary" onClick={() => handleDownloadDocument(doc._id, doc.filename)}>
                                                                <DownloadIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                }
                                            >
                                                <ListItemIcon sx={{ minWidth: 40 }}>
                                                    <Avatar variant="rounded" sx={{ bgcolor: theme.palette.primary.lighter, color: theme.palette.primary.dark }}>
                                                        <InsertDriveFileIcon />
                                                    </Avatar>
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body1" fontWeight="medium" noWrap sx={{ maxWidth: { xs: 150, sm: 300, md: 400 } }}>
                                                            {doc.filename}
                                                        </Typography>
                                                    }
                                                    secondary={`Uploaded: ${doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Unknown'}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Box>
                        )}
                    </Paper>

                    {/* --- Lymph Size & p2 Size Logging Section Side by Side --- */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={2} sx={{ borderRadius: 3, p: { xs: 2, md: 3 }, height: '100%' }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Avatar sx={{ bgcolor: theme.palette.secondary.light, mr: 1.5 }}>
                                        <MedicalInformationIcon />
                                    </Avatar>
                                    <Typography variant="h6" fontWeight="bold">
                                        Lymph Size Log
                                    </Typography>
                                </Box>
                                {userRole === 'doctor' && (
                                    <Box display="flex" gap={2} alignItems="center" mb={2} flexWrap="wrap">
                                        <TextField
                                            label="Lymph Size (mm)"
                                            type="number"
                                            value={lymphSize}
                                            onChange={e => setLymphSize(e.target.value)}
                                            size="small"
                                            sx={{ width: 140 }}
                                        />
                                        <TextField
                                            label="Date"
                                            type="date"
                                            value={lymphDate}
                                            onChange={e => setLymphDate(e.target.value)}
                                            size="small"
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ width: 170 }}
                                        />
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={handleAddLymphLog}
                                            sx={{ height: 40 }}
                                        >
                                            Log
                                        </Button>
                                        {lymphError && <Alert severity="error" sx={{ ml: 2 }}>{lymphError}</Alert>}
                                    </Box>
                                )}
                                <Box>
                                    {lymphLogs.length === 0 ? (
                                        <Typography color="text.secondary">No lymph size logs yet.</Typography>
                                    ) : (
                                        <>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Date</TableCell>
                                                        <TableCell>Lymph Size (mm)</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {lymphLogs.map((log, idx) => (
                                                        <TableRow key={idx}>
                                                            <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                                                            <TableCell>{log.size}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                            {lymphLogs.length >= 2 && (
                                                <Box sx={{ mt: 3, width: '100%', height: 220 }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart
                                                            data={lymphLogs
                                                                .slice()
                                                                .sort((a, b) => new Date(a.date) - new Date(b.date))
                                                                .map(log => ({
                                                                    date: new Date(log.date).getTime(),
                                                                    size: log.size
                                                                }))
                                                            }
                                                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis
                                                                dataKey="date"
                                                                type="number"
                                                                domain={['auto', 'auto']}
                                                                scale="time"
                                                                tickFormatter={date => new Date(date).toLocaleDateString()}
                                                            />
                                                            <YAxis label={{ value: 'mm', angle: -90, position: 'insideLeft' }} />
                                                            <Tooltip
                                                                labelFormatter={value => new Date(value).toLocaleDateString()}
                                                            />
                                                            <Line type="monotone" dataKey="size" stroke={theme.palette.primary.main} strokeWidth={2} dot />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </Box>
                                            )}
                                        </>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={2} sx={{ borderRadius: 3, p: { xs: 2, md: 3 }, height: '100%' }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Avatar sx={{ bgcolor: theme.palette.secondary.light, mr: 1.5 }}>
                                        <MedicalInformationIcon />
                                    </Avatar>
                                    <Typography variant="h6" fontWeight="bold">
                                        p2 Size Log
                                    </Typography>
                                </Box>
                                {userRole === 'doctor' && (
                                    <Box display="flex" gap={2} alignItems="center" mb={2} flexWrap="wrap">
                                        <TextField
                                            label="p2 Size (mm)"
                                            type="number"
                                            value={p2Size}
                                            onChange={e => setp2Size(e.target.value)}
                                            size="small"
                                            sx={{ width: 140 }}
                                        />
                                        <TextField
                                            label="Date"
                                            type="date"
                                            value={p2Date}
                                            onChange={e => setp2Date(e.target.value)}
                                            size="small"
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ width: 170 }}
                                        />
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={handleAddp2Log}
                                            sx={{ height: 40 }}
                                        >
                                            Log
                                        </Button>
                                        {p2Error && <Alert severity="error" sx={{ ml: 2 }}>{p2Error}</Alert>}
                                    </Box>
                                )}
                                <Box>
                                    {p2Logs.length === 0 ? (
                                        <Typography color="text.secondary">No p2 size logs yet.</Typography>
                                    ) : (
                                        <>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Date</TableCell>
                                                        <TableCell>p2 Size (mm)</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {p2Logs.map((log, idx) => (
                                                        <TableRow key={idx}>
                                                            <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                                                            <TableCell>{log.size}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                            {p2Logs.length >= 2 && (
                                                <Box sx={{ mt: 3, width: '100%', height: 220 }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart
                                                            data={p2Logs
                                                                .slice()
                                                                .sort((a, b) => new Date(a.date) - new Date(b.date))
                                                                .map(log => ({
                                                                    date: new Date(log.date).getTime(),
                                                                    size: log.size
                                                                }))
                                                            }
                                                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis
                                                                dataKey="date"
                                                                type="number"
                                                                domain={['auto', 'auto']}
                                                                scale="time"
                                                                tickFormatter={date => new Date(date).toLocaleDateString()}
                                                            />
                                                            <YAxis label={{ value: 'mm', angle: -90, position: 'insideLeft' }} />
                                                            <Tooltip
                                                                labelFormatter={value => new Date(value).toLocaleDateString()}
                                                            />
                                                            <Line type="monotone" dataKey="size" stroke={theme.palette.primary.main} strokeWidth={2} dot />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </Box>
                                            )}
                                        </>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    <ToastContainer position="bottom-right" theme="colored" />
                </Container>
            </Layout>

            {/* --- DIALOGS (Styling Enhanced, Functionality Unchanged) --- */}
            {/* Upload Document Dialog */}
            <Dialog
                open={openDocumentDialog}
                onClose={handleCloseDocumentDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">Upload Document</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Select a document (PDF, DOCX, JPG, PNG) to add to this case.
                    </Typography>
                    <Box sx={{ p: 3, border: `2px dashed ${theme.palette.divider}`, borderRadius: 2, bgcolor: theme.palette.grey[50], textAlign: 'center' }}>
                        <input type="file" onChange={handleFileChange} style={{ display: 'block', margin: 'auto' }} />
                        {selectedFile && <Typography variant="body2" sx={{ mt: 1 }}>Selected: {selectedFile.name}</Typography>}
                    </Box>
                    {uploadError && <Alert severity="error" sx={{ mt: 2 }}>{uploadError}</Alert>}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDocumentDialog} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleUploadDocument}
                        color="primary"
                        disabled={uploadLoading || !selectedFile}
                        variant="contained"
                        startIcon={uploadLoading ? <CircularProgress size={20} color="inherit" /> : <FileUploadIcon />}
                    >
                        {uploadLoading ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Make Primary Doctor Menu */}
            {(isPrimaryDoctor || userRole === 'patient') && (
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{ sx: { boxShadow: 3, borderRadius: 2 } }}
                >
                    <MenuItem onClick={handleUpdatePrimaryDoctor}>
                        <ListItemIcon><StarIcon fontSize="small" color="success" /></ListItemIcon>
                        Make Primary Doctor
                    </MenuItem>
                </Menu>
            )}

            {/* Schedule Meeting Dialog */}
            <Dialog
                open={openMeetingDialog}
                onClose={() => setOpenMeetingDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">Schedule Video Meeting</Typography>
                </DialogTitle>
                <DialogContent dividers sx={{ pt: '16px !important' }}>
                    <Box display="flex" flexDirection="column" gap={2.5}>
                        <TextField
                            label="Meeting Title"
                            fullWidth
                            value={meetingDetails.summary}
                            onChange={(e) => setMeetingDetails({ ...meetingDetails, summary: e.target.value })}
                            required
                            variant="outlined"
                        />
                        <TextField
                            label="Meeting Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={meetingDetails.description}
                            onChange={(e) => setMeetingDetails({ ...meetingDetails, description: e.target.value })}
                            required
                            variant="outlined"
                        />
                        {/* Grid is suitable for side-by-side date inputs */}
                        <Grid container spacing={2.5}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Start Time"
                                    type="datetime-local"
                                    fullWidth
                                    value={meetingDetails.startTime}
                                    onChange={(e) => setMeetingDetails({ ...meetingDetails, startTime: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="End Time"
                                    type="datetime-local"
                                    fullWidth
                                    value={meetingDetails.endTime}
                                    onChange={(e) => setMeetingDetails({ ...meetingDetails, endTime: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                        {validationError && <Alert severity="warning" sx={{ mt: 1 }}>{validationError}</Alert>}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 1.5 }}>
                    <Button onClick={() => setOpenMeetingDialog(false)} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleCreateMeeting}
                        color="primary"
                        disabled={meetingLoading}
                        variant="contained"
                        startIcon={meetingLoading ? <CircularProgress size={20} color="inherit" /> : <VideoCallIcon />}
                    >
                        {meetingLoading ? 'Scheduling...' : 'Schedule'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Feedback Dialog */}
            <Dialog
                open={feedbackDialogOpen}
                onClose={handleCloseFeedbackDialog}
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">Give Feedback</Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Please provide your feedback for Dr. {selectedDoctorForFeedback?.name}.
                    </DialogContentText>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Rating
                            name="rating"
                            value={rating}
                            onChange={(event, newValue) => setRating(newValue)}
                            precision={0.5}
                            size="large"
                        />
                    </Box>
                    <TextField
                        label="Comments (Optional)"
                        fullWidth
                        multiline
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseFeedbackDialog} color="inherit">Cancel</Button>
                    <Button onClick={handleSubmitFeedback} color="primary" variant="contained">
                        Submit Feedback
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Chat Selection Dialog */}
            <Dialog
                open={openChatSelectionDialog}
                onClose={handleCloseChatSelectionDialog}
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">Select Chat Room</Typography>
                </DialogTitle>
                <List sx={{ pt: 0, width: { xs: 'auto', sm: 350 } }}>
                    <ListItem button onClick={navigateToGeneralChat} sx={{ py: 1.5 }}>
                        <ListItemIcon>
                            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36 }}>
                                <PersonIcon fontSize="small" />
                            </Avatar>
                        </ListItemIcon>
                        <ListItemText
                            primary={<Typography fontWeight="medium">General Chat</Typography>}
                            secondary="All participants including patient"
                        />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem button onClick={navigateToDoctorsChat} sx={{ py: 1.5 }}>
                        <ListItemIcon>
                            <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 36, height: 36 }}>
                                <MedicalInformationIcon fontSize="small" />
                            </Avatar>
                        </ListItemIcon>
                        <ListItemText
                            primary={<Typography fontWeight="medium">Doctors Only Chat</Typography>}
                            secondary="Private discussion between doctors"
                        />
                    </ListItem>
                </List>
            </Dialog>

            {/* Summary Dialog */}
            <Dialog
                open={openSummaryDialog}
                onClose={handleCloseSummaryDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SummarizeIcon color="primary" sx={{ mr: 1.5 }} />
                        <Typography variant="h6" fontWeight="bold" noWrap>
                            Summary: {currentSummary.filename}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {currentSummary.loading ? (
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4}>
                            <CircularProgress sx={{ mb: 2 }} />
                            <Typography color="text.secondary">Generating summary...</Typography>
                        </Box>
                    ) : currentSummary.error ? (
                        <Alert severity="error" sx={{ m: 1 }}>{currentSummary.error}</Alert>
                    ) : (
                        <Typography variant="body1" sx={{ p: 1, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {currentSummary.summary || 'No summary could be generated.'}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 1.5 }}>
                    <Button onClick={handleCloseSummaryDialog} color="primary" variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CasePage;