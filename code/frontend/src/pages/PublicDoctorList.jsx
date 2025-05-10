import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    Container, 
    Typography, 
    Card, 
    CardContent,
    CardActions, 
    Grid,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Box,
    CircularProgress,
    Button,
    Alert,
    Snackbar,
    Paper,
    Chip,
    Avatar,
    IconButton,
    InputAdornment,
    TextField,
    Divider,
    Skeleton,
    useTheme,
    Fade,
    Tooltip,
    Badge
} from '@mui/material';
import { 
    Person,
    Search,
    LocalHospital,
    FilterList,
    Email,
    Add,
    MedicalServices,
    CheckCircle,
    LocationOn,
    Star,
    ArrowBack
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const DoctorList = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [specialization, setSpecialization] = useState('all');
    const [specializations, setSpecializations] = useState([]);
    const [addingDoctor, setAddingDoctor] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [location, setLocation] = useState('');
    const [sortOption, setSortOption] = useState('name'); 

    const navigate = useNavigate();
    const pendingCaseId = localStorage.getItem('pendingCaseId');
    const theme = useTheme();

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/doctor/all');
                setDoctors(response.data);
                const uniqueSpecializations = [...new Set(response.data.map(doc => doc.specialization))];
                setSpecializations(uniqueSpecializations);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    const handleAddDoctorToCase = async (doctorId) => {
        try {
            setAddingDoctor(true);
            await axios.post(`http://localhost:5000/api/case/add-doctor`, 
                { caseId: pendingCaseId, doctorId },
                {
                    headers: { 
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            toast.success('Doctor added successfully!');
            localStorage.removeItem('pendingCaseId');
            setTimeout(() => navigate(`/case/${pendingCaseId}`), 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding doctor');
        } finally {
            setAddingDoctor(false);
        }
    };

    const filteredDoctors = doctors
        .filter(doctor => 
            (specialization === 'all' || doctor.specialization === specialization) &&
            (searchTerm === '' || 
                doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (doctor.location && doctor.location.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        );

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const sortedDoctors = [...filteredDoctors].sort((a, b) => {
        if (sortOption === 'rating') {
            return (b.averageRating || 0) - (a.averageRating || 0);
        }
        return a.name.localeCompare(b.name);
    });

    const getRandomColor = (str) => {
        const colors = [
            theme.palette.primary.main,
            theme.palette.secondary.main,
            '#e53935',
            '#43a047',
            '#fb8c00',
            '#8e24aa',
            '#0288d1',
        ];
        
        const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    if (loading) {
        return (
            <>
                <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
                    <Box sx={{ mb: 4 }}>
                        <Skeleton variant="rectangular" width="40%" height={40} sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" width="20%" height={56} />
                    </Box>
                    <Grid container spacing={3}>
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item}>
                                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                    <CardContent>
                                        <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
                                        <Skeleton variant="text" width="70%" height={32} sx={{ mb: 1 }} />
                                        <Skeleton variant="text" width="50%" height={20} sx={{ mb: 1 }} />
                                        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
                                        <Skeleton variant="rectangular" width="100%" height={36} />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Container maxWidth="lg" sx={{ mt: 10 }}>
                    <Alert 
                        severity="error" 
                        sx={{ 
                            py: 2, 
                            borderRadius: 3,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Typography variant="subtitle1">Error loading doctors: {error}</Typography>
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
            </>
        );
    }

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
                <Button 
                    startIcon={<ArrowBack />} 
                    variant="outlined" 
                    onClick={() => navigate('/')} 
                    sx={{ mb: 2 }}
                >
                    Go Back
                </Button>
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 3, 
                        mb: 4, 
                        borderRadius: 3, 
                        background: pendingCaseId 
                            ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)'
                            : 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Box 
                        sx={{ 
                            position: 'absolute',
                            top: -15,
                            right: -15,
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                            zIndex: 0
                        }}
                    />
                    <Box 
                        sx={{ 
                            position: 'absolute',
                            bottom: -25,
                            left: -25,
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                            zIndex: 0
                        }}
                    />
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Box display="flex" alignItems="center" gap={1.5}>
                                    {pendingCaseId ? (
                                        <Add sx={{ fontSize: 36 }} />
                                    ) : (
                                        <MedicalServices sx={{ fontSize: 36 }} />
                                    )}
                                    <Typography variant="h4" fontWeight="bold">
                                        {pendingCaseId ? 'Select a Doctor' : 'Our Specialist Doctors'}
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ mt: 1, ml: 0.5 }}>
                                    {pendingCaseId 
                                        ? 'Choose a specialist to add to your case' 
                                        : 'Browse our network of qualified healthcare professionals'}
                                </Typography>
                            </Box>
                            {pendingCaseId && (
                                <Chip 
                                    icon={<MedicalServices sx={{ color: 'white !important' }}/>} 
                                    label={`Case #${pendingCaseId.slice(-6).toUpperCase()}`}
                                    sx={{ 
                                        bgcolor: 'rgba(255,255,255,0.2)', 
                                        color: 'white',
                                        fontWeight: 500,
                                        '& .MuiChip-icon': { color: 'white' }
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                </Paper>
                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' }, 
                        justifyContent: 'space-between',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        gap: 2,
                        mb: 4 
                    }}
                >
                    <Box sx={{ flex: 1 }}>
                        <TextField
                            fullWidth
                            placeholder="Search by name, specialization, or location"
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Box>
                    <FormControl sx={{ minWidth: { xs: '100%', sm: 220 } }}>
                        <InputLabel>Specialization</InputLabel>
                        <Select
                            value={specialization}
                            label="Specialization"
                            onChange={(e) => setSpecialization(e.target.value)}
                            startAdornment={
                                <InputAdornment position="start">
                                    <FilterList color="action" />
                                </InputAdornment>
                            }
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="all">All Specializations</MenuItem>
                            {specializations.map((spec) => (
                                <MenuItem key={spec} value={spec}>
                                    {spec}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: { xs: '100%', sm: 220 } }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={sortOption}
                            label="Sort By"
                            onChange={handleSortChange}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="name">Name</MenuItem>
                            <MenuItem value="rating">Rating</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box 
                    sx={{ 
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        mb: 4,
                        gap: 2
                    }}
                >
                    <Typography variant="subtitle1" color="text.secondary">
                        {sortedDoctors.length} {sortedDoctors.length === 1 ? 'doctor' : 'doctors'} found
                    </Typography>
                    {specialization !== 'all' && (
                        <Chip
                            label={`Specialization: ${specialization}`}
                            onDelete={() => setSpecialization('all')}
                            color="primary"
                            variant="outlined"
                            size="small"
                        />
                    )}
                </Box>
                {sortedDoctors.length === 0 ? (
                    <Paper 
                        elevation={0}
                        sx={{ 
                            p: 4, 
                            textAlign: 'center',
                            borderRadius: 3,
                            backgroundColor: '#f8f9fa',
                            border: '1px dashed #ccc'
                        }}
                    >
                        <Person sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No doctors found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Try adjusting your search or filter criteria
                        </Typography>
                    </Paper>
                ) : (
                    <Fade in={true}>
                        <Grid container spacing={3}>
                            {sortedDoctors.map((doctor) => (
                                <Grid item xs={12} sm={6} md={4} key={doctor._id}>
                                    <Card 
                                        sx={{ 
                                            height: '100%', 
                                            borderRadius: 3,
                                            position: 'relative',
                                            overflow: 'visible',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                            transition: 'transform 0.3s, box-shadow 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                                            }
                                        }}
                                    >
                                        {doctor.isAdmin === "Yes" && (
                                            <Tooltip title="Admin Doctor" placement="top">
                                                <Badge
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -10,
                                                        right: -10,
                                                        zIndex: 10,
                                                        '& .MuiBadge-badge': {
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: '50%',
                                                            background: theme.palette.primary.main,
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                                        }
                                                    }}
                                                    badgeContent={
                                                        <CheckCircle fontSize="small" sx={{ color: 'white', width: 16, height: 16 }} />
                                                    }
                                                />
                                            </Tooltip>
                                        )}
                                        <CardContent sx={{ pt: 3 }}>
                                            <Box 
                                                display="flex" 
                                                alignItems="center"
                                                gap={2}
                                                mb={2}
                                            >
                                                <Avatar 
                                                    sx={{ 
                                                        width: 56, 
                                                        height: 56, 
                                                        bgcolor: getRandomColor(doctor.name),
                                                        boxShadow: '0 3px 6px rgba(0,0,0,0.16)'
                                                    }}
                                                >
                                                    {doctor.name.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography 
                                                        variant="h6" 
                                                        component="h2" 
                                                        gutterBottom
                                                        sx={{ fontWeight: 500, mb: 0.5 }}
                                                    >
                                                        Dr. {doctor.name}
                                                    </Typography>
                                                    <Chip
                                                        icon={<LocalHospital sx={{ fontSize: '16px !important' }} />}
                                                        label={doctor.specialization}
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                        sx={{ 
                                                            height: 24,
                                                            '& .MuiChip-label': {
                                                                fontSize: '0.75rem'
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                            
                                            <Divider sx={{ my: 2 }} />
                                            
                                            <Box 
                                                sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center',
                                                    gap: 1, 
                                                    mb: 1
                                                }}
                                            >
                                                <Email fontSize="small" color="action" />
                                                <Typography 
                                                    variant="body2" 
                                                    color="text.secondary" 
                                                    sx={{ 
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    {doctor.email}
                                                </Typography>
                                            </Box>

                                            {doctor.averageRating > 0 && (
                                                <Box 
                                                    sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center',
                                                        gap: 1, 
                                                        mb: 1
                                                    }}
                                                >
                                                    <Star fontSize="small" color="action" />
                                                    <Typography 
                                                        variant="body2" 
                                                        color="text.secondary" 
                                                        sx={{ 
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}
                                                    >
                                                        {doctor.averageRating.toFixed(1)}
                                                    </Typography>
                                                </Box>
                                            )}
                                            
                                            {doctor.isAdmin === "Yes" && (
                                                <Box 
                                                    sx={{ 
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        mt: 1,
                                                        p: 0.75,
                                                        borderRadius: 1,
                                                        bgcolor: 'rgba(25, 118, 210, 0.08)'
                                                    }}
                                                >
                                                    <CheckCircle 
                                                        fontSize="small" 
                                                        color="primary" 
                                                        sx={{ mr: 1 }} 
                                                    />
                                                    <Typography 
                                                        variant="body2" 
                                                        color="primary"
                                                        fontWeight="medium"
                                                    >
                                                        Senior Medical Consultant
                                                    </Typography>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Fade>
                )}
            </Container>
        </>
    );
};

export default DoctorList;