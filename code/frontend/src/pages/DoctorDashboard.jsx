import React, { useState, useEffect } from 'react';
import {
    Button, Container, Typography, Box, Paper, Avatar, Grid, Card,
    CardContent, TextField, IconButton, useTheme, CardActionArea,
    CircularProgress, Alert
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import Layout from '../components/NavBar.jsx';
import {
    CheckCircleOutline, NotificationsNone, LocalHospitalOutlined,
    Edit as EditIcon, Check as CheckIcon, ForumOutlined, CalendarMonthOutlined
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import CalendarPage from './Calendar.jsx';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [doctorName, setDoctorName] = useState('');
    const [cases, setCases] = useState([]);
    const [editingCaseId, setEditingCaseId] = useState(null);
    const [newCaseName, setNewCaseName] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingCases, setLoadingCases] = useState(true);
    const [profileError, setProfileError] = useState(null);
    const [casesError, setCasesError] = useState(null);

    useEffect(() => {
        const fetchDoctorProfile = async () => {
            setLoadingProfile(true);
            setProfileError(null);
            try {
                const response = await axios.get('http://localhost:5000/api/doctor/profile', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setDoctorName(response.data.name);
            } catch (err) {
                console.error("Failed to fetch doctor profile:", err);
                const errorMsg = err.response?.data?.message || "Unable to load your profile information";
                setProfileError(errorMsg);
                toast.error(errorMsg);
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchDoctorProfile();
    }, []);

    useEffect(() => {
        const fetchCases = async () => {
            setLoadingCases(true);
            setCasesError(null);
            try {
                const response = await axios.get('http://localhost:5000/api/case/doctor/accepted', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setCases(response.data);
            } catch (err) {
                console.error("Failed to fetch cases:", err);
                const errorMsg = err.response?.data?.message || "Unable to load cases";
                setCasesError(errorMsg);
                if (!profileError) toast.error(errorMsg);
            } finally {
                setLoadingCases(false);
            }
        };
        if (!loadingProfile) {
             fetchCases();
        }
    }, [loadingProfile, profileError]);

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
            const response = await axios.get('http://localhost:5000/api/case/doctor/accepted', {
                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCases(response.data);
        } catch (error) {
            console.error('Error updating case name:', error);
            toast.error(error.response?.data?.message || 'Failed to update case name');
        }
    };

    const getGradient = (numDoctors) => {
        const primaryLight = theme.palette.primary.light || '#64b5f6';
        const primaryMain = theme.palette.primary.main || '#2196f3';
        const secondaryLight = theme.palette.secondary.light || '#ffb74d';
        const secondaryMain = theme.palette.secondary.main || '#ff9800';
        const successLight = theme.palette.success.light || '#81c784';
        const successMain = theme.palette.success.main || '#4caf50';
        const infoLight = theme.palette.info.light || '#ba68c8';
        const infoMain = theme.palette.info.main || '#9c27b0';

        if (numDoctors <= 1) return `linear-gradient(135deg, ${secondaryLight} 0%, ${secondaryMain} 100%)`;
        if (numDoctors === 2) return `linear-gradient(135deg, ${successLight} 0%, ${successMain} 100%)`;
        if (numDoctors === 3) return `linear-gradient(135deg, ${primaryLight} 0%, ${primaryMain} 100%)`;
        return `linear-gradient(135deg, ${infoLight} 0%, ${infoMain} 100%)`;
    };

    const quickActionCardStyle = {
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows[6],
        },
        borderTop: `4px solid transparent`
    };

    const cardActionAreaStyle = {
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        flexGrow: 1
    };

    return (
        <Layout> {/* Use Layout component */}
            <Container maxWidth="lg" sx={{ mb: 6 }}> {/* Rely on Layout's padding */}
                {/* Welcome Banner */}
                <Paper
                    elevation={4}
                    sx={{
                        p: { xs: 3, md: 4 },
                        mb: 5,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Decorative elements */}
                    <Box sx={{ position: 'absolute', top: -40, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', }} />
                    <Box sx={{ position: 'absolute', bottom: -50, left: -40, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', }} />

                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Grid container alignItems="center" spacing={2}>
                            <Grid item>
                                <Avatar
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        width: 64,
                                        height: 64,
                                        border: '2px solid rgba(255,255,255,0.5)'
                                    }}
                                >
                                    <LocalHospitalOutlined sx={{ fontSize: 36 }} />
                                </Avatar>
                            </Grid>
                            <Grid item xs>
                                <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 0.5 }}>
                                    {loadingProfile ? 'Loading...' : profileError ? 'Welcome' : `Welcome, Dr. ${doctorName}`}
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                    Manage your patient cases and consultation requests.
                                </Typography>
                                {profileError && <Alert severity="warning" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '& .MuiAlert-icon': { color: 'white' } }}>{profileError}</Alert>}
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>

                {/* Quick Actions */}
                <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 3 }}>
                    Quick Actions
                </Typography>
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    {/* Accepted Cases */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card elevation={3} sx={{ ...quickActionCardStyle, borderTopColor: theme.palette.primary.main }}>
                            <CardActionArea onClick={() => navigate('/accepted-cases')} sx={cardActionAreaStyle}>
                                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', mb: 2 }}>
                                    <CheckCircleOutline />
                                </Avatar>
                                <Typography variant="h6" fontWeight="medium" sx={{ mb: 1 }}>
                                    Accepted Cases
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                                    View and manage your active cases.
                                </Typography>
                                <Button variant="outlined" color="primary" size="small">
                                    View Cases
                                </Button>
                            </CardActionArea>
                        </Card>
                    </Grid>

                    {/* New Case Requests */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card elevation={3} sx={{ ...quickActionCardStyle, borderTopColor: theme.palette.success.main }}>
                             <CardActionArea onClick={() => navigate('/pending-cases')} sx={cardActionAreaStyle}>
                                <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark', mb: 2 }}>
                                    <NotificationsNone />
                                </Avatar>
                                <Typography variant="h6" fontWeight="medium" sx={{ mb: 1 }}>
                                    New Requests
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                                    Review pending case invitations.
                                </Typography>
                                <Button variant="outlined" color="success" size="small">
                                    View Requests
                                </Button>
                            </CardActionArea>
                        </Card>
                    </Grid>

                    {/* Doctor Forum */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card elevation={3} sx={{ ...quickActionCardStyle, borderTopColor: theme.palette.info.main }}>
                             <CardActionArea onClick={() => navigate('/doctor-forum')} sx={cardActionAreaStyle}>
                                <Avatar sx={{ bgcolor: 'info.light', color: 'info.dark', mb: 2 }}>
                                    <ForumOutlined />
                                </Avatar>
                                <Typography variant="h6" fontWeight="medium" sx={{ mb: 1 }}>
                                    Doctor Forum
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                                    Collaborate with other professionals.
                                </Typography>
                                <Button variant="outlined" color="info" size="small">
                                    Go to Forum
                                </Button>
                            </CardActionArea>
                        </Card>
                    </Grid>
                </Grid>

                {/* Calendar */}
                <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mt: 5, mb: 3 }}>
                    Your Calendar
                </Typography>
                <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <CalendarMonthOutlined color="action" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1" color="text.secondary">Upcoming Meetings & Events</Typography>
                    </Box>
                    <CalendarPage />
                </Paper>
             </Container>
        </Layout>
    );
}

export default DoctorDashboard;