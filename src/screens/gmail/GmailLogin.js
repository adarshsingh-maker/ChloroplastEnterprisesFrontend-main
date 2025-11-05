import { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Link,
  Box,
  Typography,
  Container,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Fade,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import GoogleIcon from "@mui/icons-material/Google";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { postData } from "../../services/FetchNodeServices";
import futurecraftLogo from "../../assets/futurecraftlogo.jpg";

// Footer
function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://www.futurecraft.tech/">
        FutureCraft
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const defaultTheme = createTheme({
  palette: {
    background: {
      default: "#f5f7fb",
    },
    primary: {
      main: "#42a5f5",
    },
    secondary: {
      main: "#66bb6a",
    },
  },
  shape: {
    borderRadius: 12,
  },
});

// Random password generator
const generatePassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export default function GmailLogin() {
  const [emailid, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(false);
  const navigate = useNavigate();

  const roles = [
    { value: "IT", label: "IT Department", color: "#2196F3" },
    { value: "HR", label: "Human Resources", color: "#4CAF50" },
    { value: "FINANCE", label: "Finance", color: "#FF9800" },
    { value: "OPERATIONS", label: "Operations", color: "#9C27B0" },
    { value: "SALES", label: "Sales", color: "#F44336" },
    { value: "SUPER_ADMIN", label: "Super Admin", color: "#9C27B0" },
  ];

  useEffect(() => {
    const autoPassword = generatePassword();
    setPassword(autoPassword);
  }, []);

  const handleSubmit = async () => {
    if (!emailid) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter your email address",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
      });
      return;
    }

    if (!isLoginMode && !selectedRole) {
      Swal.fire({
        icon: "error",
        title: "Role Required",
        text: "Please select your department role",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
      });
      return;
    }

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailid)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
      });
      return;
    }

    try {
      let result;
      if (isLoginMode) {
        const body = { emailid, password };
        result = await postData("gmail/gmaillogin", body);
        if (result.status) {
          const userData = {
            emailid,
            role: result.role || "USER",
            department: result.department || "General",
            token: result.token || "temp_token",
          };
          localStorage.setItem("GMAIL_USER", JSON.stringify(userData));
          localStorage.setItem("TOKEN", result.token || "temp_token");
          Swal.fire({
            icon: "success",
            title: "Login Successful!",
            text: `Welcome back, ${emailid}`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
          }).then(() => {
            navigate("/dashboard");
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: result.message || "Invalid email or password",
            timer: 3000,
            showConfirmButton: false,
            toast: true,
          });
        }
      } else {
        const body = { emailid, password, role: selectedRole };
        result = await postData("gmail/gmailsubmit", body);
        if (result.status) {
          const userData = {
            emailid,
            role: selectedRole,
            department: roles.find((r) => r.value === selectedRole)?.label,
            token: result.token || "temp_token",
          };
          localStorage.setItem("GMAIL_USER", JSON.stringify(userData));
          localStorage.setItem("TOKEN", result.token || "temp_token");
          Swal.fire({
            icon: "success",
            title: "Account Created!",
            text: `${roles.find((r) => r.value === selectedRole)?.label} user ${emailid} registered successfully`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
          }).then(() => {
            navigate("/dashboard");
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Registration Failed",
            text:
              result.message ||
              "This email is already registered. Please login instead.",
            timer: 5000,
            showConfirmButton: false,
            toast: true,
          });
        }
      }
    } catch (error) {
      console.error("Login/Register error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Something went wrong. Please try again.",
        timer: 5000,
        showConfirmButton: false,
        toast: true,
      });
    }
  };

  const generateNewPassword = () => {
    const newPassword = generatePassword();
    setPassword(newPassword);
    Swal.fire({
      icon: "success",
      title: "New Password Generated",
      text: "A new auto-generated password has been created",
      timer: 2000,
      showConfirmButton: false,
      toast: true,
    });
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setEmailId("");
    setPassword("");
    if (!isLoginMode) {
      const autoPassword = generatePassword();
      setPassword(autoPassword);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#e3f2fd,#f9f9f9)",
          p: 2,
        }}
      >
        <Container component="main" maxWidth="sm">
          <CssBaseline />
          <Fade in timeout={600}>
            <Paper
              elevation={6}
              sx={{
                borderRadius: 4,
                p: 4,
                backdropFilter: "blur(10px)",
                backgroundColor: "rgba(255,255,255,0.9)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Avatar
                  sx={{ m: 1, width: 80, height: 80, bgcolor: "transparent" }}
                  src={futurecraftLogo}
                  alt="FutureCraft Logo"
                />
                <Typography component="h1" variant="h5" fontWeight={600}>
                  FutureCraft Employee Portal
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 1, mb: 2 }}
                >
                  {isLoginMode
                    ? "Enter your email and password to login"
                    : "Select your department and enter your email to create your account"}
                </Typography>

                <Box sx={{ mt: 1, width: "100%" }}>
                  {!isLoginMode && (
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel id="role-select-label">
                        Department Role
                      </InputLabel>
                      <Select
                        labelId="role-select-label"
                        id="role-select"
                        value={selectedRole}
                        label="Department Role"
                        onChange={(e) => setSelectedRole(e.target.value)}
                        sx={{
                          borderRadius: 2,
                          "& .MuiSelect-select": {
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          },
                        }}
                      >
                        {roles.map((role) => (
                          <MenuItem key={role.value} value={role.value}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  backgroundColor: role.color,
                                }}
                              />
                              {role.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    placeholder="example@domain.com"
                    value={emailid}
                    onChange={(e) => setEmailId(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <GoogleIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ borderRadius: 2 }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label={
                      isLoginMode 
                        ? "Password" 
                        : selectedRole === "SUPER_ADMIN" 
                          ? "Password" 
                          : "Auto-Generated Password"
                    }
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {!isLoginMode && selectedRole !== "SUPER_ADMIN" && (
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        mt: 1,
                        mb: 1,
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                      onClick={generateNewPassword}
                    >
                      Generate New Password
                    </Button>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 2,
                      mb: 2,
                      py: 1.2,
                      borderRadius: 3,
                      fontWeight: 600,
                      textTransform: "none",
                      boxShadow: "0 6px 14px rgba(66,165,245,0.4)",
                      "&:hover": {
                        boxShadow: "0 8px 20px rgba(66,165,245,0.5)",
                      },
                    }}
                    onClick={handleSubmit}
                  >
                    {isLoginMode 
                      ? "Login"
                      : (selectedRole === "SUPER_ADMIN" ? "Create Super Admin Account" : "Create Employee Account")
                    }
                  </Button>

                  <Button
                    fullWidth
                    variant="text"
                    sx={{ mt: 1, mb: 2, fontWeight: 500 }}
                    onClick={toggleMode}
                  >
                    {isLoginMode
                      ? "Don't have an account? Create one"
                      : "Already have an account? Login"}
                  </Button>
                </Box>
              </Box>
              <Copyright sx={{ mt: 4 }} />
            </Paper>
          </Fade>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
