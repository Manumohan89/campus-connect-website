// src/pages/Resources.js
import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import { Description, Book, Assignment, Info, Article } from '@mui/icons-material';
import '../styles/Resources.css';

const resourcesData = [
  {
    title: 'Notes',
    icon: <Book fontSize="large" />,
    description: 'Find organized notes by semester and subject.',
    link: '/resources/notes'
  },
  {
    title: 'Model Papers',
    icon: <Assignment fontSize="large" />,
    description: 'Practice with VTU-style model question papers.',
    link: '/resources/model-papers'
  },
  {
    title: 'Previous Question Papers',
    icon: <Description fontSize="large" />,
    description: 'Download old question papers by year & subject.',
    link: '/resources/previous-papers'
  },
  {
    title: 'VTU Circulars',
    icon: <Info fontSize="large" />,
    description: 'Latest VTU announcements, calendar & updates.',
    link: '/resources/circulars'
  },
  {
    title: 'Regulations & Syllabus',
    icon: <Article fontSize="large" />,
    description: 'Access current and past scheme syllabus & rules.',
    link: '/resources/regulations'
  }
];

const Resources = () => {
  return (
    <>
      <PublicHeader />
      <Container className="resources-page">
        <Typography variant="h3" className="resources-title" gutterBottom>
          Academic Resources
        </Typography>

        <Grid container spacing={4}>
          {resourcesData.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card className="resource-card">
                <CardContent>
                  <div className="resource-icon">{item.icon}</div>
                  <Typography variant="h5" gutterBottom>{item.title}</Typography>
                  <Typography variant="body2">{item.description}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" variant="outlined" color="primary" href={item.link}>
                    View
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <PublicFooter />
    </>
  );
};

export default Resources;
