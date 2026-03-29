import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import './TestimonialsGrid.css';

const testimonials = [
  {
    name: 'John Doe',
    message: 'Campus Connect has really helped me stay on top of my academic performance!',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Jane Smith',
    message: 'The document sharing feature is a game-changer for group projects!',
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    name: 'Carlos Rivera',
    message: 'Finding internships and job opportunities has never been easier!',
    image: 'https://randomuser.me/api/portraits/men/18.jpg',
  },
];

const TestimonialsGrid = () => {
  return (
    <Grid container spacing={4} className="testimonials-grid">
      {testimonials.map((testimonial, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Paper elevation={3} className="testimonial-card">
            <img src={testimonial.image} alt={testimonial.name} className="testimonial-image" />
            <Typography variant="h6">{testimonial.name}</Typography>
            <Typography variant="body2" className="testimonial-message">
              {testimonial.message}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default TestimonialsGrid;
