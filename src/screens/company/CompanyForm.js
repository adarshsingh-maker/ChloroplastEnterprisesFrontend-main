import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Container,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { postData } from "../../services/FetchNodeServices";

const defaultTheme = createTheme({
  palette: {
    background: {
      default: "#f5f7fb",
    },
    primary: {
      main: "#42a5f5",
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default function CompanyForm() {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyName.trim()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Company name is required",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await postData("company/create", {
        company_name: companyName,
      });

      if (response.status) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.message || "Company created successfully",
          timer: 2000,
        });
        setCompanyName("");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to create company",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while creating the company",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
        {/* AppBar */}
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate(-1)}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <BusinessIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Add New Company
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Card elevation={3}>
            <CardContent sx={{ p: 4 }}>
              {/* Icon and Title */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 4,
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "primary.main",
                    mb: 2,
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Create New Company
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add a new company to the system
                </Typography>
              </Box>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Company Name"
                  variant="outlined"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <BusinessIcon
                        sx={{ mr: 1, color: "text.secondary" }}
                      />
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  {loading ? "Creating..." : "Create Company"}
                </Button>
              </form>

              {/* Back Button */}
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate(-1)}
                sx={{ mt: 2, textTransform: "none" }}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

