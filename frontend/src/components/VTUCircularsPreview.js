// src/components/VTUCircularsPreview.js
import React from 'react';
import { Box, Typography, Paper, Button, Grid } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import '../styles/CircularsPreview.css';

const mockCirculars = [
  {
    title: 'VTU Exam Time Table July 2025 – CBCS Scheme',
    date: 'July 3, 2025',
    link: '/files/vtu_exam_timetable_july2025.pdf'
  },
  {
    title: 'Internship Guidelines for Final Year Students – 2025',
    date: 'June 25, 2025',
    link: '/files/vtu_internship_guidelines.pdf'
  },
  {
    title: 'Circular: Revaluation Dates Extended – June 2025',
    date: 'June 20, 2025',
    link: '/files/revaluation_dates_extended.pdf'
  }
];

const VTUCircularsPreview = () => {
  return (
    <Box className="circulars-section">
      <Typography variant="h4" className="section-title" gutterBottom>
        Latest VTU Circulars
      </Typography>

      <Grid container spacing={3}>
        {mockCirculars.map((circular, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper className="circular-card" elevation={3}>
              <Box className="circular-header">
                <PictureAsPdfIcon className="pdf-icon" />
                <Typography variant="h6" className="circular-title">
                  {circular.title}
                </Typography>
              </Box>

              <Box className="circular-footer">
                <Typography variant="body2" className="circular-date">
                  <AccessTimeIcon fontSize="small" /> {circular.date}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  endIcon={<GetAppIcon />}
                  href={circular.link}
                  target="_blank"
                >
                  Download
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default VTUCircularsPreview;
