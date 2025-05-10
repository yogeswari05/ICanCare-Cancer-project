import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';

const Dashboard = () => {
    const [userType, setUserType] = useState(null);
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            console.log('Decoded token: ');
            console.log(decoded);
            setUserType(decoded.role);
        }
    }, []);

    if (!localStorage.getItem('token')) {
        return <Navigate to="/auth" />;
    }

    if (userType === 'doctor') {
        console.log(userType);
        return <DoctorDashboard />;
    }

    if (userType === 'patient') {
        console.log(userType);
        return <PatientDashboard />;
    }

    return null;
};

export default Dashboard;