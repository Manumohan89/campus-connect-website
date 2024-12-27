import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
import '../styles/About.css';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const About = () => {
  const teamMembers = [
    {
      name: 'K Mohan',
      role: 'Founder & CEO',
      image: require("../components/images/ceo.jpg"), // Replace with actual image path
      bio: 'MOhan is a visionary leader with a passion for education and technology.',
    },
    {
      name: 'Vamshi',
      role: 'CTO',
      image: require("../components/images/img2.png"), // Replace with actual image path
      bio: 'Vamshi is a tech enthusiast, leading the development of Campus Connect’s platform.',
    },
    {
      name: 'Darshan',
      role: 'Marketing Head',
      image: require("../components/images/img4.jpg"), // Replace with actual image path
      bio: 'Darshan ensures that Campus Connect reaches the right audience and creates impact.',
    },
    {
      name: 'Lakshmi',
      role: 'Marketing Head',
      image: require("../components/images/img3.jpg"), // Replace with actual image path
      bio: 'Lakshmi ensures that Campus Connect reaches the right audience and creates impact.',
    },
  ];

  return (
    <>
      <PublicHeader />
      <Container className="about-page">
        {/* Page Header */}
        <Typography variant="h4" className="page-title">
          About Us
        </Typography>
        <Typography variant="body1" className="about-text">
          Campus Connect empowers students and institutions by bridging the gap with innovative tools. 
          From CGPA/SGPA calculations to document sharing, we redefine the student experience with efficiency and ease.
        </Typography>

        {/* Mission and Vision Section */}
        <Grid container spacing={4} className="mission-vision">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" className="section-title">Our Mission</Typography>
            <Typography variant="body1" className="section-text">
              To bridge the gap between students and institutions by providing cutting-edge digital tools and fostering a community of growth, innovation, and collaboration.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" className="section-title">Our Vision</Typography>
            <Typography variant="body1" className="section-text">
              To be the leading platform for educational empowerment, where students and institutions thrive together in a digitally connected world.
            </Typography>
          </Grid>
        </Grid>

        {/* Team Section */}
        <div className="team-section">
          <Typography variant="h5" className="section-title">Meet Our Team</Typography>
          <Grid container spacing={4}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card className="team-card">
                  <Avatar
                    alt={member.name}
                    src={member.image}
                    className="team-avatar"
                  />
                  <CardContent>
                    <Typography variant="h6" className="team-name">
                      {member.name}
                    </Typography>
                    <Typography variant="subtitle1" className="team-role">
                      {member.role}
                    </Typography>
                    <Typography variant="body2" className="team-bio">
                      {member.bio}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
      </Container>
      <PublicFooter />
    </>
  );
};

export default About;
