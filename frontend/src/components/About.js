import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Grid, Card, CardContent, Avatar, Modal, Box, IconButton } from '@mui/material';
import { LinkedIn, Twitter, GitHub } from '@mui/icons-material';
import '../styles/About.css';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const About = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(null);
  const teamSectionRef = useRef(null);

  // Simulated team data (replace with API call in the future)
  const mockTeamMembers = [
    {
      name: 'K Mohan',
      role: 'Founder & CEO',
      image: require("../components/images/ceo.jpg"),
      bio: 'Mohan is a visionary leader with a passion for education and technology, driving Campus Connect to empower students and institutions.',
      linkedIn: 'https://linkedin.com/in/kmohan',
      twitter: 'https://twitter.com/kmohan',
      github: 'https://github.com/kmohan',
    },
    {
      name: 'Vamshi',
      role: 'CTO',
      image: require("../components/images/img2.png"),
      bio: 'Vamshi is a tech enthusiast, leading the development of Campus Connect’s platform with innovative solutions.',
      linkedIn: 'https://linkedin.com/in/vamshi',
      twitter: 'https://twitter.com/vamshi',
      github: 'https://github.com/vamshi',
    },
    {
      name: 'Darshan',
      role: 'Marketing Head',
      image: require("../components/images/img4.jpg"),
      bio: 'Darshan ensures that Campus Connect reaches the right audience with impactful marketing strategies.',
      linkedIn: 'https://linkedin.com/in/darshan',
      twitter: 'https://twitter.com/darshan',
      github: 'https://github.com/darshan',
    },
    {
      name: 'Lakshmi',
      role: 'Marketing Head',
      image: require("../components/images/img3.jpg"),
      bio: 'Lakshmi drives Campus Connect’s outreach, creating meaningful connections with students and institutions.',
      linkedIn: 'https://linkedin.com/in/lakshmi',
      twitter: 'https://twitter.com/lakshmi',
      github: 'https://github.com/lakshmi',
    },
  ];

  // Simulate loading team members
  useEffect(() => {
    setTimeout(() => {
      setTeamMembers(mockTeamMembers);
      setIsLoading(false);
    }, 1000);
  }, );

  // Handle scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    const cards = teamSectionRef.current?.querySelectorAll('.team-card');
    const missionVisionCards = document.querySelectorAll('.mission-vision-card');
    [...cards, ...missionVisionCards].forEach((el) => observer.observe(el));

    return () => {
      [...cards, ...missionVisionCards].forEach((el) => observer.unobserve(el));
    };
  }, [isLoading]);

  // Handle modal open/close
  const handleOpenModal = (index) => setOpenModal(index);
  const handleCloseModal = () => setOpenModal(null);

  // Modal style
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 400,
    bgcolor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 24,
    p: 4,
    borderRadius: '12px',
    textAlign: 'center',
    animation: 'slideUp 0.4s ease-out',
  };

  return (
    <>
      <PublicHeader />
      <Container className="about-page">
        {/* Page Header */}
        <Typography
          variant="h4"
          className="page-title"
          aria-label="About Us"
          tabIndex={0}
        >
          About Us
        </Typography>
        <Typography
          variant="body1"
          className="about-text"
          role="region"
          aria-label="About Campus Connect description"
          tabIndex={0}
        >
          Campus Connect empowers students and institutions by bridging the gap with innovative tools. 
          From CGPA/SGPA calculations to document sharing, we redefine the student experience with efficiency and ease.
        </Typography>

        {/* Mission and Vision Section */}
        <Grid container spacing={4} className="mission-vision">
          <Grid item xs={12} md={6}>
            <Card className="mission-vision-card">
              <CardContent>
                <Typography variant="h5" className="section-title">Our Mission</Typography>
                <Typography variant="body1" className="section-text">
                  To bridge the gap between students and institutions by providing cutting-edge digital tools and fostering a community of growth, innovation, and collaboration.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card className="mission-vision-card">
              <CardContent>
                <Typography variant="h5" className="section-title">Our Vision</Typography>
                <Typography variant="body1" className="section-text">
                 We are dedicated to providing students with personalized learning experiences, access to cutting-edge resources that helps them achieve their academic and career aspirations.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Team Section */}
        <div className="team-section" ref={teamSectionRef}>
          <Typography variant="h5" className="section-title">Meet Our Team</Typography>
          {isLoading ? (
            <Typography variant="body1" className="loading-text">
              Loading team members...
            </Typography>
          ) : (
            <Grid container spacing={4}>
              {teamMembers.map((member, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card className="team-card" onClick={() => handleOpenModal(index)} role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && handleOpenModal(index)}>
                    <Avatar
                      alt={member.name}
                      src={member.image}
                      className="team-avatar"
                      aria-label={`Profile picture of ${member.name}`}
                    />
                    <CardContent>
                      <Typography variant="h6" className="team-name">
                        {member.name}
                      </Typography>
                      <Typography variant="subtitle1" className="team-role">
                        {member.role}
                      </Typography>
                      <Typography variant="body2" className="team-bio">
                        {member.bio.slice(0, 50)}...
                      </Typography>
                      <div className="social-links">
                        <IconButton href={member.linkedIn} target="_blank" aria-label={`LinkedIn profile of ${member.name}`}>
                          <LinkedIn />
                        </IconButton>
                        <IconButton href={member.twitter} target="_blank" aria-label={`Twitter profile of ${member.name}`}>
                          <Twitter />
                        </IconButton>
                        <IconButton href={member.github} target="_blank" aria-label={`GitHub profile of ${member.name}`}>
                          <GitHub />
                        </IconButton>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Modal for expanded bio */}
                  <Modal open={openModal === index} onClose={handleCloseModal}>
                    <Box sx={modalStyle}>
                      <Avatar
                        alt={member.name}
                        src={member.image}
                        sx={{ width: 100, height: 100, margin: '0 auto 1rem', border: '3px solid rgba(59, 130, 246, 0.5)' }}
                      />
                      <Typography variant="h6" sx={{ color: '#111827', fontWeight: 600 }}>
                        {member.name}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ color: '#6b7280', fontStyle: 'italic', mb: 2 }}>
                        {member.role}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.5, mb: 2 }}>
                        {member.bio}
                      </Typography>
                      <div className="social-links">
                        <IconButton href={member.linkedIn} target="_blank" aria-label={`LinkedIn profile of ${member.name}`}>
                          <LinkedIn />
                        </IconButton>
                        <IconButton href={member.twitter} target="_blank" aria-label={`Twitter profile of ${member.name}`}>
                          <Twitter />
                        </IconButton>
                        <IconButton href={member.github} target="_blank" aria-label={`GitHub profile of ${member.name}`}>
                          <GitHub />
                        </IconButton>
                      </div>
                    </Box>
                  </Modal>
                </Grid>
              ))}
            </Grid>
          )}
        </div>
      </Container>
      <PublicFooter />
    </>
  );
};

export default About;