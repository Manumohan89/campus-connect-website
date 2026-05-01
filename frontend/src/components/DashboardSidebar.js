import React, { useState } from 'react';
import { Box, Card, List, ListItem, ListItemIcon, ListItemText, Collapse, Divider, Typography, useMediaQuery } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export const SIDEBAR_ITEMS = [
  {
    category: '🎓 Academics',
    color: '#4F46E5',
    items: [
      { icon: '📊', label: 'Dashboard', path: '/dashboard' },
      { icon: '📤', label: 'Upload Marks', path: '/upload-marks' },
      { icon: '📈', label: 'Analytics', path: '/analytics' },
      { icon: '📊', label: 'CGPA Tracker', path: '/cgpa-tracker' },
      { icon: '⚠️', label: 'Backlog Dashboard', path: '/backlog-dashboard' },
      { icon: '🎯', label: 'Rank Predictor', path: '/rank-predictor' },
      { icon: '✅', label: 'Attendance', path: '/attendance' },
      { icon: '📅', label: 'Exam Timetable', path: '/exam-timetable' },
    ]
  },
  {
    category: '📚 Learning',
    color: '#7C3AED',
    items: [
      { icon: '▶️', label: 'Training Courses', path: '/training', badge: 'FREE' },
      { icon: '📖', label: 'VTU Resources', path: '/vtu-resources' },
      { icon: '💻', label: 'Coding Platform', path: '/coding', badge: 'NEW' },
      { icon: '💬', label: 'Peer Forum', path: '/forum', badge: 'NEW' },
      { icon: '🗂️', label: 'Flashcards', path: '/flashcards', badge: 'NEW' },
      { icon: '🤖', label: 'AI Study Tutor', path: '/ai-tutor', badge: 'AI' },
    ]
  },
  {
    category: '💼 Career',
    color: '#059669',
    items: [
      { icon: '🏢', label: 'Placement Drives', path: '/placement-drives', badge: 'NEW' },
      { icon: '💼', label: 'Job Opportunities', path: '/job-opportunities' },
      { icon: '📄', label: 'Resume Builder', path: '/resume-builder' },
      { icon: '👥', label: 'Alumni Mentorship', path: '/alumni-mentorship' },
      { icon: '🏆', label: 'Leaderboard', path: '/leaderboard', badge: 'LIVE' },
    ]
  },
  {
    category: '💰 Earn & Tools',
    color: '#10B981',
    items: [
      { icon: '💸', label: 'Earn Platform', path: '/earn', badge: 'EARN' },
      { icon: '📅', label: 'Study Planner', path: '/study-planner', badge: 'NEW' },
    ]
  },
];

export default function DashboardSidebar({ isDark }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState({});
  const isMobile = useMediaQuery('(max-width:900px)');

  const toggleExpand = (cat) => {
    setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const isActive = (path) => location.pathname === path;

  if (isMobile) return null;

  return (
    <Card elevation={0} sx={{
      background: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB',
      borderRadius: '16px',
      overflow: 'hidden',
      position: 'sticky',
      top: 100,
      height: 'fit-content',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
    }}>
      {SIDEBAR_ITEMS.map((section, idx) => (
        <Box key={section.category}>
          <Box
            onClick={() => toggleExpand(section.category)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.5,
              cursor: 'pointer',
              background: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB',
              borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB',
              transition: 'all 0.2s',
              '&:hover': {
                background: isDark ? 'rgba(255,255,255,0.08)' : '#F0F1F3',
              }
            }}
          >
            <Typography fontSize="1rem">{section.category.split(' ')[0]}</Typography>
            <Typography sx={{ flex: 1, fontWeight: 700, fontSize: '0.85rem', color: isDark ? '#F1F5F9' : '#111827' }}>
              {section.category.split(' ').slice(1).join(' ')}
            </Typography>
            <ExpandMoreIcon sx={{
              fontSize: 18,
              transform: expanded[section.category] ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              color: section.color,
            }} />
          </Box>
          <Collapse in={expanded[section.category] !== false} timeout="auto">
            <List disablePadding>
              {section.items.map((item) => (
                <ListItem
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    pl: 3,
                    py: 1,
                    cursor: 'pointer',
                    background: isActive(item.path) ? `${section.color}15` : 'transparent',
                    borderLeft: isActive(item.path) ? `3px solid ${section.color}` : '3px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28, fontSize: '1.1rem', color: isActive(item.path) ? section.color : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.85rem',
                      fontWeight: isActive(item.path) ? 700 : 500,
                      color: isActive(item.path) ? section.color : isDark ? '#CBD5E1' : '#6B7280',
                    }}
                  />
                  {item.badge && (
                    <Box sx={{
                      ml: 1,
                      px: 1.5,
                      py: 0.3,
                      borderRadius: '4px',
                      background: section.color + '22',
                      color: section.color,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                    }}>
                      {item.badge}
                    </Box>
                  )}
                </ListItem>
              ))}
            </List>
          </Collapse>
          {idx < SIDEBAR_ITEMS.length - 1 && <Divider sx={{ my: 0 }} />}
        </Box>
      ))}
    </Card>
  );
}
