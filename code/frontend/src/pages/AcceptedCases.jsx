import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
    Container, 
    Typography, 
    Box, 
    Card, 
    CardContent,
    CardActions,
    Grid,
    CircularProgress,
    Alert,
    Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar.jsx';

const AcceptedCases = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    if (!localStorage.getItem('token')) {
        return <Navigate to="/auth" />;
    }
    useEffect(() => {
        const fetchAcceptedCases = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/case/doctor/accepted', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setCases(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchAcceptedCases();
    }, []);

    const handleViewCase = (caseId) => {
        navigate(`/case/${caseId}`);
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

    return (
        <>
            <NavBar />
            <Container maxWidth="lg" sx={{ mt: -80, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    My Accepted Cases
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {cases.length === 0 ? (
                    <Alert severity="info">No accepted cases found</Alert>
                ) : (
                    <Grid container spacing={3}>
                        {cases.map((case_) => (
                            <Grid item xs={12} sm={6} md={4} key={case_._id}>
                                <Card sx={{ 
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {/* Case ID: {case_._id.slice(-6)} */}
                                            {case_.patientId?.name || 'Unknown'}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {/* Patient: {case_.patientId?.name || 'Unknown'} */}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            Age: {case_.patientId?.age || 'N/A'}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            Gender: {case_.patientId?.gender || 'N/A'}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            Contact: {case_.patientId?.contact || 'N/A'}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            Created: {new Date(case_.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ p: 2 }}>
                                        <Button 
                                            fullWidth
                                            variant="contained" 
                                            color="primary"
                                            onClick={() => handleViewCase(case_._id)}
                                        >
                                            View Details
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </>
    );
};

export default AcceptedCases;