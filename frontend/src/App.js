import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './components/Homepage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import UpdateProfile from './components/UpdateProfile';
import Reminders from './components/Reminders';
import JobOpportunities from './components/JobOpportunities';
import UploadMarks from './components/UploadMarks'; // Add this line
import ShareDocuments from './components/ShareDocuments'; // Add this line
import SharedDocuments from './components/SharedDocuments';
import ProfileCustomization from './components/ProfileCustomization';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/job-opportunities" element={<JobOpportunities />} />
        <Route path="/upload-marks" element={<UploadMarks />} /> {/* Ensure this route exists */}
        <Route path="/share-documents" element={<ShareDocuments />} /> {/* Ensure this route exists */}
        <Route path="/shared-documents" element={<SharedDocuments />} />
        <Route path="/profilecustomization" element = {<ProfileCustomization/>} />
      </Routes>
    </Router>
  );
}

export default App;
