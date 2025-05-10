import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Grid, 
    Paper, 
    Typography, 
    Box, 
    Avatar, 
    Button, 
    TextField, 
    Divider, 
    Chip, 
    IconButton, 
    Tabs, 
    Tab, 
    List, 
    ListItem, 
    ListItemAvatar, 
    ListItemText, 
    CircularProgress,
    Alert,
    Tooltip,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Fade,
    useTheme
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Email as EmailIcon, 
    Phone as PhoneIcon, 
    Person as PersonIcon, 
    Lock as LockIcon,
    Verified as VerifiedIcon, 
    SaveAlt as SaveIcon,
    MedicalServices,
    LocalHospital,
    AccessTime,
    Security,
    Cake as BirthdayIcon,
    BloodtypeOutlined as BloodTypeIcon,
    HeightOutlined as HeightIcon,
    MonitorWeightOutlined as WeightIcon,
    AddCircleOutline,
    PhotoCamera,
    History,
    Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/NavBar';
import { toast } from 'react-toastify';

const ProfilePage = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [tabValue, setTabValue] = useState(0);
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');
    const [recentCases, setRecentCases] = useState([]);
    // const [passwordData, setPasswordData] = useState({
    //     currentPassword: '',
    //     newPassword: '',
    //     confirmPassword: ''
    // });
    // const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    // const [changingPassword, setChangingPassword] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const theme = useTheme();
    const navigate = useNavigate();
    
    useEffect(() => {
        // Make sure userRole is correctly set before making API calls
        const storedUserRole = localStorage.getItem('userRole');
        setUserRole(storedUserRole || '');
        
        // Only fetch data when userRole is available
        if (storedUserRole) {
            fetchProfileData();
            fetchRecentCases();
        }
    }, []);
    
    // Update fetchRecentCases to use the current userRole directly from localStorage
    // in case the state hasn't been updated yet
    const fetchRecentCases = async () => {
        try {
            const currentUserRole = localStorage.getItem('userRole');
            console.log('Current user role for API call:', currentUserRole);
            
            // Fix the endpoints - they should be different for doctors and patients
            const endpoint = currentUserRole === 'doctor' 
                ? 'http://localhost:5000/api/case/doctor/accepted' 
                : 'http://localhost:5000/api/case/patient-cases';
            
            console.log('Using endpoint:', endpoint);
            
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            console.log('Cases response:', response.data);
            
            // Handle different response structures
            let casesData = [];
            if (Array.isArray(response.data)) {
                casesData = response.data;
            } else if (response.data.cases && Array.isArray(response.data.cases)) {
                casesData = response.data.cases;
            } else if (typeof response.data === 'object') {
                // If it's some other object structure, try to find an array property
                for (const key in response.data) {
                    if (Array.isArray(response.data[key])) {
                        casesData = response.data[key];
                        break;
                    }
                }
            }
            
            // Sort by latest cases first and take the 5 most recent
            const sortedCases = casesData.sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.createdAt || 0);
                const dateB = new Date(b.updatedAt || b.createdAt || 0);
                return dateB - dateA;
            }).slice(0, 5);
            
            console.log('Sorted cases for display:', sortedCases);
            setRecentCases(sortedCases);
        } catch (err) {
            console.error('Error fetching recent cases:', err);
            // More detailed error logging
            if (err.response) {
                console.error('Response data:', err.response.data);
                console.error('Response status:', err.response.status);
            }
            toast.error(`Failed to load recent cases: ${err.message || 'Unknown error'}`);
        }
    };

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const endpoint = userRole === 'doctor' 
                ? 'http://localhost:5000/api/doctor/profile' 
                : 'http://localhost:5000/api/patient/profile';
            
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            setProfileData(response.data);
            setEditedData(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message || 'Failed to load profile data');
            setLoading(false);
            toast.error('Failed to load profile data');
        }
    };

//     const fetchRecentCases = async () => {
//     try {
//         // The issue is likely in your endpoint - for doctors, the endpoint may be different
//         // or the response structure might not be what you expect
        
//         const endpoint = userRole === 'doctor' 
//             ? 'http://localhost:5000/api/case/doctor-cases' 
//             : 'http://localhost:5000/api/case/patient-cases';
        
//         const response = await axios.get(endpoint, {
//             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
        
//         // Add debugging to see what's coming back from the API
//         console.log('Cases response:', response.data);
        
//         // Make sure we're handling the response data structure correctly
//         const casesData = Array.isArray(response.data) ? response.data : 
//                           (response.data.cases ? response.data.cases : []);
        
//         const sortedCases = casesData.sort((a, b) => 
//             new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
//         ).slice(0, 5);
        
//         console.log('Sorted cases:', sortedCases);
//         setRecentCases(sortedCases);
//     } catch (err) {
//         console.error('Error fetching recent cases:', err);
//         // Show the error in toast for better debugging
//         toast.error(`Failed to load recent cases: ${err.message || 'Unknown error'}`);
//     }
// };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleEditToggle = () => {
        if (editMode) {
            setEditedData(profileData);
        }
        setEditMode(!editMode);
    };

    const handleSaveProfile = async () => {
        try {
            const endpoint = userRole === 'doctor' 
                ? 'http://localhost:5000/api/doctor/complete-profile' 
                : 'http://localhost:5000/api/patient/complete-profile';
            
            await axios.post(endpoint, editedData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            setProfileData(editedData);
            setEditMode(false);
            toast.success('Profile updated successfully');
        } catch (err) {
            console.error('Error updating profile:', err);
            toast.error(err.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // const handlePasswordChange = async () => {
    //     if (passwordData.newPassword !== passwordData.confirmPassword) {
    //         toast.error('New passwords do not match');
    //         return;
    //     }
        
    //     setChangingPassword(true);
    //     try {
    //         const endpoint = 'http://localhost:5000/api/auth/change-password';
    //         await axios.post(endpoint, {
    //             currentPassword: passwordData.currentPassword,
    //             newPassword: passwordData.newPassword
    //         }, {
    //             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    //         });
            
    //         setOpenPasswordDialog(false);
    //         setPasswordData({
    //             currentPassword: '',
    //             newPassword: '',
    //             confirmPassword: ''
    //         });
    //         toast.success('Password changed successfully');
    //     } catch (err) {
    //         toast.error(err.response?.data?.message || 'Failed to change password');
    //     } finally {
    //         setChangingPassword(false);
    //     }
    // };

    const handleSignOutAllDevices = async () => {
        try {
            const endpoint = `http://localhost:5000/api/${userRole}/logout-all-devices`;
            await axios.post(endpoint, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            toast.success('Signed out of all devices successfully');
            navigate('/auth?mode=signup&role=patient');
        } catch (err) {
            console.error('Error signing out of all devices:', err);
            toast.error(err.response?.data?.message || 'Failed to sign out of all devices');
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') {
            toast.error('Please type DELETE to confirm');
            return;
        }
        
        setIsDeleting(true);
        try {
            const endpoint = `http://localhost:5000/api/${userRole}/delete-account`;
            await axios.delete(endpoint, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            toast.success('Account deleted successfully');
            navigate('/auth?mode=signup&role=patient');
        } catch (err) {
            console.error('Error deleting account:', err);
            toast.error(err.response?.data?.message || 'Failed to delete account');
        } finally {
            setIsDeleting(false);
            setOpenDeleteDialog(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Layout>
                <Container sx={{ mt: 0, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
                        Loading your profile...
                    </Typography>
                </Container>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <Container sx={{ mt: 0 }}>
                    <Alert 
                        severity="error" 
                        sx={{ 
                            py: 2, 
                            display: 'flex', 
                            alignItems: 'center',
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Typography variant="body1">
                            Error loading profile: {error}
                        </Typography>
                    </Alert>
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => window.location.reload()}
                            sx={{ borderRadius: 2 }}
                        >
                            Try Again
                        </Button>
                    </Box>
                </Container>
            </Layout>
        );
    }

    return (
        <Layout>
            <Container maxWidth="lg" sx={{ mt: 0, mb: 8 }}>
                {/* Profile Header */}
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 4, 
                        mb: 4, 
                        borderRadius: 3, 
                        background: userRole === 'doctor' 
                            ? 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)'
                            : 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
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
                    <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
                        <Box position="relative">
                            <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    
                            >
                                <Avatar
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        border: '4px solid rgba(255,255,255,0.3)',
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        fontSize: '3rem',
                                        fontWeight: 'bold',
                                        color: 'white'
                                    }}
                                >
                                    {profileData?.name?.charAt(0) || (userRole === 'doctor' ? 'D' : 'P')}
                                </Avatar>
                            </Badge>
                        </Box>
                        
                        <Box ml={{ xs: 0, md: 4 }} mt={{ xs: 2, md: 0 }} textAlign={{ xs: 'center', md: 'left' }}>
                            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                                {userRole === 'doctor' ? `Dr. ${profileData?.name}` : profileData?.name}
                            </Typography>
                            
                            {userRole === 'doctor' && (
                                <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                                    {profileData?.specialization || 'Medical Professional'}
                                </Typography>
                            )}
                            
                            <Box display="flex" gap={2} justifyContent={{ xs: 'center', md: 'flex-start' }} flexWrap="wrap">
                                <Chip
                                    icon={<EmailIcon sx={{ color: 'white !important' }} />}
                                    label={profileData?.email}
                                    sx={{ 
                                        bgcolor: 'rgba(255,255,255,0.2)', 
                                        color: 'white', 
                                        '& .MuiChip-icon': { color: 'white' } 
                                    }}
                                />
                                {profileData?.phone && (
                                    <Chip
                                        icon={<PhoneIcon sx={{ color: 'white !important' }} />}
                                        label={profileData?.phone}
                                        sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.2)', 
                                            color: 'white',
                                            '& .MuiChip-icon': { color: 'white' } 
                                        }}
                                    />
                                )}
                                {userRole === 'doctor' && profileData?.isAdmin === "Yes" && (
                                    <Chip
                                        icon={<VerifiedIcon sx={{ color: 'white !important' }} />}
                                        label="Senior Medical Consultant"
                                        sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.2)', 
                                            color: 'white',
                                            '& .MuiChip-icon': { color: 'white' } 
                                        }}
                                    />
                                )}
                            </Box>
                        </Box>
{                       
                        <Box ml="auto" mt={{ xs: 3, md: 0 }} display="flex" justifyContent={{ xs: 'center', md: 'flex-end' }} width={{ xs: '100%', md: 'auto' }}>
                            <Button
                                variant="contained"
                                startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                                onClick={editMode ? handleSaveProfile : handleEditToggle}
                                sx={{ 
                                    bgcolor: 'rgba(255,255,255,0.85)', 
                                    color: theme.palette.primary.main,
                                    fontWeight: 500,
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,1)',
                                    },
                                    mr: 1
                                }}
                            >
                                {editMode ? 'Save Changes' : 'Edit Profile'}
                            </Button>
                            {/* // <Button>
                            //     variant="outlined"
                            //     startIcon={<LockIcon />}
                            //     onClick={() => setOpenPasswordDialog(true)}
                            //     sx={{ 
                            //         borderColor: 'rgba(255,255,255,0.5)', 
                            //         color: 'white',
                            //         '&:hover': {
                            //             borderColor: 'white',
                            //             bgcolor: 'rgba(255,255,255,0.1)',
                            //         }
                            //     }}
                            // >
                            //     Change Password
                            // </Button> */}
                        </Box> }
                    </Box>
                </Paper>

                {/* Tabs Navigation */}
                <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        <Tab 
                            icon={<PersonIcon />} 
                            iconPosition="start"
                            label="Personal Information" 
                        />
                        <Tab 
                            icon={<History />} 
                            iconPosition="start"
                            label="Recent Activity" 
                        />
                        <Tab 
                            icon={<Security />} 
                            iconPosition="start"
                            label="Security" 
                        />
                    </Tabs>
                </Box>

                {/* Tab Content */}
                {/* Personal Information Tab */}
                {tabValue === 0 && (
                    <Fade in={true}>
                        <Grid container spacing={4}>
                            {/* Basic Information */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6" fontWeight="medium">Basic Information</Typography>
                                    </Box>
                                    <Divider sx={{ mb: 3 }} />
                                    
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Full Name"
                                                value={editedData?.name || ''}
                                                name="name"
                                                onChange={handleInputChange}
                                                fullWidth
                                                disabled={!editMode}
                                                InputProps={{ 
                                                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                                    sx: { borderRadius: 2 }
                                                }}
                                            />
                                        </Grid>
                                        
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Email"
                                                value={editedData?.email || ''}
                                                name="email"
                                                onChange={handleInputChange}
                                                fullWidth
                                                disabled={true}
                                                InputProps={{ 
                                                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                                    sx: { borderRadius: 2 }
                                                }}
                                            />
                                        </Grid>
                                        
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Phone Number"
                                                value={editedData?.phone || ''}
                                                name="phone"
                                                onChange={handleInputChange}
                                                fullWidth
                                                disabled={!editMode}
                                                InputProps={{ 
                                                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                                    sx: { borderRadius: 2 }
                                                }}
                                            />
                                        </Grid>
                                        
                                        {userRole === 'doctor' && (
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Specialization"
                                                    value={editedData?.specialization || ''}
                                                    name="specialization"
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                    disabled={!editMode}
                                                    InputProps={{ 
                                                        startAdornment: <LocalHospital sx={{ mr: 1, color: 'text.secondary' }} />,
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                />
                                            </Grid>
                                        )}
                                        
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Date of Birth"
                                                type="date"
                                                value={editedData?.dob?.split('T')[0] || ''}
                                                name="dob"
                                                onChange={handleInputChange}
                                                fullWidth
                                                disabled={!editMode}
                                                InputLabelProps={{ shrink: true }}
                                                InputProps={{ 
                                                    startAdornment: <BirthdayIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                                    sx: { borderRadius: 2 }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                            
                            {/* Medical Information (for patients) or Professional Information (for doctors) */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6" fontWeight="medium">
                                            {userRole === 'doctor' ? 'Professional Information' : 'Medical Information'}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 3 }} />
                                    
                                    {userRole === 'doctor' ? (
                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Years of Experience"
                                                    type="number"
                                                    value={editedData?.experience || ''}
                                                    name="experience"
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                    disabled={!editMode}
                                                    InputProps={{ 
                                                        startAdornment: <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />,
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Education"
                                                    value={editedData?.education || ''}
                                                    name="education"
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    disabled={!editMode}
                                                    InputProps={{ sx: { borderRadius: 2 } }}
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Hospital Affiliation"
                                                    value={editedData?.hospitalAffiliation || ''}
                                                    name="hospitalAffiliation"
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                    disabled={!editMode}
                                                    InputProps={{ 
                                                        startAdornment: <LocalHospital sx={{ mr: 1, color: 'text.secondary' }} />,
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Professional Bio"
                                                    value={editedData?.bio || ''}
                                                    name="bio"
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    disabled={!editMode}
                                                    InputProps={{ sx: { borderRadius: 2 } }}
                                                />
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Blood Type"
                                                    value={editedData?.bloodType || ''}
                                                    name="bloodType"
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                    disabled={!editMode}
                                                    InputProps={{ 
                                                        startAdornment: <BloodTypeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Height (cm)"
                                                    type="number"
                                                    value={editedData?.height || ''}
                                                    name="height"
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                    disabled={!editMode}
                                                    InputProps={{ 
                                                        startAdornment: <HeightIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Weight (kg)"
                                                    type="number"
                                                    value={editedData?.weight || ''}
                                                    name="weight"
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                    disabled={!editMode}
                                                    InputProps={{ 
                                                        startAdornment: <WeightIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Allergies"
                                                    value={editedData?.allergies || ''}
                                                    name="allergies"
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    disabled={!editMode}
                                                    InputProps={{ sx: { borderRadius: 2 } }}
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Medical History"
                                                    value={editedData?.medicalHistory || ''}
                                                    name="medicalHistory"
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    disabled={!editMode}
                                                    InputProps={{ sx: { borderRadius: 2 } }}
                                                />
                                            </Grid>
                                        </Grid>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Fade>
                )}

                {/* Recent Activity Tab */}
                {tabValue === 1 && (
                    <Fade in={true}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} lg={8}>
                                <Paper sx={{ p: 3, borderRadius: 3 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6" fontWeight="medium">Recent Cases</Typography>
                                        <Button 
                                            variant="text" 
                                            color="primary"
                                            onClick={() => navigate(userRole === 'doctor' ? '/doctor-dashboard' : '/')}
                                        >
                                            View All
                                        </Button>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    
                                    {recentCases.length === 0 ? (
                                        <Box textAlign="center" py={4}>
                                            <MedicalServices sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                            <Typography color="text.secondary">No recent cases found</Typography>
                                            
                                            {userRole === 'patient' && (
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    startIcon={<AddCircleOutline />}
                                                    sx={{ mt: 2, borderRadius: 2 }}
                                                    onClick={() => navigate('/')}
                                                >
                                                    Create New Case
                                                </Button>
                                            )}
                                        </Box>
                                    ) : (
                                        <List>
                                            {recentCases.map((caseItem, index) => (
                                                <React.Fragment key={caseItem._id}>
                                                    <ListItem 
                                                        sx={{ 
                                                            px: 2, 
                                                            borderRadius: 2, 
                                                            transition: 'all 0.2s',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(0, 0, 0, 0.04)',
                                                                cursor: 'pointer'
                                                            }
                                                        }}
                                                        onClick={() => navigate(`/case/${caseItem._id}`)}
                                                    >
                                                        <ListItemAvatar>
                                                            <Avatar 
                                                                sx={{ 
                                                                    bgcolor: caseItem.doctors?.length > 0 
                                                                        ? theme.palette.primary.main 
                                                                        : theme.palette.grey[400]
                                                                }}
                                                            >
                                                                <MedicalServices />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={`Case #${caseItem._id.slice(-6).toUpperCase()}`}
                                                            secondary={
                                                                <React.Fragment>
                                                                    <Typography component="span" variant="body2">
                                                                        Last updated: {formatDate(caseItem.updatedAt)}
                                                                    </Typography>
                                                                    <Box display="flex" flexWrap="wrap" gap={1} mt={0.5}>
                                                                        <Chip 
                                                                            size="small" 
                                                                            label={`${caseItem.doctors?.length || 0} Doctors`}
                                                                            color={caseItem.doctors?.length > 0 ? "primary" : "default"}
                                                                            variant="outlined"
                                                                            sx={{ height: 24 }}
                                                                        />
                                                                    </Box>
                                                                </React.Fragment>
                                                            }
                                                        />
                                                        <Button
                                                            variant="text"
                                                            size="small"
                                                            color="primary"
                                                        >
                                                            View
                                                        </Button>
                                                    </ListItem>
                                                    {index < recentCases.length - 1 && <Divider component="li" sx={{ my: 1 }} />}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    )}
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12} lg={4}>
                                <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6" fontWeight="medium">Account Overview</Typography>
                                    </Box>
                                    <Divider sx={{ mb: 3 }} />
                                    
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Account Type
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {userRole === 'doctor' ? 'Healthcare Provider' : 'Patient'}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Member Since
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {profileData?.createdAt ? formatDate(profileData.createdAt) : 'N/A'}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Last Login
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {profileData?.lastLogin ? formatDate(profileData.lastLogin) : 'Today'}
                                        </Typography>
                                    </Box>
{/*                                     
                                    <Box sx={{ mt: 4 }}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="primary"
                                            startIcon={<LockIcon />}
                                            onClick={() => setOpenPasswordDialog(true)}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Change Password
                                        </Button>
                                    </Box> */}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Fade>
                )}

                {/* Security Tab */}
                {tabValue === 2 && (
                    <Fade in={true}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3, borderRadius: 3 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6" fontWeight="medium">Password & Security</Typography>
                                    </Box>
                                    <Divider sx={{ mb: 3 }} />
                                    
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Password
                                        </Typography>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body1">
                                                ••••••••••••
                                            </Typography>
                                            {/* <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => setOpenPasswordDialog(true)}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                Change
                                            </Button> */}
                                        </Box>
                                    </Box>
                                    
                                    {/* <Box sx={{ mb: 4 }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Two-factor Authentication
                                        </Typography>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body1" color="text.secondary">
                                                Not enabled
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                sx={{ borderRadius: 2 }}
                                            >
                                                Enable
                                            </Button>
                                        </Box>
                                    </Box> */}
                                    
                                    
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3, borderRadius: 3 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6" fontWeight="medium">Session & Device Management</Typography>
                                    </Box>
                                    <Divider sx={{ mb: 3 }} />
                                    
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Current Session
                                        </Typography>
                                        <Paper 
                                            elevation={0} 
                                            sx={{ 
                                                p: 2, 
                                                bgcolor: 'rgba(0,0,0,0.02)', 
                                                borderRadius: 2,
                                                border: '1px solid rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                                                         navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                                                         navigator.userAgent.includes('Safari') ? 'Safari' : 'Browser'} - {
                                                            navigator.userAgent.includes('Windows') ? 'Windows' : 
                                                            navigator.userAgent.includes('Mac') ? 'Mac OS' : 
                                                            navigator.userAgent.includes('Linux') ? 'Linux' : 'Unknown OS'
                                                        }
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Current active session - {new Date().toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                                <Chip 
                                                    label="Active" 
                                                    size="small" 
                                                    color="success" 
                                                    sx={{ fontWeight: 500 }} 
                                                />
                                            </Box>
                                        </Paper>
                                    </Box>
                                    
                                    <Box sx={{ mt: 4 }}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="error"
                                            sx={{ borderRadius: 2 }}
                                            onClick={handleSignOutAllDevices}
                                        >
                                            Sign Out of All Devices
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, borderRadius: 3 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6" fontWeight="medium">Data Privacy</Typography>
                                    </Box>
                                    <Divider sx={{ mb: 3 }} />
                                    
                                    <Box>
                                        <Typography variant="body1" paragraph>
                                            Your data privacy is important to us. You have the right to:
                                        </Typography>
                                        <Box display="flex" flexDirection="column" gap={2}>
                                            <Box display="flex" gap={2}>
                    
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    sx={{ borderRadius: 2 }}
                                                    onClick={() => setOpenDeleteDialog(true)}
                                                >
                                                    Delete Account
                                                </Button>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Deleting your account will permanently remove all your personal information from our systems.
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Fade>
                )}

                {/* Password Change Dialog
                <Dialog 
                    open={openPasswordDialog} 
                    onClose={() => setOpenPasswordDialog(false)}
                    PaperProps={{ sx: { borderRadius: 3, maxWidth: 480 } }}
                >
                    <DialogTitle>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <LockIcon color="primary" />
                            <Typography variant="h6">Change Your Password</Typography>
                        </Box>
                    </DialogTitle>
                    <DialogContent sx={{ pt: 1 }}>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            For security, please enter your current password followed by your new password.
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                label="Current Password"
                                type="password"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                            <TextField
                                label="New Password"
                                type="password"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                helperText="Password must be at least 8 characters long"
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                            <TextField
                                label="Confirm New Password"
                                type="password"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
                                helperText={
                                    passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== '' 
                                        ? 'Passwords do not match' 
                                        : ' '
                                }
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button 
                            onClick={() => setOpenPasswordDialog(false)}
                            color="inherit"
                            sx={{ borderRadius: 2 }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handlePasswordChange}
                            variant="contained"
                            color="primary"
                            disabled={
                                changingPassword || 
                                !passwordData.currentPassword || 
                                !passwordData.newPassword || 
                                !passwordData.confirmPassword ||
                                passwordData.newPassword !== passwordData.confirmPassword
                            }
                            sx={{ 
                                borderRadius: 2,
                                minWidth: 120
                            }}
                        >
                            {changingPassword ? 'Saving...' : 'Change Password'}
                        </Button>
                    </DialogActions>
                </Dialog> */}

                {/* Delete Account Dialog */}
                <Dialog 
                    open={openDeleteDialog} 
                    onClose={() => !isDeleting && setOpenDeleteDialog(false)}
                    PaperProps={{ sx: { borderRadius: 3, maxWidth: 480 } }}
                >
                    <DialogTitle>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <WarningIcon color="error" />
                            <Typography variant="h6">Delete Your Account</Typography>
                        </Box>
                    </DialogTitle>
                    <DialogContent sx={{ pt: 1 }}>
                        <Typography variant="body1" color="error.main" paragraph fontWeight="medium">
                            Warning: This action cannot be undone.
                        </Typography>
                        <Typography variant="body2" paragraph>
                            Deleting your account will permanently remove:
                        </Typography>
                        <ul>
                            <li><Typography variant="body2">All your personal information</Typography></li>
                            <li><Typography variant="body2">Your medical history and records</Typography></li>
                            <li><Typography variant="body2">All case data and communications</Typography></li>
                        </ul>
                        <Typography variant="body2" mt={2} mb={3}>
                            To confirm, please type <b>DELETE</b> in the field below:
                        </Typography>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type DELETE to confirm"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            InputProps={{ sx: { borderRadius: 2 } }}
                            error={deleteConfirmText.length > 0 && deleteConfirmText !== 'DELETE'}
                            helperText={deleteConfirmText.length > 0 && deleteConfirmText !== 'DELETE' ? 'Please type DELETE exactly as shown' : ' '}
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button 
                            onClick={() => setOpenDeleteDialog(false)}
                            color="inherit"
                            disabled={isDeleting}
                            sx={{ borderRadius: 2 }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleDeleteAccount}
                            variant="contained"
                            color="error"
                            disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                            sx={{ 
                                borderRadius: 2,
                                minWidth: 120
                            }}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Account'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Layout>
    );
};

export default ProfilePage;
