import React, { useEffect, useRef } from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import '../styles/TestimonialsGrid.css';

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
  const cardsRef = useRef([]);

  useEffect(() => {
    const cardElements = cardsRef.current; // Store ref value
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, index * 200); // Staggered animation
          }
        });
      },
      { threshold: 0.2 }
    );

    cardElements.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      cardElements.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  return (
    <Grid container spacing={4} className="testimonials-grid">
      {testimonials.map((testimonial, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Paper
            elevation={0}
            className="testimonial-card"
            ref={(el) => (cardsRef.current[index] = el)}
            aria-label={`Testimonial from ${testimonial.name}`}
          >
            <div className="testimonial-icon"></div>
            <img
              src={testimonial.image}
              alt={`${testimonial.name}'s profile`}
              className="testimonial-image"
            />
            <Typography variant="h6" className="testimonial-name">
              {testimonial.name}
            </Typography>
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