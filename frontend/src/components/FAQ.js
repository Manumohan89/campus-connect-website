import React, { useState } from 'react';
import { Container, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import '../styles/FAQ.css';

const faqItems = [
  {
    question: 'What is Campus Connect?',
    answer: 'Campus Connect is an academic platform that helps students manage their educational activities such as SGPA/CGPA calculation, job opportunities, and document sharing.',
  },
  {
    question: 'How do I register?',
    answer: 'You can register by providing your details such as name, semester, and contact information. Once registered, you will have access to all features.',
  },
  {
    question: 'What features are included?',
    answer: 'Campus Connect includes features like SGPA/CGPA calculation, document sharing, job opportunities, and more!',
  },
];

const FAQ = () => {
  const [expanded, setExpanded] = useState(false); // Control accordion state

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false); // Toggle accordion
  };

  return (
    <Container className="faq-section" data-testid="faq-section">
      <Typography
        variant="h4"
        className="section-title"
        aria-label="Frequently Asked Questions"
      >
        Frequently Asked Questions
      </Typography>
      {faqItems.map((item, index) => (
        <Accordion
          key={index}
          className="faq-card"
          expanded={expanded === `panel${index}`}
          onChange={handleChange(`panel${index}`)}
          aria-label={`FAQ: ${item.question}`}
          data-testid={`faq-card-${index}`}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon className="faq-expand-icon" />}
            className="faq-summary"
            aria-controls={`panel${index}-content`}
            id={`panel${index}-header`}
            data-testid={`faq-summary-${index}`}
          >
            <div className="faq-icon"></div>
            <Typography className="faq-title">{item.question}</Typography>
          </AccordionSummary>
          <AccordionDetails className="faq-details" data-testid={`faq-details-${index}`}>
            <Typography className="faq-answer">{item.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

export default FAQ;