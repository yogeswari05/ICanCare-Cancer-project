import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  useMediaQuery,
  useTheme,
  MenuItem,
  Menu,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  AccountCircle,
  Menu as MenuIcon,
  MedicalServices,
  AccessTime,
  CheckCircle,
  Logout,
  Person,
  Settings,
  Chat,
  ArrowBack,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import axios from "axios";

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userData, setUserData] = useState(null);

  const isAuthenticated = !!localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const isDoctor = userRole === "doctor";
  const isAdmin = userRole === "admin";
  const isPatient = userRole === "patient";

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated) {
        try {
          const endpoint =
            userRole === "doctor"
              ? "doctor/profile"
              : userRole === "admin"
              ? "admin/profile"
              : "patient/profile";

          const response = await axios.get(
            `http://localhost:5000/api/${endpoint}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          setUserData(response.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, userRole]);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    toast.info("You have been logged out");
    navigate("/");
    handleMenuClose();
  };

  const navItems = [
    {
      text: "Dashboard",
      path: "/dashboard",
      icon: <DashboardIcon />,
      visible: isAuthenticated,
    },
    {
      text: "Profile",
      path: "/profile",
      icon: <Person />,
      visible: isAuthenticated,
    },
  ];

  if (isDoctor) {
    navItems.push(
      {
        text: "Pending Cases",
        path: "/pending-cases",
        icon: <AccessTime />,
        visible: true,
      },
      {
        text: "Accepted Cases",
        path: "/accepted-cases",
        icon: <CheckCircle />,
        visible: true,
      }
    );
  }

  const renderDrawer = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box
        sx={{
          py: 2,
          px: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <MedicalServices sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h5" fontWeight="bold">
          ICanCare
        </Typography>
      </Box>
      <Divider />
      {isAuthenticated && userData && (
        <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
          <Avatar
            alt={userData.name || "User"}
            src={userData.profilePic}
            sx={{ width: 40, height: 40, mr: 2 }}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {userData.name || "User"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </Typography>
          </Box>
        </Box>
      )}
      <Divider />
      <List>
        {navItems
          .filter((item) => item.visible)
          .map((item) => (
            <ListItem
              button
              key={item.text}
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                "&.Mui-selected": {
                  bgcolor: "rgba(25, 118, 210, 0.12)",
                  borderRight: "3px solid",
                  borderColor: "primary.main",
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <AppBar
        position="static"
        elevation={1}
        color="default"
        sx={{ bgcolor: "white" ,}}
      >
        <Toolbar>
          {isAuthenticated && isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            {/* Add back button on mobile for navigation */}
            {isMobile &&
              location.pathname !== "/" &&
              location.pathname !== "/dashboard" && (
                <IconButton
                  color="primary"
                  sx={{ mr: 1 }}
                  onClick={() => navigate(-1)}
                >
                  <ArrowBack />
                </IconButton>
              )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => navigate("/")}
            >
              <MedicalServices color="primary" sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" color="primary" fontWeight="bold">
                ICanCare
              </Typography>
            </Box>
          </Box>

          {!isAuthenticated ? (
            <Box>
              <Button
                color="primary"
                onClick={() => navigate("/auth?mode=login")}
                sx={{ mr: 1 }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/auth?mode=signup")}
              >
                Sign Up
              </Button>
            </Box>
          ) : (
            <>
              {!isMobile && (
                <Box sx={{ display: "flex" }}>
                  {navItems
                    .filter((item) => item.visible)
                    .map((item) => (
                      <Button
                        key={item.text}
                        component={RouterLink}
                        to={item.path}
                        color="inherit"
                        sx={{
                          mx: 1,
                          color:
                            location.pathname === item.path
                              ? "primary.main"
                              : "text.primary",
                          fontWeight:
                            location.pathname === item.path ? "bold" : "normal",
                          "&:hover": {
                            bgcolor: "rgba(25, 118, 210, 0.04)",
                          },
                        }}
                      >
                        {item.text}
                      </Button>
                    ))}
                </Box>
              )}

              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                {userData?.profilePic ? (
                  <Avatar
                    alt={userData.name}
                    src={userData.profilePic}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>

              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    navigate("/profile");
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="inherit">Profile</Typography>
                </MenuItem>
                {/* <MenuItem onClick={() => {
                  navigate('/settings');
                  handleMenuClose();
                }}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="inherit">Settings</Typography>
                </MenuItem> */}
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="inherit">Logout</Typography>
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {renderDrawer()}
      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
        }}
      >
        {/* CORRECTED: Use positive padding values */}
        <Container maxWidth="xl" sx={{ py: 3 }}> {/* Adjust py: 3 as needed */}
          {children}
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          backgroundColor: (theme) => theme.palette.grey[200],
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} ICanCare. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
