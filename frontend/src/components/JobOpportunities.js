import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import axios from 'axios';
import './JobOpportunities.css';

function JobOpportunities() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/users/job-opportunities');
        setJobs(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load job opportunities.');
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="job-opportunities-page">
      <Header />
      <div className="job-opportunities-content">
        <h2>Job Opportunities</h2>
        <ul>
          {jobs.map((job, index) => (
            <li key={index}>
              <h3>{job.title}</h3>
              <p>{job.company}</p>
              <p>{job.description}</p>
              <a href={job.link} target="_blank" rel="noopener noreferrer">More Info</a>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </div>
  );
}

export default JobOpportunities;
