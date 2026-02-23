import React from 'react';
import { Container, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './FAQ.css';

const faqItems = [
  { question: 'What is Campus Connect?', answer: 'Campus Connect is an academic platform that helps students manage their educational activities such as SGPA/CGPA calculation, job opportunities, and document sharing.' },
  { question: 'How do I register?', answer: 'You can register by providing your details such as name, semester, and contact information. Once registered, you will have access to all features.' },
  { question: 'What features are included?', answer: 'Campus Connect includes features like SGPA/CGPA calculation, document sharing, job opportunities, and more!' }
];

const FAQ = () => {
  return (
    <Container className="faq-section">
      <Typography variant="h4" gutterBottom className="section-title">
        Frequently Asked Questions
      </Typography>
      {faqItems.map((item, index) => (
        <Accordion key={index} className="faq-accordion">
          <AccordionSummary expandIcon={<ExpandMoreIcon />} className="faq-summary">
            <Typography>{item.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{item.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

export default FAQ;
