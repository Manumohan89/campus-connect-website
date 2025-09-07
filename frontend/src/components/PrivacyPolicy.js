import React from "react";
import { Container, Typography, Box } from "@mui/material";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";

const PrivacyPolicy = () => {
  return (
    <>
      <PublicHeader />
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Typography variant="h3" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body1" paragraph>
          Effective Date: 06-09-2025 <br />
          Last Updated: 06-09-2025
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h5">1. Information We Collect</Typography>
          <Typography variant="body1" paragraph>
            We may collect personal details (name, email, etc.), academic information (marks
            cards, SGPA calculations), and usage data (cookies, IP, browser).
          </Typography>

          <Typography variant="h5">2. How We Use Information</Typography>
          <Typography variant="body1" paragraph>
            Information is used for SGPA calculation, resources, improvements, and ads via
            Google AdSense.
          </Typography>

          <Typography variant="h5">3. Google AdSense & Cookies</Typography>
          <Typography variant="body1" paragraph>
            We use Google AdSense. Google may use cookies (like DART) to serve ads. You can
            opt out at{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer">
              Google Ads Settings
            </a>
            .
          </Typography>

          <Typography variant="h5">4. Data Security</Typography>
          <Typography variant="body1" paragraph>
            Uploaded marks cards are processed securely. No method is 100% secure, but we use
            best practices.
          </Typography>

          <Typography variant="h5">5. Your Rights</Typography>
          <Typography variant="body1" paragraph>
            You can use SGPA Calculator without login, clear cookies, or request deletion of
            your data by contacting us.
          </Typography>

          <Typography variant="h5">6. Contact Us</Typography>
          <Typography variant="body1" paragraph>
            📧 campusconnect.help@gmail.com <br />
            🌐 https://campus-connect.online
          </Typography>
        </Box>
      </Container>
      <PublicFooter />
    </>
  );
};

export default PrivacyPolicy;
