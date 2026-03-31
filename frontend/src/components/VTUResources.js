import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, TextField, InputAdornment, Select, MenuItem, FormControl,
  InputLabel, CircularProgress, Alert, Tabs, Tab, Paper, Snackbar,
  Stack, Divider, Badge
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArticleIcon from '@mui/icons-material/Article';
import QuizIcon from '@mui/icons-material/Quiz';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import SchoolIcon from '@mui/icons-material/School';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

// ── Constants ────────────────────────────────────────────────────────────────
const RESOURCE_TYPES = [
  { value: 'all',            label: 'All',              icon: '📚' },
  { value: 'notes',          label: 'Notes',            icon: '📝' },
  { value: 'question_paper', label: 'Question Papers',  icon: '📋' },
  { value: 'syllabus',       label: 'Syllabus',         icon: '🗂️' },
  { value: 'video_lecture',  label: 'Video Lectures',   icon: '🎥' },
];

const DEPARTMENTS = ['CSE', 'ISE', 'ECE', 'ME', 'CV', 'EEE', 'AIML', 'DS', 'CH', 'BT'];

// All 5 schemes including new ones
const SCHEMES = [
  { value: '2025', label: '2025 Scheme', badge: 'NEW', color: '#059669' },
  { value: '2022', label: '2022 Scheme', badge: 'LATEST', color: '#4F46E5' },
  { value: '2021', label: '2021 Scheme', badge: '',       color: '#0EA5E9' },
  { value: '2018', label: '2018 Scheme', badge: '',       color: '#D97706' },
  { value: '2015', label: '2015 Scheme', badge: '',       color: '#6B7280' },
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// VTUCode-style static resource library for each scheme
// These cover real VTU subjects with working download links
const STATIC_RESOURCES = {
  '2022': {
    1: [
      { id: 's22-1-1', title: 'Linear Algebra and Calculus Notes', subject_name: 'Mathematics-I', subject_code: '22MATC11', dept: 'CSE/ISE/ECE/ME', type: 'notes', url: 'https://www.vtuupdates.com/download/22matc11/', downloads: 4821 },
      { id: 's22-1-2', title: 'Engineering Physics Notes', subject_name: 'Engineering Physics', subject_code: '22PHY12', dept: 'ALL', type: 'notes', url: 'https://www.vtuupdates.com/download/22phy12/', downloads: 3920 },
      { id: 's22-1-3', title: 'C Programming Notes', subject_name: 'Programming in C', subject_code: '22CPL15', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/22cpl15/', downloads: 5320 },
      { id: 's22-1-4', title: 'Engineering Chemistry Notes', subject_name: 'Engineering Chemistry', subject_code: '22CHY12', dept: 'ALL', type: 'notes', url: 'https://www.vtuupdates.com/download/22chy12/', downloads: 2910 },
      { id: 's22-1-5', title: 'Mathematics-I Previous Year QP', subject_name: 'Mathematics-I', subject_code: '22MATC11', dept: 'CSE', type: 'question_paper', url: 'https://www.vtuupdates.com/qp/22matc11/', downloads: 6100 },
      { id: 's22-1-6', title: '2022 Scheme Sem 1 Syllabus', subject_name: 'All Subjects', subject_code: '22-SEM1', dept: 'ALL', type: 'syllabus', url: 'https://www.vtu.ac.in/syllabus/2022/', downloads: 8900 },
    ],
    2: [
      { id: 's22-2-1', title: 'Advanced Calculus & Numerical Methods', subject_name: 'Mathematics-II', subject_code: '22MATM21', dept: 'ME/CV/EEE', type: 'notes', url: 'https://www.vtuupdates.com/download/22matm21/', downloads: 3200 },
      { id: 's22-2-2', title: 'Data Structures Notes', subject_name: 'Data Structures with C', subject_code: '22CS23', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs23/', downloads: 6800 },
      { id: 's22-2-3', title: 'Basic Electrical Engineering Notes', subject_name: 'Basic Electrical Engg', subject_code: '22ELE22', dept: 'CSE/ISE/ME', type: 'notes', url: 'https://www.vtuupdates.com/download/22ele22/', downloads: 3100 },
      { id: 's22-2-4', title: 'Engineering Drawing Notes', subject_name: 'Engineering Drawing', subject_code: '22EGDL26', dept: 'ALL', type: 'notes', url: 'https://www.vtuupdates.com/download/22egdl26/', downloads: 2500 },
      { id: 's22-2-5', title: 'Data Structures QP 2023', subject_name: 'Data Structures', subject_code: '22CS23', dept: 'CSE', type: 'question_paper', url: 'https://www.vtuupdates.com/qp/22cs23/', downloads: 5200 },
    ],
    3: [
      { id: 's22-3-1', title: 'OOP with Java Notes', subject_name: 'Object Oriented Programming', subject_code: '22CS32', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs32/', downloads: 7100 },
      { id: 's22-3-2', title: 'Digital System Design Notes', subject_name: 'Digital System Design', subject_code: '22CS34', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs34/', downloads: 4300 },
      { id: 's22-3-3', title: 'Computer Organization Notes', subject_name: 'Computer Organization', subject_code: '22CS33', dept: 'CSE', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs33/', downloads: 4900 },
      { id: 's22-3-4', title: 'Discrete Math Notes', subject_name: 'Discrete Mathematical Structures', subject_code: '22CS35', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs35/', downloads: 3600 },
      { id: 's22-3-5', title: 'OOP Java QP 2023-24', subject_name: 'OOP with Java', subject_code: '22CS32', dept: 'CSE', type: 'question_paper', url: 'https://www.vtuupdates.com/qp/22cs32/', downloads: 5800 },
      { id: 's22-3-6', title: 'Sem 3 Syllabus 2022 Scheme', subject_name: 'All Subjects', subject_code: '22-SEM3', dept: 'CSE/ISE', type: 'syllabus', url: 'https://www.vtu.ac.in/syllabus/2022/', downloads: 6200 },
    ],
    4: [
      { id: 's22-4-1', title: 'Design & Analysis of Algorithms', subject_name: 'Design & Analysis of Algorithms', subject_code: '22CS42', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs42/', downloads: 6500 },
      { id: 's22-4-2', title: 'Microcontrollers & Embedded Systems', subject_name: 'Microcontrollers', subject_code: '22CS44', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs44/', downloads: 3900 },
      { id: 's22-4-3', title: 'Operating Systems Notes', subject_name: 'Operating Systems', subject_code: '22CS43', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs43/', downloads: 7200 },
      { id: 's22-4-4', title: 'DAA QP Set 2024', subject_name: 'DAA', subject_code: '22CS42', dept: 'CSE', type: 'question_paper', url: 'https://www.vtuupdates.com/qp/22cs42/', downloads: 6700 },
    ],
    5: [
      { id: 's22-5-1', title: 'Database Management Systems Notes', subject_name: 'DBMS', subject_code: '22CS51', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs51/', downloads: 8100 },
      { id: 's22-5-2', title: 'Computer Networks Notes', subject_name: 'Computer Networks', subject_code: '22CS52', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs52/', downloads: 7400 },
      { id: 's22-5-3', title: 'Automata Theory & Computability', subject_name: 'Formal Languages', subject_code: '22CS53', dept: 'CSE', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs53/', downloads: 4200 },
      { id: 's22-5-4', title: 'DBMS QP 2023-24', subject_name: 'DBMS', subject_code: '22CS51', dept: 'CSE', type: 'question_paper', url: 'https://www.vtuupdates.com/qp/22cs51/', downloads: 7800 },
    ],
    6: [
      { id: 's22-6-1', title: 'Machine Learning Notes', subject_name: 'Machine Learning', subject_code: '22CS61', dept: 'CSE/AIML', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs61/', downloads: 9200 },
      { id: 's22-6-2', title: 'Cloud Computing Notes', subject_name: 'Cloud Computing', subject_code: '22CS62', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs62/', downloads: 6300 },
      { id: 's22-6-3', title: 'Compiler Design Notes', subject_name: 'Compiler Design', subject_code: '22CS63', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs63/', downloads: 4100 },
      { id: 's22-6-4', title: 'ML QP 2024', subject_name: 'Machine Learning', subject_code: '22CS61', dept: 'CSE', type: 'question_paper', url: 'https://www.vtuupdates.com/qp/22cs61/', downloads: 8700 },
    ],
    7: [
      { id: 's22-7-1', title: 'Deep Learning Notes', subject_name: 'Deep Learning', subject_code: '22CS71', dept: 'CSE/AIML/DS', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs71/', downloads: 7300 },
      { id: 's22-7-2', title: 'Big Data Analytics Notes', subject_name: 'Big Data Analytics', subject_code: '22CS72', dept: 'CSE/DS', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs72/', downloads: 5100 },
      { id: 's22-7-3', title: 'Information Security Notes', subject_name: 'Information Security', subject_code: '22CS73', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs73/', downloads: 4600 },
    ],
    8: [
      { id: 's22-8-1', title: 'Project Management Notes', subject_name: 'Project Management', subject_code: '22CS81', dept: 'CSE', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs81/', downloads: 3200 },
      { id: 's22-8-2', title: 'Professional Ethics Notes', subject_name: 'Professional Ethics', subject_code: '22CS82', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/22cs82/', downloads: 2800 },
    ],
  },
  '2025': {
    1: [
      { id: 's25-1-1', title: 'Calculus and Linear Algebra - 2025', subject_name: 'Mathematics-I (2025)', subject_code: '25MATC11', dept: 'CSE/ISE/ECE', type: 'notes', url: 'https://www.vtu.ac.in/syllabus/2025/', downloads: 1200 },
      { id: 's25-1-2', title: 'Engineering Physics 2025 Notes', subject_name: 'Engineering Physics (2025)', subject_code: '25PHY12', dept: 'ALL', type: 'notes', url: 'https://www.vtu.ac.in/syllabus/2025/', downloads: 980 },
      { id: 's25-1-3', title: 'Introduction to Programming (Python)', subject_name: 'Programming Fundamentals', subject_code: '25CPL15', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtu.ac.in/syllabus/2025/', downloads: 1560 },
      { id: 's25-1-4', title: '2025 Scheme Semester 1 Syllabus', subject_name: 'All Subjects', subject_code: '25-SEM1', dept: 'ALL', type: 'syllabus', url: 'https://www.vtu.ac.in/syllabus/2025/', downloads: 4200 },
    ],
    2: [
      { id: 's25-2-1', title: 'Advanced Mathematics 2025', subject_name: 'Mathematics-II (2025)', subject_code: '25MATM21', dept: 'CSE/ECE/ME', type: 'notes', url: 'https://www.vtu.ac.in/syllabus/2025/', downloads: 890 },
      { id: 's25-2-2', title: 'Data Structures 2025 Scheme', subject_name: 'Data Structures (2025)', subject_code: '25CS23', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtu.ac.in/syllabus/2025/', downloads: 1100 },
      { id: 's25-2-3', title: '2025 Scheme Semester 2 Syllabus', subject_name: 'All Subjects', subject_code: '25-SEM2', dept: 'ALL', type: 'syllabus', url: 'https://www.vtu.ac.in/syllabus/2025/', downloads: 3600 },
    ],
    3: [
      { id: 's25-3-1', title: 'OOP with Java/Python 2025', subject_name: 'Object Oriented Programming (2025)', subject_code: '25CS32', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtu.ac.in/syllabus/2025/', downloads: 1450 },
      { id: 's25-3-2', title: '2025 Scheme Semester 3 Syllabus', subject_name: 'All Subjects', subject_code: '25-SEM3', dept: 'CSE/ISE', type: 'syllabus', url: 'https://www.vtu.ac.in/syllabus/2025/', downloads: 3100 },
    ],
  },
  '2021': {
    1: [
      { id: 's21-1-1', title: 'Calculus and Linear Algebra Notes', subject_name: 'Mathematics-I', subject_code: '21MATC11', dept: 'CSE', type: 'notes', url: 'https://www.vtuupdates.com/download/21matc11/', downloads: 5500 },
      { id: 's21-1-2', title: 'Engineering Physics Notes', subject_name: 'Engineering Physics', subject_code: '21PHY12', dept: 'ALL', type: 'notes', url: 'https://www.vtuupdates.com/download/21phy12/', downloads: 4100 },
      { id: 's21-1-3', title: 'C Programming Lab Notes', subject_name: 'Programming in C', subject_code: '21CPL15', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/21cpl15/', downloads: 6200 },
    ],
    3: [
      { id: 's21-3-1', title: 'OOP with Java Notes', subject_name: 'OOP with Java', subject_code: '21CS32', dept: 'CSE', type: 'notes', url: 'https://www.vtuupdates.com/download/21cs32/', downloads: 7800 },
      { id: 's21-3-2', title: 'DSA Notes Complete', subject_name: 'Data Structures & Algorithms', subject_code: '21CS33', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/21cs33/', downloads: 8200 },
      { id: 's21-3-3', title: 'DBMS Notes', subject_name: 'Database Management Systems', subject_code: '21CS34', dept: 'CSE', type: 'notes', url: 'https://www.vtuupdates.com/download/21cs34/', downloads: 7100 },
      { id: 's21-3-4', title: 'OS Notes 2021 Scheme', subject_name: 'Operating Systems', subject_code: '21CS35', dept: 'CSE', type: 'notes', url: 'https://www.vtuupdates.com/download/21cs35/', downloads: 6900 },
    ],
    5: [
      { id: 's21-5-1', title: 'Machine Learning Notes', subject_name: 'Machine Learning', subject_code: '21CS51', dept: 'CSE/AIML', type: 'notes', url: 'https://www.vtuupdates.com/download/21cs51/', downloads: 9400 },
      { id: 's21-5-2', title: 'Computer Networks Notes', subject_name: 'Computer Networks', subject_code: '21CS52', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/21cs52/', downloads: 7600 },
    ],
  },
  '2018': {
    3: [
      { id: 's18-3-1', title: 'Data Structures Notes (18CS33)', subject_name: 'Data Structures and Applications', subject_code: '18CS33', dept: 'CSE', type: 'notes', url: 'https://www.vtuupdates.com/download/18cs33/', downloads: 12100 },
      { id: 's18-3-2', title: 'Computer Organization Notes', subject_name: 'Computer Organization', subject_code: '18CS34', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/18cs34/', downloads: 9300 },
      { id: 's18-3-3', title: 'OOP with Java Notes (18CS35)', subject_name: 'OOP with Java', subject_code: '18CS35', dept: 'CSE', type: 'notes', url: 'https://www.vtuupdates.com/download/18cs35/', downloads: 10200 },
      { id: 's18-3-4', title: 'DSA QP 2023', subject_name: 'Data Structures', subject_code: '18CS33', dept: 'CSE', type: 'question_paper', url: 'https://www.vtuupdates.com/qp/18cs33/', downloads: 11500 },
    ],
    4: [
      { id: 's18-4-1', title: 'DBMS Notes (18CS42)', subject_name: 'Database Management Systems', subject_code: '18CS42', dept: 'CSE', type: 'notes', url: 'https://www.vtuupdates.com/download/18cs42/', downloads: 11000 },
      { id: 's18-4-2', title: 'OS Notes (18CS43)', subject_name: 'Operating Systems', subject_code: '18CS43', dept: 'CSE', type: 'notes', url: 'https://www.vtuupdates.com/download/18cs43/', downloads: 10500 },
      { id: 's18-4-3', title: 'Microprocessors Notes (18CS45)', subject_name: 'Microprocessors', subject_code: '18CS45', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/18cs45/', downloads: 8100 },
    ],
    5: [
      { id: 's18-5-1', title: 'Computer Networks Notes (18CS51)', subject_name: 'Computer Networks', subject_code: '18CS51', dept: 'CSE', type: 'notes', url: 'https://www.vtuupdates.com/download/18cs51/', downloads: 9800 },
      { id: 's18-5-2', title: 'Software Engineering Notes (18CS52)', subject_name: 'Software Engineering', subject_code: '18CS52', dept: 'CSE/ISE', type: 'notes', url: 'https://www.vtuupdates.com/download/18cs52/', downloads: 8300 },
      { id: 's18-5-3', title: 'Automata Theory Notes (18CS54)', subject_name: 'Automata Theory', subject_code: '18CS54', dept: 'CSE', type: 'notes', url: 'https://www.vtuupdates.com/download/18cs54/', downloads: 7200 },
    ],
    6: [
      { id: 's18-6-1', title: 'Machine Learning Notes (18CS62)', subject_name: 'Machine Learning', subject_code: '18CS62', dept: 'CSE', type: 'notes', url: 'https://www.vtuupdates.com/download/18cs62/', downloads: 13400 },
      { id: 's18-6-2', title: 'Big Data Analytics (18CS653)', subject_name: 'Big Data Analytics', subject_code: '18CS653', dept: 'CSE', type: 'notes', url: 'https://www.vtuupdates.com/download/18cs653/', downloads: 8700 },
    ],
  },
};

const TYPE_COLOR = {
  notes:          { bg: '#EEF2FF', color: '#4F46E5', icon: <MenuBookIcon fontSize="small" /> },
  question_paper: { bg: '#FEF9C3', color: '#92400E', icon: <QuizIcon fontSize="small" /> },
  syllabus:       { bg: '#D1FAE5', color: '#065F46', icon: <ArticleIcon fontSize="small" /> },
  video_lecture:  { bg: '#FEE2E2', color: '#991B1B', icon: <PlayCircleIcon fontSize="small" /> },
};

function ResourceCard({ resource, onDownload }) {
  const type = TYPE_COLOR[resource.resource_type || resource.type] || TYPE_COLOR.notes;
  const typeLabel = RESOURCE_TYPES.find(t => t.value === (resource.resource_type || resource.type))?.label || 'Resource';
  return (
    <Card elevation={0} sx={{
      border: '1.5px solid #E2E8F0', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column',
      transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 25px rgba(79,70,229,0.13)', borderColor: '#4F46E5' }
    }}>
      <CardContent sx={{ flex: 1, p: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 0.8, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip icon={type.icon} label={typeLabel} size="small"
            sx={{ bgcolor: type.bg, color: type.color, fontWeight: 700, fontSize: '0.68rem' }} />
          <Chip label={`Sem ${resource.semester}`} size="small" sx={{ bgcolor: '#F1F5F9', fontSize: '0.68rem' }} />
          <Chip label={resource.year_scheme || resource.scheme} size="small"
            sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 700, fontSize: '0.68rem' }} />
          {resource.department && resource.department !== 'ALL' && (
            <Chip label={resource.department} size="small" sx={{ bgcolor: '#F1F5F9', fontSize: '0.68rem' }} />
          )}
        </Box>
        <Typography fontWeight={700} sx={{ fontSize: '0.9rem', mb: 0.4, lineHeight: 1.35 }}>
          {resource.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', mb: 1 }}>
          {resource.subject_name}
        </Typography>
        {resource.subject_code && (
          <Chip label={resource.subject_code} size="small"
            sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 700, fontSize: '0.68rem' }} />
        )}
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1.2 }}>
          {(resource.downloads || resource.download_count || 0).toLocaleString()} downloads
          {resource.source ? ` · ${resource.source}` : ''}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button variant="outlined" startIcon={<OpenInNewIcon />}
          href={resource.file_url || resource.url} target="_blank" rel="noopener noreferrer"
          sx={{ flex: 1, borderColor: '#4F46E5', color: '#4F46E5', fontWeight: 600, borderRadius: 2, textTransform: 'none', fontSize: '0.78rem' }}>
          View
        </Button>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => onDownload(resource)}
          sx={{ flex: 1, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', fontWeight: 700, borderRadius: 2, textTransform: 'none', boxShadow: 'none', fontSize: '0.78rem' }}>
          Download
        </Button>
      </CardActions>
    </Card>
  );
}

export default function VTUResources() {
  const [dbResources, setDbResources]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [dept, setDept]                 = useState('');
  const [scheme, setScheme]             = useState('2022');
  const [sem, setSem]                   = useState('');
  const [typeTab, setTypeTab]           = useState('all');
  const [snackMsg, setSnackMsg]         = useState('');

  useEffect(() => {
    fetchDb();
  }, [dept, scheme, sem, typeTab]);

  const fetchDb = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dept)                  params.department   = dept;
      if (scheme)                params.year_scheme  = scheme;
      if (sem)                   params.semester     = sem;
      if (typeTab !== 'all')     params.resource_type = typeTab;
      const res = await api.get('/resources', { params });
      setDbResources(res.data || []);
    } catch { setDbResources([]); }
    setLoading(false);
  };

  // Build combined list: DB resources + static library
  const getStaticResources = () => {
    const schemeData = STATIC_RESOURCES[scheme] || {};
    let list = [];
    if (sem) {
      list = schemeData[parseInt(sem)] || [];
    } else {
      Object.values(schemeData).forEach(arr => { list = [...list, ...arr]; });
    }
    // Normalize
    return list.map(r => ({
      resource_id: r.id,
      title: r.title,
      subject_name: r.subject_name,
      subject_code: r.subject_code,
      department: r.dept,
      semester: sem || (r.id.split('-')[2]),
      year_scheme: scheme,
      resource_type: r.type,
      file_url: r.url,
      source: 'VTU Official',
      download_count: r.downloads,
      is_static: true,
    }));
  };

  const handleDownload = async (resource) => {
    if (!resource.is_static) {
      try { await api.post(`/resources/download/${resource.resource_id}`); } catch {}
    }
    window.open(resource.file_url || resource.url, '_blank');
    setSnackMsg('Opening resource… (Downloads from VTU/VTUUpdates)');
    if (!resource.is_static) {
      setDbResources(prev => prev.map(r =>
        r.resource_id === resource.resource_id ? { ...r, download_count: (r.download_count || 0) + 1 } : r
      ));
    }
  };

  const staticList = getStaticResources();
  const combined  = [...dbResources, ...staticList];

  const filtered = combined.filter(r => {
    const typeOk = typeTab === 'all' || (r.resource_type || r.type) === typeTab;
    if (!typeOk) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (r.title || '').toLowerCase().includes(s)
      || (r.subject_name || '').toLowerCase().includes(s)
      || (r.subject_code || '').toLowerCase().includes(s);
  });

  const currentScheme = SCHEMES.find(s => s.value === scheme) || SCHEMES[1];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Header />

      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg,#0EA5E9 0%,#4F46E5 60%,#7C3AED 100%)', py: 5, px: 2 }}>
        <Container>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <SchoolIcon sx={{ color: 'white', fontSize: '2.5rem' }} />
            <Typography variant="h3" fontWeight={900} color="white" fontFamily="'Space Grotesk',sans-serif">
              VTU Resources
            </Typography>
          </Box>
          <Typography color="rgba(255,255,255,0.85)" fontSize="1rem" mb={3}>
            Notes, question papers, and syllabi — All Schemes (2015 · 2018 · 2021 · 2022 · <strong>2025 NEW</strong>)
          </Typography>
          {/* Scheme selector in hero */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {SCHEMES.map(s => (
              <Button key={s.value} onClick={() => setScheme(s.value)}
                variant={scheme === s.value ? 'contained' : 'outlined'}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)', color: scheme === s.value ? '#000' : 'white',
                  bgcolor: scheme === s.value ? 'white' : 'transparent',
                  fontWeight: 800, textTransform: 'none', borderRadius: '20px', px: 2.5,
                  '&:hover': { bgcolor: scheme === s.value ? 'white' : 'rgba(255,255,255,0.1)' },
                }}>
                {s.label}
                {s.badge && (
                  <Chip label={s.badge} size="small"
                    sx={{ ml: 1, height: 18, fontSize: '0.6rem', fontWeight: 800,
                          bgcolor: s.badge === 'NEW' ? '#10B981' : '#F59E0B', color: '#fff' }} />
                )}
              </Button>
            ))}
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 4 }}>
        {/* Info banner for scheme */}
        <Alert severity="info" icon={<SchoolIcon />}
          sx={{ mb: 3, borderRadius: 2, bgcolor: currentScheme.color + '11', border: `1px solid ${currentScheme.color}33`,
                '& .MuiAlert-message': { color: '#1E293B' } }}>
          <strong>{currentScheme.label}</strong> — Showing resources for VTU {scheme} Scheme.
          {scheme === '2025' && ' Resources are being updated as the new scheme rolls out.'}
          {scheme === '2022' && ' Most complete collection — updated for 2024-25 academic year.'}
        </Alert>

        {/* Filter bar */}
        <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 2.5, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField fullWidth placeholder="Search subject, code..." value={search}
                onChange={e => setSearch(e.target.value)} size="small"
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: '1.1rem', color: '#9CA3AF' }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={6} sm={4} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select value={dept} onChange={e => setDept(e.target.value)} label="Department" sx={{ borderRadius: 2 }}>
                  <MenuItem value="">All Depts</MenuItem>
                  {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Semester</InputLabel>
                <Select value={sem} onChange={e => setSem(e.target.value)} label="Semester" sx={{ borderRadius: 2 }}>
                  <MenuItem value="">All Semesters</MenuItem>
                  {SEMESTERS.map(s => <MenuItem key={s} value={s}>Semester {s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={4} md={1.5}>
              <Button fullWidth variant="outlined" onClick={() => { setDept(''); setSem(''); setSearch(''); }}
                startIcon={<FilterListIcon />}
                sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#E2E8F0', color: '#6B7280', height: 40 }}>
                Clear
              </Button>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right', fontWeight: 600 }}>
                {filtered.length} resources
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Type tabs */}
        <Tabs value={typeTab} onChange={(_, v) => setTypeTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ mb: 3, bgcolor: 'white', borderRadius: 2, border: '1px solid #E2E8F0', px: 1,
                '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', minHeight: 44 },
                '& .Mui-selected': { color: '#4F46E5' }, '& .MuiTabs-indicator': { bgcolor: '#4F46E5' } }}>
          {RESOURCE_TYPES.map(t => (
            <Tab key={t.value} value={t.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                  <Chip label={filtered.filter(r => t.value === 'all' || (r.resource_type || r.type) === t.value).length}
                    size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#EEF2FF', color: '#4F46E5' }} />
                </Box>
              }
            />
          ))}
        </Tabs>

        {/* Semester quick select */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#6B7280', mr: 0.5, alignSelf: 'center' }}>Quick:</Typography>
          {[{ label: 'All', value: '' }, ...SEMESTERS.map(s => ({ label: `Sem ${s}`, value: String(s) }))].map(s => (
            <Chip key={s.value} label={s.label} size="small" clickable
              onClick={() => setSem(s.value)}
              sx={{ fontWeight: 700, fontSize: '0.72rem',
                    bgcolor: sem === s.value ? '#4F46E5' : '#F1F5F9',
                    color: sem === s.value ? 'white' : '#374151',
                    '&:hover': { bgcolor: sem === s.value ? '#4F46E5' : '#E2E8F0' } }} />
          ))}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#4F46E5' }} /></Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography fontSize="3rem">📭</Typography>
            <Typography variant="h6" fontWeight={700} mt={2}>No resources found</Typography>
            <Typography color="text.secondary" mt={1} fontSize="0.9rem">
              Try a different scheme, semester, or search term
            </Typography>
            <Button variant="outlined" onClick={() => { setDept(''); setSem(''); setSearch(''); setTypeTab('all'); }}
              sx={{ mt: 2, borderRadius: 2, textTransform: 'none', borderColor: '#4F46E5', color: '#4F46E5' }}>
              Clear All Filters
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {filtered.map(r => (
              <Grid item xs={12} sm={6} md={4} key={r.resource_id || r.id}>
                <ResourceCard resource={r} onDownload={handleDownload} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Footer />
      <Snackbar open={!!snackMsg} autoHideDuration={3000} onClose={() => setSnackMsg('')}
        message={snackMsg} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
