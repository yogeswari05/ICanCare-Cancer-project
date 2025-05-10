import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Paper
} from "@mui/material";
import { 
  MedicalServices, 
  VideoCall, 
  People, 
  Security,
  SupportAgent
} from "@mui/icons-material";

function Start() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("token");

  return (
    <>
      
      <Paper
        sx={{
          position: "relative",
          backgroundColor: "grey.800",
          color: "#fff",
          mb: 4,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundImage: `url(https://source.unsplash.com/random?hospital,healthcare)`,
          borderRadius: 4,
          overflow: "hidden"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,.5)"
          }}
        />
        
        <Box
          sx={{
            position: "relative",
            p: { xs: 3, md: 6 },
            minHeight: 500,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center"
          }}
        >
          <Typography 
            component="h1" 
            variant="h2"
            color="inherit" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              maxWidth: "800px"
            }}
          >
            Welcome to ICanCare
          </Typography>
          <Typography 
            variant="h5" 
            color="inherit" 
            paragraph
            sx={{ 
              mb: 4, 
              maxWidth: "700px"
            }}
          >
            Connect with healthcare professionals from the comfort of your home
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: "center" }}>
            {isAuthenticated ? (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/dashboard")}
                sx={{ px: 4, py: 1.5, borderRadius: 2 }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/auth?mode=login")}
                  sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  
                  onClick={() => navigate("/auth?mode=signup")}
                  sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/public-doctors')}
            sx={{ mt: 2 }}
          >
            Associated Doctors
          </Button>
        </Box>
      </Paper>

      
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 6, textAlign: 'center' }}>
          How It Works
        </Typography>
        
        <Grid container spacing={4}>
          {[
            { title: "Find Specialists", icon: <People fontSize="large" color="primary" />, 
              desc: "Browse through our network of qualified cancer healthcare professionals." },
            { title: "Secure Consultations", icon: <VideoCall fontSize="large" color="primary" />, 
              desc: "Connect with doctors through secure consultations." },
            { title: "Medical Records", icon: <MedicalServices fontSize="large" color="primary" />, 
              desc: "Safely share and store your medical records for better diagnosis." },
            { title: "Privacy First", icon: <Security fontSize="large" color="primary" />, 
              desc: "Your health data is encrypted and protected with highest security standards." }
          ].map((feature, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="h3">
                    {feature.title}
                  </Typography>
                  <Typography>
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      
      <Paper sx={{ 
        p: 6, 
        my: 6, 
        backgroundColor: 'primary.main', 
        color: 'white',
        borderRadius: 4
      }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom>
            Ready to get started?
          </Typography>
          <Typography variant="h6" align="center" paragraph>
            Join thousands of patients who trust our platform for their healthcare needs.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              size="large"
              color="secondary"
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth?mode=signup")}
              sx={{ px: 4, py: 1.5 }}
            >
              {isAuthenticated ? "Go to Dashboard" : "Create an Account"}
            </Button>
          </Box>
        </Container>
      </Paper>

     
      <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          ICanCare
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" component="p">
          © {new Date().getFullYear()} ICanCare. All rights reserved.
        </Typography>
      </Box>
    </>
  );
}

export default Start;