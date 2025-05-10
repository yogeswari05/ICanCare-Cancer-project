import { useNavigate } from "react-router-dom";
import { Container, Button, Typography, Paper, Box } from "@mui/material";

function AdminOrDoctor() {
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Choose Your Role
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
          <Button variant="contained" color="primary" onClick={() => navigate("/dashboard")}>
            Proceed as Doctor
          </Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/admin-dashboard")}>
            Proceed as Admin
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default AdminOrDoctor;
