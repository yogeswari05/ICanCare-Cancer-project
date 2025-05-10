import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
    Container, 
    Typography, 
    Box, 
    Card, 
    CardContent,
    CardActions,
    Button,
    Grid,
    Alert,
    CircularProgress
} from '@mui/material';
import axios from 'axios';
import NavBar from '../components/NavBar.jsx';

const PendingCases = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    if (!localStorage.getItem('token')) {
        return <Navigate to="/auth" />;
    }
    useEffect(() => {
        fetchPendingCases();
    }, []);

    const fetchPendingCases = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/case/doctor/pending', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCases(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleCaseResponse = async (caseId, status) => {
        try {
            await axios.post(`http://localhost:5000/api/case/${caseId}/respond`, 
                { status },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
            );
            fetchPendingCases();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <>
                <NavBar />
                <Container sx={{ mt: -80, display: 'flex', justifyContent: 'center' }}>
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
                    Pending Case Requests
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {cases.length === 0 ? (
                    <Alert severity="info">No pending cases found</Alert>
                ) : (
                    <Grid container spacing={3}>
                        {cases.map((case_) => (
                            <Grid item xs={12} sm={6} md={4} key={case_._id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Case ID: {case_._id.slice(-6)}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            Patient: {case_.patientId?.name || 'Unknown'}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            Age: {case_.patientId?.age || 'N/A'}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            Gender: {case_.patientId?.gender || 'N/A'}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            Created: {new Date(case_.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                        <Button 
                                            variant="contained" 
                                            color="success"
                                            onClick={() => handleCaseResponse(case_._id, 'approved')}
                                        >
                                            Accept
                                        </Button>
                                        <Button 
                                            variant="contained" 
                                            color="error"
                                            onClick={() => handleCaseResponse(case_._id, 'rejected')}
                                        >
                                            Reject
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

export default PendingCases;