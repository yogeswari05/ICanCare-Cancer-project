import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Fade,
  Paper,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff,
  Email,
  Lock,
  Person,
  LocalHospital,
  Phone,
  Home,
  Wc,
  Cake,
  MedicalServices
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";

function Auth() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get("mode") === "signup" ? "signup" : "login";
  const initialRole = queryParams.get("role") || "patient";
  
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [role, setRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [specializations, setSpecializations] = useState([
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
  ]);
  const [customSpecialization, setCustomSpecialization] = useState("");
  const [showCustomSpecialization, setShowCustomSpecialization] = useState(false);
  
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    age: "",
    gender: "",
    contact: "",
    address: "",
    location: "",
  });

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({
    email: "",
    password: "",
  });
  const [adminError, setAdminError] = useState("");

  const handleAdminLogin = () => {
    const { email, password } = adminCredentials;
    if (email === "admin@gmail.com" && password === "admin") {
      const token = btoa(`${email}:${password}`);
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", "admin");
      navigate("/admin-dashboard");
    } else {
      setAdminError("Invalid admin credentials");
    }
  };

  useEffect(() => {
    const mode = isLogin ? "login" : "signup";
    navigate(`/auth?mode=${mode}&role=${role}`, { replace: true });
  }, [isLogin, role, navigate]);
  useEffect(() => {
    const fetchApprovedSpecializations = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/doctor/specializations");
        if (response.data.specializations && response.data.specializations.length > 0) {
          setSpecializations(response.data.specializations);
        }
      } catch (error) {
        console.error("Error fetching specializations:", error);
      }
    };
    
    fetchApprovedSpecializations();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSpecializationChange = (e) => {
    const value = e.target.value;
    if (value === "other") {
      setShowCustomSpecialization(true);
      setFormData({
        ...formData,
        specialization: ""
      });
    } else {
      setShowCustomSpecialization(false);
      setFormData({
        ...formData,
        specialization: value
      });
    }
  };
  const handleCustomSpecializationChange = (e) => {
    setCustomSpecialization(e.target.value);
    setFormData({
      ...formData,
      specialization: e.target.value
    });
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setIsLogin(newValue === "login");
    setFormData({
      ...formData,
      password: ""
    });
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const validateInputs = () => {
    if (isLogin) {
      if (!formData.email) {
        toast.error("Email is required");
        return false;
      }
      if (!formData.password) {
        toast.error("Password is required");
        return false;
      }
    } else {
      if (!formData.name) {
        toast.error("Name is required");
        return false;
      }
      if (!formData.email) {
        toast.error("Email is required");
        return false;
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        toast.error("Invalid email format");
        return false;
      }
      if (!formData.password) {
        toast.error("Password is required");
        return false;
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return false;
      }

      if (role === "doctor" && !formData.specialization) {
        toast.error("Specialization is required for doctors");
        return false;
      }

      if (role === "doctor" && !formData.contact) {
        toast.error("Contact number is required for doctors");
        return false;
      }

      if (role === "patient") {
        if (!formData.age) {
          toast.error("Age is required for patients");
          return false;
        }
        if (!formData.gender) {
          toast.error("Gender is required for patients");
          return false;
        }
        if (!formData.contact) {
          toast.error("Contact number is required for patients");
          return false;
        }
        if (!formData.contact.match(/^\d{10}$/)) {
          toast.error("Contact number must be 10 digits");
          return false;
        }
      }
    }
    return true;
  };

  const handleAuth = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);

    try {
      const url = `http://localhost:5000/api/${role}/${isLogin ? "login" : "signup"}`;

      let payload;
      if (isLogin) {
        payload = {
          email: formData.email,
          password: formData.password,
        };
      } else {
        payload =
          role === "doctor"
            ? {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                specialization: formData.specialization,
                isNewSpecialization: showCustomSpecialization,
                contact: formData.contact,
                location: formData.location,
              }
            : {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                age: formData.age,
                gender: formData.gender,
                contact: formData.contact,
                address: formData.address,
              };
      }

      const response = await axios.post(url, payload);

      if (isLogin) {
        if (role === "doctor" && response.data.approvalStatus !== "approved") {
          toast.error("Your registration is pending admin approval.");
          setIsLoading(false);
          return;
        }

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", role);

        toast.success(response.data.message || "Login successful!");

        navigate("/dashboard");
      } else {
        toast.success("Sign up successful!");

        if (role === "doctor") {
          toast.info("Your registration is pending approval.", { autoClose: 5000 });
        }

        const savedEmail = formData.email;
        setFormData({
          ...formData,
          name: "",
          email: savedEmail,
          password: "",
          specialization: "",
          age: "",
          gender: "",
          contact: "",
          address: "",
          location: "",
        });

        setIsLogin(true);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Invalid credentials. Please try again.");
      } else if (error.response?.status === 409) {
        toast.error("Email already registered. Please login instead.");
      } else if (error.response?.status === 403 && role === "doctor") {
        toast.error(error.response.data.message || "Your registration is pending approval.");
      } else {
        const errorMessage = error.response?.data?.message || "Authentication failed";
        toast.error(errorMessage);
      }
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const tokenId = credentialResponse.credential;
      const res = await axios.post(
        `http://localhost:5000/api/${role}/google-login`,
        { tokenId }
      );
      console.log(res.data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userRole", role);
      
      toast.success("Google login successful!");

      if (res.data.profileIncomplete) {
        navigate(`/complete-profile?role=${role}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error.response.data.message);
      console.log(role);
      if (error.response?.status === 403 && role === "doctor") {
        toast.error(error.response.data.message || "Your registration is pending approval.");
      } else {
        toast.error(error.response?.data?.message || "Google authentication failed");
      }
      console.error("Google auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={5} sx={{ 
        borderRadius: 3, 
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)'
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          minHeight: '600px'
        }}>
          {/* Left side - ICanCare Branding */}
          <Box
            sx={{
              flex: '0 0 40%',
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              position: 'relative'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <MedicalServices sx={{ fontSize: 40, mr: 1 }} />
                <Typography variant="h3" fontWeight="bold">
                  ICanCare
                </Typography>
              </Box>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                {isLogin ? 'Welcome Back' : 'Join Us Today'}
              </Typography>
              <Typography variant="body1" paragraph>
                {isLogin 
                  ? 'Log in to access your secure healthcare portal and connect with specialists.'
                  : 'Create an account to start your healthcare journey with personalized care from our experts.'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 3, opacity: 0.8 }}>
                Your health information is secure with our HIPAA-compliant platform.
              </Typography>
            </Box>
            
            {/* Decorative circles */}
            <Box sx={{ 
              position: 'absolute', 
              bottom: -50, 
              right: -50, 
              width: 200, 
              height: 200, 
              borderRadius: '50%', 
              backgroundColor: 'rgba(255,255,255,0.1)' 
            }} />
            <Box sx={{ 
              position: 'absolute', 
              top: -30, 
              left: -30, 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              backgroundColor: 'rgba(255,255,255,0.1)' 
            }} />
          </Box>

          {/* Right side - Form */}
          <Box sx={{ 
            flex: '1 1 60%', 
            p: 4,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Tabs for login/signup */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={isLogin ? "login" : "signup"}
                onChange={handleTabChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Login" value="login" />
                <Tab label="Sign Up" value="signup" />
              </Tabs>
            </Box>

            {/* Role selection */}
            <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
              <InputLabel id="role-label">I am a</InputLabel>
              <Select
                labelId="role-label"
                value={role}
                onChange={handleRoleChange}
                label="I am a"
              >
                <MenuItem value="patient">Patient</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
              </Select>
            </FormControl>

            {/* Form fields */}
            <Fade in={true} timeout={500}>
              <Box 
                component="form" 
                noValidate 
                autoComplete="off" 
                sx={{ 

                  flexGrow: 1,
                  display: 'flex',
                  gap: 2,
                  flexDirection: 'column'
                }}
              >
                {!isLogin && (
                  <TextField
                    required
                    fullWidth
                    
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}

                <TextField
                  required
                  fullWidth
                  
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  required
                  fullWidth
                 
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={toggleShowPassword} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

{!isLogin && role === "doctor" && (
  <>
    <FormControl required fullWidth>
      <InputLabel>Specialization</InputLabel>
      <Select
        value={showCustomSpecialization ? "other" : formData.specialization}
        onChange={handleSpecializationChange}
        label="Specialization"
        startAdornment={
          <InputAdornment position="start">
            <LocalHospital />
          </InputAdornment>
        }
      >
        {specializations.map((spec) => (
          <MenuItem key={spec} value={spec}>
            {spec}
          </MenuItem>
        ))}
        <MenuItem value="other">Other (please specify)</MenuItem>
      </Select>
    </FormControl>
    
    {showCustomSpecialization && (
      <TextField
        required
        fullWidth
        label="Custom Specialization"
        value={customSpecialization}
        onChange={handleCustomSpecializationChange}
        placeholder="Enter your specialization"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LocalHospital />
            </InputAdornment>
          ),
        }}
      />
    )}
    <TextField
      required
      fullWidth
      label="Contact"
      name="contact"
      value={formData.contact}
      onChange={handleChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Phone />
          </InputAdornment>
        ),
      }}
    />
    <TextField
      required
      fullWidth
      label="Location"
      name="location"
      value={formData.location}
      onChange={handleChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Home />
          </InputAdornment>
        ),
      }}
    />
  </>
)}

                {!isLogin && role === "patient" && (
                  <>
                    <TextField
                      required
                      fullWidth
                      
                      label="Contact"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      required
                      fullWidth
                      
                      label="Age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Cake />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <FormControl required fullWidth margin="normal">
                      <InputLabel>Gender</InputLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        label="Gender"
                        startAdornment={
                          <InputAdornment position="start">
                            <Wc />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      
                      label="Address"
                      name="address"
                      multiline
                      rows={2}
                      value={formData.address}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Home />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </>
                )}

                <Box sx={{ mt: 'auto', pt: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleAuth}
                    disabled={isLoading}
                    sx={{ 
                      py: 1.5, 
                      fontSize: '1.1rem',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                    }}
                  >
                    {isLoading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
                  </Button>

                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    <Typography variant="body2">
                      {isLogin
                        ? "Don't have an account?"
                        : "Already have an account?"}
                      <Button
                        color="secondary"
                        onClick={() => setIsLogin(!isLogin)}
                        sx={{ ml: 1, fontWeight: 'bold' }}
                      >
                        {isLogin ? "Sign Up" : "Login"}
                      </Button>
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ flex: 1, height: 1, bgcolor: 'grey.200' }}></Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                      or continue with
                    </Typography>
                    <Box sx={{ flex: 1, height: 1, bgcolor: 'grey.200' }}></Box>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                    <GoogleLogin
                      buttonText="Sign in with Google"
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error("Google Sign-In failed")}
                      auto_select={false}
                    />
                  </Box>
                </Box>
              </Box>
            </Fade>
            <Box sx={{ mt: 4, textAlign: "center" }}>
              {!showAdminLogin ? (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowAdminLogin(true)}
                >
                  Continue as Admin
                </Button>
              ) : (
                <Box>
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    value={adminCredentials.email}
                    onChange={(e) =>
                      setAdminCredentials({ ...adminCredentials, email: e.target.value })
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={adminCredentials.password}
                    onChange={(e) =>
                      setAdminCredentials({
                        ...adminCredentials,
                        password: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                  />
                  {adminError && (
                    <Typography color="error" sx={{ mb: 2 }}>
                      {adminError}
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAdminLogin}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Login as Admin
                  </Button>
                  <Button
                    variant="text"
                    color="secondary"
                    onClick={() => setShowAdminLogin(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Auth;