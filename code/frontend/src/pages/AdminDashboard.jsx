import { useEffect, useState } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Container,
  Button,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
} from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [approvedDoctors, setApprovedDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "admin") {
      toast.error("Unauthorized access");
      navigate("/auth?mode=login");
    }
  }, [navigate]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        axios.get("http://localhost:5000/api/doctor/pending", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get("http://localhost:5000/api/doctor/approved", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);
      setPendingDoctors(pendingRes.data);
      setApprovedDoctors(approvedRes.data);
    } catch (error) {
      toast.error("Error fetching doctors");
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleApproval = async (doctorId, status) => {
    try {
      const normalizedStatus = status.toLowerCase();

      await axios.put(
        `http://localhost:5000/api/doctor/approve/${doctorId}`,
        { approvalStatus: normalizedStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      toast.success(
        `Doctor ${normalizedStatus === "approved" ? "approved" : "denied"}`
      );

      setPendingDoctors((prev) => prev.filter((doc) => doc._id !== doctorId));
      if (normalizedStatus === "approved") {
        const doctor = pendingDoctors.find((doc) => doc._id === doctorId);
        setApprovedDoctors((prev) => [
          ...prev,
          { ...doctor, approvalStatus: "approved" },
        ]);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    }
  };

  const handleViewReviews = async (doctorId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/doctor/${doctorId}/reviews`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setReviews(response.data);
      setSelectedDoctor(approvedDoctors.find((doc) => doc._id === doctorId));
    } catch (error) {
      toast.error("Error fetching reviews");
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    toast.info("Logged out successfully");
    navigate("/auth?mode=login");
  };

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="secondary"
          textColor="inherit"
          centered
        >
          <Tab label="Pending Approvals" />
          <Tab label="Approved Doctors" />
        </Tabs>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ mt: 4 }}>
        {tabValue === 0 && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5">Pending Doctor Approvals</Typography>
            {loading ? (
              <Typography>Loading...</Typography>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  mt: 2,
                }}
              >
                {pendingDoctors.map((doctor) => (
                  <Card key={doctor._id}>
                    <CardContent>
                      <Typography variant="h6">{doctor.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {doctor.specialization}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        color="success"
                        onClick={() => handleApproval(doctor._id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        color="error"
                        onClick={() => handleApproval(doctor._id, "denied")}
                      >
                        Deny
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        )}

        {tabValue === 1 && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5">Approved Doctors</Typography>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                mt: 2,
              }}
            >
              {approvedDoctors.map((doctor) => (
                <Card key={doctor._id}>
                  <CardContent>
                    <Typography variant="h6">{doctor.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {doctor.specialization}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <Rating
                        value={doctor.averageRating || 0}
                        readOnly
                        precision={0.5}
                      />
                      {doctor.averageRating === 0 && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          No reviews
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      color="primary"
                      onClick={() => handleViewReviews(doctor._id)}
                    >
                      View Comments
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </Paper>
        )}
      </Container>

      <Dialog
        open={Boolean(selectedDoctor)}
        onClose={() => setSelectedDoctor(null)}
      >
        <DialogTitle>Doctor Details</DialogTitle>
        <DialogContent>
          {selectedDoctor && (
            <>
              <Typography>Name: {selectedDoctor.name}</Typography>
              <Typography>Email: {selectedDoctor.email}</Typography>
              <Typography>
                Specialization: {selectedDoctor.specialization}
              </Typography>
              <Typography>Status: {selectedDoctor.approvalStatus}</Typography>
              <Box mt={2}>
                <Typography variant="h6">Reviews</Typography>
                {reviews.length === 0 ? (
                  <Typography>No reviews available</Typography>
                ) : (
                  reviews.map((review) => (
                    <Box key={review._id} mb={2}>
                      <Rating value={review.rating} readOnly precision={0.5} />
                      <Typography variant="body2">{review.comment}</Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        - {review.patientName}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDoctor(null)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AdminDashboard;
