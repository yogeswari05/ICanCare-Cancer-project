import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CompleteProfile() {
  const [specialization, setSpecialization] = useState("");
  const [doctorLocation, setDoctorLocation] = useState("");
  const [contact, setContact] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get("role") || "doctor";

  const specializations = [
    "Medical Oncology",
    "Surgical Oncology",
    "Radiation Oncology",
    "Hematology Oncology",
    "Gynecologic Oncology",
    "Pediatric Oncology",
    "Neuro-Oncology",
    "Breast Cancer Specialist",
    "Lung Cancer Specialist",
    "Gastrointestinal Oncology",
    "Genitourinary Oncology"
  ];

  const handleSubmit = async () => {
    if (role === "doctor" && (!specialization || !doctorLocation)) {
      toast.error("Specialization and location are required!");
      return;
    }
    if (role === "patient" && (!contact || !gender || !address || !age)) {
      toast.error("All fields are required!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = role === "doctor" ? { specialization, location: doctorLocation } : { contact, gender, address, age };
      const response = await axios.post(
        `http://localhost:5000/api/${role}/complete-profile`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Profile updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed!");
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <ToastContainer position="top-right" autoClose={3000} />
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Complete Your Profile
        </Typography>

        <Box component="form" sx={{ mt: 2 }}>
          {role === "doctor" && (
            <>
              <FormControl required fullWidth margin="normal">
                <InputLabel>Specialization</InputLabel>
                <Select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  label="Specialization"
                >
                  {specializations.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                required
                fullWidth
                margin="normal"
                label="Location"
                value={doctorLocation}
                onChange={(e) => setDoctorLocation(e.target.value)}
              />
            </>
          )}
          {role === "patient" && (
            <>
              <TextField
                required
                fullWidth
                margin="normal"
                label="Contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
              <TextField
                required
                fullWidth
                margin="normal"
                label="Age"
                value={age}
                type="number"
                onChange={(e) => setAge(e.target.value)}
              />
              <FormControl required fullWidth margin="normal">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                required
                fullWidth
                margin="normal"
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </>
          )}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default CompleteProfile;
