import React, { useState, useEffect } from 'react';
import { 
    Button, 
    Container, 
    Typography, 
    Box, 
    Card, 
    CardContent, 
    CardActions,
    Grid,
    Paper,
    Avatar,
    Chip,
    Skeleton,
    Divider,
    useTheme,
    IconButton,
    Tooltip,
    TextField
} from "@mui/material";
import { 
    AddCircle as AddIcon, 
    MedicalServices, 
    AccessTime, 
    Group,
    Visibility,
    ArrowForward,
    Edit as EditIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../components/NavBar';
import CalendarPage from './Calendar.jsx'; 
import Footer from '../components/Footer'; 

const PatientDashboard = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [patientInfo, setPatientInfo] = useState(null);
    const [editingCaseId, setEditingCaseId] = useState(null);
    const [newCaseName, setNewCaseName] = useState('');
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        fetchPatientData();
        fetchCases();
    }, []);

    const fetchPatientData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/patient/profile', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPatientInfo(response.data);
        } catch (error) {
            console.error('Error fetching patient data:', error);
            toast.error('Unable to load your profile information');
        }
    };

    const fetchCases = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/case/patient-cases', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCases(response.data);
        } catch (error) {
            console.error('Error fetching cases:', error);
            toast.error('Unable to load your cases');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNewCase = async () => {
        try {
            toast.info('Creating new case...');
            const response = await axios.post('http://localhost:5000/api/case/create', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Case created successfully!');
            navigate(`/case/${response.data._id}`);
        } catch (error) {
            console.error('Error creating case:', error);
            toast.error('Failed to create new case');
        }
    };

    const handleViewCase = (caseId) => {
        navigate(`/case/${caseId}`);
    };

    const handleEditCaseName = (caseId, currentName) => {
        setEditingCaseId(caseId);
        setNewCaseName(currentName);
    };

    const handleSaveCaseName = async (caseId) => {
        try {
            await axios.put(`http://localhost:5000/api/case/${caseId}/rename`, { name: newCaseName }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Case name updated successfully!');
            setEditingCaseId(null);
            fetchCases();
        } catch (error) {
            console.error('Error updating case name:', error);
            toast.error('Failed to update case name');
        }
    };

    const getGradient = (doctorCount) => {
        if (doctorCount === 0) return 'linear-gradient(135deg, #f9f7f7 0%, #e3e3e3 100%)';
        if (doctorCount === 1) return 'linear-gradient(135deg, #d4e7fe 0%, #b6dbff 100%)';
        return 'linear-gradient(135deg, #c9f7f3 0%, #9eeee6 100%)';
    };

    return (
        <Layout>
            <Container maxWidth="lg" sx={{ mt: 0, mb: 8 }}>
                {/* Welcome Section */}
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 4, 
                        mb: 4, 
                        borderRadius: 3, 
                        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Box 
                        sx={{ 
                            position: 'absolute',
                            top: -25,
                            right: -25,
                            width: 150,
                            height: 150,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                            zIndex: 0
                        }}
                    />
                    <Box 
                        sx={{ 
                            position: 'absolute',
                            bottom: -40,
                            left: -40,
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                            zIndex: 0
                        }}
                    />
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Avatar 
                                sx={{ width: 56, height: 56, bgcolor: 'white' }}
                            >
                                {patientInfo?.name?.charAt(0) || "P"}
                            </Avatar>
                            <Box>
                                <Typography variant="h4" fontWeight="bold">
                                    Welcome back, {patientInfo?.name || 'Patient'}
                                </Typography>
                                <Typography variant="body1">
                                    Manage your medical cases and connect with doctors
                                </Typography>
                            </Box>
                        </Box>
                        <Box display="flex" gap={2} mt={3}>
                            <Chip
                                icon={<MedicalServices sx={{ color: 'white !important' }} />}
                                label={`${cases.length} Medical Cases`}
                                sx={{ 
                                    bgcolor: 'rgba(255,255,255,0.2)', 
                                    color: 'white', 
                                    '& .MuiChip-icon': { color: 'white' }
                                }}
                            />
                            <Chip
                                icon={<Group sx={{ color: 'white !important' }} />}
                                label={`${cases.reduce((total, c) => total + c.doctors.length, 0)} Consulting Doctors`}
                                sx={{ 
                                    bgcolor: 'rgba(255,255,255,0.2)', 
                                    color: 'white',
                                    '& .MuiChip-icon': { color: 'white' } 
                                }}
                            />
                        </Box>
                    </Box>
                </Paper>

                {/* Cases Section */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold">Your Medical Cases</Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AddIcon />}
                        onClick={handleCreateNewCase}
                        sx={{ 
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(37, 117, 252, 0.2)'
                        }}
                    >
                        Create New Case
                    </Button>
                </Box>

                {loading ? (
                    <Grid container spacing={3}>
                        {[1, 2, 3].map((item) => (
                            <Grid item xs={12} md={6} lg={4} key={item}>
                                <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                    <CardContent>
                                        <Skeleton variant="text" width="60%" height={40} />
                                        <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
                                        <Skeleton variant="text" width="30%" height={20} sx={{ mt: 1 }} />
                                    </CardContent>
                                    <CardActions>
                                        <Skeleton variant="rectangular" width={100} height={36} />
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : cases.length === 0 ? (
                    <Paper 
                        sx={{ 
                            p: 4, 
                            textAlign: 'center', 
                            borderRadius: 3,
                            backgroundColor: '#f8f9fa'
                        }}
                    >
                        <MedicalServices sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Medical Cases Yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Create your first case to start connecting with doctors
                        </Typography>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<AddIcon />}
                            onClick={handleCreateNewCase}
                            sx={{ mt: 2, borderRadius: 2 }}
                        >
                            Create Your First Case
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {cases.map((caseItem) => (
                            <Grid item xs={12} md={6} lg={4} key={caseItem._id}>
                                <Card 
                                    sx={{ 
                                        height: '100%', 
                                        borderRadius: 3, 
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                        position: 'relative',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                                        }
                                    }}
                                >
                                    <Box 
                                        sx={{
                                            height: 8,
                                            background: getGradient(caseItem.doctors.length),
                                            borderTopLeftRadius: 12,
                                            borderTopRightRadius: 12
                                        }}
                                    />
                                    <CardContent sx={{ pt: 3 }}>
                                        {editingCaseId === caseItem._id ? (
                                            <Box display="flex" alignItems="center">
                                                <TextField 
                                                    value={newCaseName}
                                                    onChange={(e) => setNewCaseName(e.target.value)}
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                />
                                                <IconButton onClick={() => handleSaveCaseName(caseItem._id)}>
                                                    <CheckIcon />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <Typography variant="h6" fontWeight="medium">
                                                    {caseItem.name || `Case #${caseItem._id.slice(-6).toUpperCase()}`}
                                                </Typography>
                                                <IconButton onClick={() => handleEditCaseName(caseItem._id, caseItem.name)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Box>
                                        )}
                                        <Box display="flex" alignItems="center" mt={1} mb={2}>
                                            <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Created on {new Date(caseItem.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ my: 1.5 }} />
                                        <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                                            <Box display="flex" alignItems="center">
                                                <Group sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                                                <Typography>
                                                    {caseItem.doctors.length === 0 ? (
                                                        <Typography variant="body2">No doctors assigned</Typography>
                                                    ) : (
                                                        <Typography variant="body2">
                                                            {caseItem.doctors.length} {caseItem.doctors.length === 1 ? 'Doctor' : 'Doctors'}
                                                        </Typography>
                                                    )}
                                                </Typography>
                                            </Box>
                                            <Tooltip title="View details">
                                                <IconButton 
                                                    color="primary"
                                                    onClick={() => handleViewCase(caseItem._id)}
                                                    sx={{ 
                                                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(25, 118, 210, 0.15)'
                                                        }
                                                    }}
                                                >
                                                    <ArrowForward fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Calendar Section */}
                <Typography variant="h5" fontWeight="bold" sx={{ mt: 5 }}>
                    Your Calendar
                </Typography>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                    <CalendarPage />
                </Paper>
            </Container>
            <Footer /> {/* Add Footer component here */}
        </Layout>
    );
};

export default PatientDashboard;