import React, { useState } from 'react';
import {
  Box, Container, Typography, Grid, Card, TextField, Button,
  Chip, IconButton, Divider, Snackbar, Tabs, Tab, Alert, CircularProgress} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import CodeIcon from '@mui/icons-material/Code';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DescriptionIcon from '@mui/icons-material/Description';
import Header from './Header';
import Footer from './Footer';

// ── Print styles ────────────────────────────────────────────────────────────
const PRINT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap');
@media print {
  html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
  body > * { display: none !important; }
  #rv {
    display: block !important;
    visibility: visible !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 210mm !important;
    min-height: 297mm !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 14mm 16mm !important;
    background: white !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    font-size: 10pt !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  #rv * { visibility: visible !important; }
  @page { margin: 0; size: A4 portrait; }
}
`;

// ── Data model ──────────────────────────────────────────────────────────────
const INIT = {
  personal: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' },
  summary: '',
  education: [{ degree: 'B.E / B.Tech', branch: '', college: '', university: 'Visvesvaraya Technological University (VTU)', year: '', cgpa: '', honors: '' }],
  experience: [],
  projects: [{ name: '', tech: '', duration: '', bullets: '' }],
  skills: { 'Languages': [], 'Frameworks': [], 'Databases': [], 'Tools': [], 'Soft Skills': [] },
  certifications: [], achievements: [], activities: [], languages: ['English', 'Kannada'] };

// ── Resume Preview Component ─────────────────────────────────────────────
function ResumePreview({ data }) {
  const { personal, summary, education, experience, projects, skills, certifications, achievements, activities, languages } = data;
  const flatSkills = Object.entries(skills).filter(([, v]) => v.length > 0);

  const Sec = ({ title, children }) => (
    <Box sx={{ mb: '12pt' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6pt', mb: '5pt' }}>
        <Box sx={{ flex: 1, height: '1px', bgcolor: '#1a1a2e' }} />
        <Typography sx={{ fontSize: '8pt', fontWeight: 900, color: '#1a1a2e', letterSpacing: '1.5px', textTransform: 'uppercase', whiteSpace: 'nowrap', px: '8pt' }}>{title}</Typography>
        <Box sx={{ flex: 1, height: '1px', bgcolor: '#1a1a2e' }} />
      </Box>
      {children}
    </Box>
  );

  const Bullet = ({ text }) => text?.trim() ? (
    <Box sx={{ display: 'flex', gap: '5pt', mb: '2pt' }}>
      <Typography sx={{ fontSize: '9.5pt', color: '#374151', lineHeight: 1 }}>▸</Typography>
      <Typography sx={{ fontSize: '9.5pt', color: '#374151', lineHeight: 1.55, flex: 1 }}>{text.trim()}</Typography>
    </Box>
  ) : null;

  return (
    <Box id="rv" sx={{
      bgcolor: 'white', fontFamily: "'Lato', Arial, sans-serif", fontSize: '10pt', color: '#111',
      width: '100%', maxWidth: '794px', mx: 'auto',
      px: { xs: '20px', md: '36px' }, py: { xs: '20px', md: '28px' },
      boxShadow: '0 0 0 1px #E5E7EB, 0 4px 20px rgba(0,0,0,0.06)' }}>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      {/* HEADER — Name & contact */}
      <Box sx={{ textAlign: 'center', mb: '14pt', pb: '10pt', borderBottom: '2px solid #1a1a2e' }}>
        <Typography sx={{ fontSize: '22pt', fontWeight: 900, color: '#1a1a2e', letterSpacing: '0.5px', lineHeight: 1.1, textTransform: 'uppercase' }}>
          {personal.name || 'YOUR NAME'}
        </Typography>
        {personal.title && <Typography sx={{ fontSize: '10pt', color: '#6366F1', fontWeight: 700, mt: '3pt', letterSpacing: '0.5px' }}>{personal.title}</Typography>}
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 14px', mt: '6pt', fontSize: '8.5pt', color: '#4B5563' }}>
          {personal.phone && <span>☎ {personal.phone}</span>}
          {personal.email && <span>✉ {personal.email}</span>}
          {personal.location && <span>⊙ {personal.location}</span>}
          {personal.linkedin && <span>in {personal.linkedin}</span>}
          {personal.github && <span>⌨ {personal.github}</span>}
          {personal.portfolio && <span>↗ {personal.portfolio}</span>}
        </Box>
      </Box>

      {/* SUMMARY */}
      {summary && (
        <Sec title="Summary">
          <Typography sx={{ fontSize: '9.5pt', color: '#374151', lineHeight: 1.6, fontStyle: 'italic' }}>{summary}</Typography>
        </Sec>
      )}

      {/* EDUCATION */}
      {education.filter(e => e.college || e.degree).length > 0 && (
        <Sec title="Education">
          {education.filter(e => e.college || e.degree).map((e, i) => (
            <Box key={i} sx={{ mb: i < education.length - 1 ? '8pt' : 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '10pt', color: '#1a1a2e' }}>{e.degree}{e.branch ? ` — ${e.branch}` : ''}</Typography>
                  <Typography sx={{ fontSize: '9.5pt', color: '#374151', fontWeight: 700 }}>{e.college}</Typography>
                  {e.university && <Typography sx={{ fontSize: '8.5pt', color: '#6B7280' }}>{e.university}</Typography>}
                </Box>
                <Box sx={{ textAlign: 'right', flexShrink: 0, ml: '12pt' }}>
                  {e.year && <Typography sx={{ fontSize: '8.5pt', color: '#374151', fontWeight: 700 }}>{e.year}</Typography>}
                  {e.cgpa && <Typography sx={{ fontSize: '9pt', fontWeight: 900, color: '#6366F1' }}>CGPA: {e.cgpa}/10</Typography>}
                </Box>
              </Box>
              {e.honors && <Bullet text={e.honors} />}
            </Box>
          ))}
        </Sec>
      )}

      {/* SKILLS */}
      {flatSkills.length > 0 && (
        <Sec title="Technical Skills">
          {flatSkills.map(([cat, arr]) => (
            <Box key={cat} sx={{ display: 'flex', mb: '3pt', alignItems: 'flex-start', gap: '6pt' }}>
              <Typography sx={{ fontSize: '9.5pt', fontWeight: 900, color: '#1a1a2e', minWidth: '120pt', pt: '1pt' }}>{cat}:</Typography>
              <Typography sx={{ fontSize: '9.5pt', color: '#374151', flex: 1, lineHeight: 1.5 }}>{arr.join(' · ')}</Typography>
            </Box>
          ))}
        </Sec>
      )}

      {/* PROJECTS */}
      {projects.filter(p => p.name).length > 0 && (
        <Sec title="Projects">
          {projects.filter(p => p.name).map((p, i) => (
            <Box key={i} sx={{ mb: i < projects.length - 1 ? '8pt' : 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography sx={{ fontWeight: 900, fontSize: '10pt', color: '#1a1a2e' }}>{p.name}</Typography>
                {p.duration && <Typography sx={{ fontSize: '8.5pt', color: '#6B7280', flexShrink: 0, ml: '8pt' }}>{p.duration}</Typography>}
              </Box>
              {p.tech && <Typography sx={{ fontSize: '8.5pt', color: '#6366F1', fontWeight: 700, mb: '2pt' }}>Stack: {p.tech}</Typography>}
              {p.bullets?.split('\n').filter(l => l.trim()).map((l, j) => <Bullet key={j} text={l} />)}
            </Box>
          ))}
        </Sec>
      )}

      {/* EXPERIENCE */}
      {experience.filter(e => e.company).length > 0 && (
        <Sec title="Experience">
          {experience.filter(e => e.company).map((e, i) => (
            <Box key={i} sx={{ mb: '8pt' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '10pt', color: '#1a1a2e' }}>{e.role}</Typography>
                  <Typography sx={{ fontSize: '9.5pt', color: '#374151', fontWeight: 700 }}>{e.company}{e.location ? ` · ${e.location}` : ''}</Typography>
                </Box>
                {e.duration && <Typography sx={{ fontSize: '8.5pt', color: '#6B7280', flexShrink: 0, ml: '8pt', fontWeight: 700 }}>{e.duration}</Typography>}
              </Box>
              {e.bullets?.split('\n').filter(l => l.trim()).map((l, j) => <Bullet key={j} text={l} />)}
            </Box>
          ))}
        </Sec>
      )}

      {/* CERTIFICATIONS */}
      {certifications.filter(Boolean).length > 0 && (
        <Sec title="Certifications">
          {certifications.filter(Boolean).map((c, i) => <Bullet key={i} text={c} />)}
        </Sec>
      )}

      {/* ACHIEVEMENTS */}
      {achievements.filter(Boolean).length > 0 && (
        <Sec title="Achievements">
          {achievements.filter(Boolean).map((a, i) => <Bullet key={i} text={a} />)}
        </Sec>
      )}

      {/* EXTRAS */}
      {(activities.filter(Boolean).length > 0 || languages.filter(Boolean).length > 0) && (
        <Sec title="Additional Info">
          {activities.filter(Boolean).length > 0 && (
            <Box sx={{ display: 'flex', gap: '6pt', mb: '3pt' }}>
              <Typography sx={{ fontSize: '9.5pt', fontWeight: 900, color: '#1a1a2e', minWidth: '100pt' }}>Co-Curricular:</Typography>
              <Typography sx={{ fontSize: '9.5pt', color: '#374151' }}>{activities.filter(Boolean).join(' | ')}</Typography>
            </Box>
          )}
          {languages.filter(Boolean).length > 0 && (
            <Box sx={{ display: 'flex', gap: '6pt' }}>
              <Typography sx={{ fontSize: '9.5pt', fontWeight: 900, color: '#1a1a2e', minWidth: '100pt' }}>Languages:</Typography>
              <Typography sx={{ fontSize: '9.5pt', color: '#374151' }}>{languages.filter(Boolean).join(', ')}</Typography>
            </Box>
          )}
        </Sec>
      )}
    </Box>
  );
}

// ── Template 2: Modern Sidebar (Two-column with colored left panel) ────────
function ResumeModern({ data }) {
  const { personal, summary, education, experience, projects, skills, certifications, achievements, languages } = data;
  const flat = Object.entries(skills).filter(([, v]) => v.length > 0);
  const SideItem = ({ label, value }) => value ? (
    <Box sx={{ mb: '7pt' }}>
      <Typography sx={{ fontSize: '7pt', fontWeight: 900, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '1px', mb: '2pt' }}>{label}</Typography>
      <Typography sx={{ fontSize: '8.5pt', color: '#E2E8F0', lineHeight: 1.5 }}>{value}</Typography>
    </Box>
  ) : null;

  return (
    <Box id="rv" sx={{ bgcolor: 'white', fontFamily: "'Lato', Arial, sans-serif", width: '100%', maxWidth: '794px', mx: 'auto', display: 'flex', minHeight: '1000px', boxShadow: '0 0 0 1px #E5E7EB, 0 4px 20px rgba(0,0,0,0.06)' }}>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      {/* Left sidebar */}
      <Box sx={{ width: '34%', bgcolor: '#1E1B4B', p: '20px 16px', display: 'flex', flexDirection: 'column', gap: '14pt', flexShrink: 0 }}>
        {/* Initials avatar */}
        <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: '4pt' }}>
          <Typography sx={{ color: 'white', fontSize: '22pt', fontWeight: 900 }}>
            {(personal.name || 'YN').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </Typography>
        </Box>

        <SideItem label="Email" value={personal.email} />
        <SideItem label="Phone" value={personal.phone} />
        <SideItem label="Location" value={personal.location} />
        <SideItem label="LinkedIn" value={personal.linkedin} />
        <SideItem label="GitHub" value={personal.github} />

        {flat.length > 0 && (
          <Box>
            <Typography sx={{ fontSize: '8pt', fontWeight: 900, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '1px', mb: '8pt', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: '4pt' }}>Skills</Typography>
            {flat.map(([cat, arr]) => (
              <Box key={cat} sx={{ mb: '8pt' }}>
                <Typography sx={{ fontSize: '7.5pt', fontWeight: 900, color: '#818CF8', mb: '3pt' }}>{cat}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                  {arr.map(s => <Box key={s} sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px', px: '5px', py: '1px', fontSize: '7pt', color: '#E2E8F0', fontWeight: 600 }}>{s}</Box>)}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {languages.filter(Boolean).length > 0 && (
          <SideItem label="Languages" value={languages.filter(Boolean).join(' · ')} />
        )}
        {certifications.filter(Boolean).length > 0 && (
          <Box>
            <Typography sx={{ fontSize: '8pt', fontWeight: 900, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '1px', mb: '6pt', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: '4pt' }}>Certifications</Typography>
            {certifications.filter(Boolean).map((c, i) => <Typography key={i} sx={{ fontSize: '8pt', color: '#CBD5E1', mb: '3pt' }}>▸ {c}</Typography>)}
          </Box>
        )}
      </Box>

      {/* Right main content */}
      <Box sx={{ flex: 1, p: '24px 22px', overflowY: 'auto' }}>
        <Typography sx={{ fontSize: '20pt', fontWeight: 900, color: '#1E1B4B', lineHeight: 1.1 }}>{personal.name || 'YOUR NAME'}</Typography>
        {personal.title && <Typography sx={{ fontSize: '10pt', color: '#4F46E5', fontWeight: 700, mb: '12pt' }}>{personal.title}</Typography>}

        {summary && (
          <Box sx={{ mb: '14pt' }}>
            <Typography sx={{ fontSize: '8pt', fontWeight: 900, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '1.2px', mb: '4pt', borderBottom: '2px solid #4F46E5', pb: '3pt', display: 'inline-block' }}>Profile</Typography>
            <Typography sx={{ fontSize: '9pt', color: '#374151', lineHeight: 1.65, mt: '4pt' }}>{summary}</Typography>
          </Box>
        )}

        {education.filter(e => e.college || e.degree).length > 0 && (
          <Box sx={{ mb: '14pt' }}>
            <Typography sx={{ fontSize: '8pt', fontWeight: 900, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '1.2px', mb: '8pt', borderBottom: '2px solid #4F46E5', pb: '3pt', display: 'inline-block' }}>Education</Typography>
            {education.filter(e => e.college || e.degree).map((e, i) => (
              <Box key={i} sx={{ mb: '7pt' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '9.5pt', fontWeight: 900, color: '#1E1B4B' }}>{e.degree}{e.branch ? ` — ${e.branch}` : ''}</Typography>
                  {e.year && <Typography sx={{ fontSize: '8pt', color: '#6B7280', fontWeight: 700 }}>{e.year}</Typography>}
                </Box>
                <Typography sx={{ fontSize: '8.5pt', color: '#374151', fontWeight: 600 }}>{e.college}</Typography>
                {e.cgpa && <Typography sx={{ fontSize: '8.5pt', color: '#4F46E5', fontWeight: 800 }}>CGPA: {e.cgpa}/10</Typography>}
              </Box>
            ))}
          </Box>
        )}

        {experience.filter(e => e.company).length > 0 && (
          <Box sx={{ mb: '14pt' }}>
            <Typography sx={{ fontSize: '8pt', fontWeight: 900, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '1.2px', mb: '8pt', borderBottom: '2px solid #4F46E5', pb: '3pt', display: 'inline-block' }}>Experience</Typography>
            {experience.filter(e => e.company).map((e, i) => (
              <Box key={i} sx={{ mb: '9pt' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '9.5pt', fontWeight: 900, color: '#1E1B4B' }}>{e.role}</Typography>
                  {e.duration && <Typography sx={{ fontSize: '8pt', color: '#6B7280', fontWeight: 700 }}>{e.duration}</Typography>}
                </Box>
                <Typography sx={{ fontSize: '8.5pt', color: '#4F46E5', fontWeight: 700, mb: '3pt' }}>{e.company}{e.location ? ` · ${e.location}` : ''}</Typography>
                {e.bullets?.split('\n').filter(l => l.trim()).map((l, j) => <Typography key={j} sx={{ fontSize: '8.5pt', color: '#374151', lineHeight: 1.55, display: 'flex', gap: '4pt' }}><span>▸</span><span>{l.trim()}</span></Typography>)}
              </Box>
            ))}
          </Box>
        )}

        {projects.filter(p => p.name).length > 0 && (
          <Box sx={{ mb: '14pt' }}>
            <Typography sx={{ fontSize: '8pt', fontWeight: 900, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '1.2px', mb: '8pt', borderBottom: '2px solid #4F46E5', pb: '3pt', display: 'inline-block' }}>Projects</Typography>
            {projects.filter(p => p.name).map((p, i) => (
              <Box key={i} sx={{ mb: '8pt' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '9.5pt', fontWeight: 900, color: '#1E1B4B' }}>{p.name}</Typography>
                  {p.duration && <Typography sx={{ fontSize: '8pt', color: '#6B7280' }}>{p.duration}</Typography>}
                </Box>
                {p.tech && <Typography sx={{ fontSize: '8pt', color: '#4F46E5', fontWeight: 700, mb: '2pt' }}>Stack: {p.tech}</Typography>}
                {p.bullets?.split('\n').filter(l => l.trim()).map((l, j) => <Typography key={j} sx={{ fontSize: '8.5pt', color: '#374151', lineHeight: 1.55, display: 'flex', gap: '4pt' }}><span>▸</span><span>{l.trim()}</span></Typography>)}
              </Box>
            ))}
          </Box>
        )}

        {achievements.filter(Boolean).length > 0 && (
          <Box>
            <Typography sx={{ fontSize: '8pt', fontWeight: 900, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '1.2px', mb: '8pt', borderBottom: '2px solid #4F46E5', pb: '3pt', display: 'inline-block' }}>Achievements</Typography>
            {achievements.filter(Boolean).map((a, i) => <Typography key={i} sx={{ fontSize: '8.5pt', color: '#374151', lineHeight: 1.55, display: 'flex', gap: '4pt', mb: '2pt' }}><span>▸</span><span>{a}</span></Typography>)}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ── Template 3: Minimal Clean (Helvetica style, pure black & white) ─────────
function ResumeMinimal({ data }) {
  const { personal, summary, education, experience, projects, skills, certifications, achievements } = data;
  const flat = Object.entries(skills).filter(([, v]) => v.length > 0);

  const Sec = ({ title, children }) => (
    <Box sx={{ mb: '11pt' }}>
      <Typography sx={{ fontSize: '9pt', fontWeight: 900, color: '#000', textTransform: 'uppercase', letterSpacing: '1.5px', mb: '5pt', borderBottom: '0.5pt solid #000', pb: '2pt' }}>{title}</Typography>
      {children}
    </Box>
  );

  return (
    <Box id="rv" sx={{ bgcolor: 'white', fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: '9.5pt', color: '#111', width: '100%', maxWidth: '794px', mx: 'auto', px: '40px', py: '32px', boxShadow: '0 0 0 1px #E5E7EB, 0 4px 20px rgba(0,0,0,0.06)' }}>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      {/* Header */}
      <Box sx={{ mb: '14pt' }}>
        <Typography sx={{ fontSize: '24pt', fontWeight: 900, color: '#000', lineHeight: 1, letterSpacing: '-0.5px' }}>{personal.name || 'YOUR NAME'}</Typography>
        {personal.title && <Typography sx={{ fontSize: '10pt', color: '#666', fontWeight: 400, mt: '2pt' }}>{personal.title}</Typography>}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0 16pt', mt: '5pt', color: '#444', fontSize: '8.5pt' }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>linkedin.com/in/{personal.linkedin.replace(/.*linkedin\.com\/in\//,'')}</span>}
          {personal.github && <span>github.com/{personal.github.replace(/.*github\.com\//,'')}</span>}
        </Box>
      </Box>

      {summary && <Sec title="Summary"><Typography sx={{ fontSize: '9pt', color: '#333', lineHeight: 1.65 }}>{summary}</Typography></Sec>}

      {education.filter(e => e.college || e.degree).length > 0 && (
        <Sec title="Education">
          {education.filter(e => e.college || e.degree).map((e, i) => (
            <Box key={i} sx={{ mb: '6pt', display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '9.5pt' }}>{e.degree}{e.branch ? `, ${e.branch}` : ''} — {e.college}</Typography>
                {e.university && <Typography sx={{ fontSize: '8.5pt', color: '#555' }}>{e.university}</Typography>}
                {e.cgpa && <Typography sx={{ fontSize: '8.5pt', fontWeight: 700 }}>CGPA: {e.cgpa} / 10</Typography>}
              </Box>
              {e.year && <Typography sx={{ fontSize: '8.5pt', color: '#555', fontWeight: 600, flexShrink: 0, ml: '8pt' }}>{e.year}</Typography>}
            </Box>
          ))}
        </Sec>
      )}

      {flat.length > 0 && (
        <Sec title="Skills">
          {flat.map(([cat, arr]) => (
            <Box key={cat} sx={{ display: 'flex', mb: '2pt' }}>
              <Typography sx={{ fontSize: '9pt', fontWeight: 700, minWidth: '100pt' }}>{cat}:</Typography>
              <Typography sx={{ fontSize: '9pt', color: '#333' }}>{arr.join(', ')}</Typography>
            </Box>
          ))}
        </Sec>
      )}

      {experience.filter(e => e.company).length > 0 && (
        <Sec title="Experience">
          {experience.filter(e => e.company).map((e, i) => (
            <Box key={i} sx={{ mb: '8pt' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '9.5pt' }}>{e.role} — {e.company}{e.location ? `, ${e.location}` : ''}</Typography>
                {e.duration && <Typography sx={{ fontSize: '8.5pt', color: '#555', flexShrink: 0, ml: '8pt' }}>{e.duration}</Typography>}
              </Box>
              {e.bullets?.split('\n').filter(l => l.trim()).map((l, j) => <Typography key={j} sx={{ fontSize: '9pt', color: '#333', lineHeight: 1.55 }}>• {l.trim()}</Typography>)}
            </Box>
          ))}
        </Sec>
      )}

      {projects.filter(p => p.name).length > 0 && (
        <Sec title="Projects">
          {projects.filter(p => p.name).map((p, i) => (
            <Box key={i} sx={{ mb: '7pt' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '9.5pt' }}>{p.name}{p.tech ? ` (${p.tech})` : ''}</Typography>
                {p.duration && <Typography sx={{ fontSize: '8.5pt', color: '#555', flexShrink: 0 }}>{p.duration}</Typography>}
              </Box>
              {p.bullets?.split('\n').filter(l => l.trim()).map((l, j) => <Typography key={j} sx={{ fontSize: '9pt', color: '#333', lineHeight: 1.55 }}>• {l.trim()}</Typography>)}
            </Box>
          ))}
        </Sec>
      )}

      {certifications.filter(Boolean).length > 0 && (
        <Sec title="Certifications">
          <Typography sx={{ fontSize: '9pt', color: '#333' }}>{certifications.filter(Boolean).join(' · ')}</Typography>
        </Sec>
      )}

      {achievements.filter(Boolean).length > 0 && (
        <Sec title="Achievements">
          {achievements.filter(Boolean).map((a, i) => <Typography key={i} sx={{ fontSize: '9pt', color: '#333', lineHeight: 1.6 }}>• {a}</Typography>)}
        </Sec>
      )}
    </Box>
  );
}

// ── Tag Input ────────────────────────────────────────────────────────────────
function TagInput({ label, tags, onChange, placeholder }) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput('');
  };
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <TextField size="small" label={label} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder} sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
        <Button variant="outlined" onClick={add} sx={{ minWidth: 44, px: 1, borderRadius: '10px', borderColor: '#E5E7EB' }}><AddIcon /></Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {tags.map((t, i) => (
          <Chip key={i} label={t} size="small" onDelete={() => onChange(tags.filter((_, j) => j !== i))}
            sx={{ bgcolor: '#EEF2FF', color: '#4338CA', fontWeight: 600, '& .MuiChip-deleteIcon': { color: '#818CF8', '&:hover': { color: '#6366F1' } } }} />
        ))}
      </Box>
    </Box>
  );
}

// ── F shorthand ──────────────────────────────────────────────────────────────
const F = ({ label, val, onChange, multiline, rows, placeholder, required }) => (
  <TextField fullWidth size="small" label={label} value={val} onChange={e => onChange(e.target.value)}
    multiline={multiline} rows={rows} placeholder={placeholder} required={required}
    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
);

// ── Main ─────────────────────────────────────────────────────────────────────
// Template definitions — outside component so they don't re-create every render
const RESUME_TEMPLATES = [
  { name: 'Classic', desc: 'Clean centered header', color: '#1a1a2e' },
  { name: 'Modern', desc: 'Two-column sidebar', color: '#4F46E5' },
  { name: 'Minimal', desc: 'Pure B&W Helvetica', color: '#111' },
];

export default function ResumeBuilder() {
  const [data, setData] = useState(INIT);
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState('');
  const [template, setTemplate] = useState(0); // 0=Classic 1=Modern 2=Minimal
  const [pdfLoading, setPdfLoading] = useState(false);

  const loadScript = (src) => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });

  const handleDownloadPDF = async () => {
    const el = document.getElementById('rv');
    if (!el) { alert('Resume preview not found.'); return; }
    setPdfLoading(true);
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      const canvas = await window.html2canvas(el, { scale: 2.5, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false });
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const iw = pw, ih = iw * (canvas.height / canvas.width);
      if (ih <= ph) {
        pdf.addImage(imgData, 'PNG', 0, 0, iw, ih);
      } else {
        let yPos = 0;
        while (yPos < ih) { if (yPos > 0) pdf.addPage(); pdf.addImage(imgData, 'PNG', 0, -yPos, iw, ih); yPos += ph; }
      }
      const name = (data.personal?.name || 'Resume').replace(/\s+/g, '_');
      pdf.save(name + '_Resume.pdf');
    } catch (err) { alert('PDF generation failed. Use Ctrl+P → Save as PDF.'); }
    setPdfLoading(false);
  };

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const setP = (k, v) => setData(d => ({ ...d, personal: { ...d.personal, [k]: v } }));
  const setSk = (cat, v) => setData(d => ({ ...d, skills: { ...d.skills, [cat]: v } }));

  const TABS = [
    { label: '👤 Personal', el: <PersonIcon /> },
    { label: '🎓 Education', el: <SchoolIcon /> },
    { label: '💼 Experience', el: <WorkIcon /> },
    { label: '🛠 Projects', el: <CodeIcon /> },
    { label: '✨ Skills & More', el: <EmojiEventsIcon /> },
  ];

  const addRow = (key, blank) => set(key, [...data[key], blank]);
  const updRow = (key, i, field, val) => { const arr = [...data[key]]; arr[i] = { ...arr[i], [field]: val }; set(key, arr); };
  const delRow = (key, i) => set(key, data[key].filter((_, j) => j !== i));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'var(--bg-card2,#F8FAFC)' }}>
      <Header />

      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #1E40AF 100%)', py: 4, px: 2 }}>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
                <DescriptionIcon sx={{ color: '#93C5FD', fontSize: 20 }} />
                <Typography sx={{ color: '#93C5FD', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Career Tool</Typography>
              </Box>
              <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 900, color: 'white', lineHeight: 1.1 }}>Resume Builder</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.55)', mt: 0.75, fontSize: '0.9rem' }}>Professional, ATS-optimized resume with real-time preview. Print as PDF in one click.</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button onClick={() => setData(INIT)} variant="outlined"
                sx={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.8)', textTransform: 'none', borderRadius: '10px', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
                Reset
              </Button>
              <Button onClick={handleDownloadPDF} variant="contained" startIcon={pdfLoading ? <CircularProgress size={16} sx={{color:'#fff'}} /> : <PrintIcon />}
                disabled={pdfLoading}
                sx={{ bgcolor: '#2563EB', fontWeight: 800, borderRadius: '10px', textTransform: 'none', px: 3, boxShadow: '0 4px 14px rgba(37,99,235,0.5)', '&:hover': { bgcolor: '#1D4ED8' } }}>
                {pdfLoading ? 'Generating...' : 'Download PDF'}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 4 }} maxWidth="xl">
        <Alert severity="info" sx={{ mb: 3, borderRadius: '10px' }} icon={<AutoFixHighIcon />}>
          <strong>Tip:</strong> Fill in all sections for best results. Click <strong>Download PDF</strong> to save your resume. All data stays in your browser — nothing is sent to a server.
        </Alert>

        <Grid container spacing={3}>
          {/* ── Editor ── */}
          <Grid item xs={12} lg={5}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', overflow: 'hidden', position: 'sticky', top: 72 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
                sx={{ borderBottom: '1px solid #F3F4F6', '& .Mui-selected': { color: '#6366F1' }, '& .MuiTabs-indicator': { bgcolor: '#6366F1' }, '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', minWidth: 0, px: 2 } }}>
                {TABS.map((t, i) => <Tab key={i} label={t.label} />)}
              </Tabs>

              <Box sx={{ p: 3, maxHeight: '72vh', overflowY: 'auto' }}>

                {/* Personal */}
                {tab === 0 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}><F label="Full Name *" val={data.personal.name} onChange={v => setP('name', v)} /></Grid>
                    <Grid item xs={12}><F label="Professional Title" val={data.personal.title} onChange={v => setP('title', v)} placeholder="B.Tech CSE Student | Full Stack Developer" /></Grid>
                    <Grid item xs={6}><F label="Email *" val={data.personal.email} onChange={v => setP('email', v)} /></Grid>
                    <Grid item xs={6}><F label="Phone *" val={data.personal.phone} onChange={v => setP('phone', v)} placeholder="+91 98765 43210" /></Grid>
                    <Grid item xs={12}><F label="Location" val={data.personal.location} onChange={v => setP('location', v)} placeholder="Bengaluru, Karnataka" /></Grid>
                    <Grid item xs={6}><F label="LinkedIn" val={data.personal.linkedin} onChange={v => setP('linkedin', v)} placeholder="linkedin.com/in/yourname" /></Grid>
                    <Grid item xs={6}><F label="GitHub" val={data.personal.github} onChange={v => setP('github', v)} placeholder="github.com/username" /></Grid>
                    <Grid item xs={12}><F label="Portfolio / Website" val={data.personal.portfolio} onChange={v => setP('portfolio', v)} /></Grid>
                    <Grid item xs={12}><F label="Professional Summary (2–3 lines)" val={data.summary} onChange={v => set('summary', v)} multiline rows={3} placeholder="Results-driven B.Tech CSE graduate from VTU with expertise in..." /></Grid>
                  </Grid>
                )}

                {/* Education */}
                {tab === 1 && (
                  <Box>
                    {data.education.map((e, i) => (
                      <Box key={i} sx={{ mb: 2.5, p: 2.5, border: '1px solid #E5E7EB', borderRadius: '14px', position: 'relative' }}>
                        {data.education.length > 1 && <IconButton size="small" onClick={() => delRow('education', i)} sx={{ position: 'absolute', top: 10, right: 10, color: '#EF4444' }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>}
                        <Grid container spacing={1.5}>
                          <Grid item xs={12}><F label="Degree *" val={e.degree} onChange={v => updRow('education', i, 'degree', v)} placeholder="B.E / B.Tech / M.Tech / MCA" /></Grid>
                          <Grid item xs={7}><F label="Branch" val={e.branch} onChange={v => updRow('education', i, 'branch', v)} placeholder="Computer Science & Engg." /></Grid>
                          <Grid item xs={2.5}><F label="CGPA" val={e.cgpa} onChange={v => updRow('education', i, 'cgpa', v)} /></Grid>
                          <Grid item xs={2.5}><F label="Year" val={e.year} onChange={v => updRow('education', i, 'year', v)} placeholder="2025" /></Grid>
                          <Grid item xs={12}><F label="College Name *" val={e.college} onChange={v => updRow('education', i, 'college', v)} /></Grid>
                          <Grid item xs={12}><F label="University" val={e.university} onChange={v => updRow('education', i, 'university', v)} /></Grid>
                          <Grid item xs={12}><F label="Honors / Awards" val={e.honors} onChange={v => updRow('education', i, 'honors', v)} placeholder="University Rank 3 | Department Gold Medal..." /></Grid>
                        </Grid>
                      </Box>
                    ))}
                    <Button startIcon={<AddIcon />} onClick={() => addRow('education', { degree: '', branch: '', college: '', university: 'VTU', year: '', cgpa: '', honors: '' })} sx={{ textTransform: 'none', color: '#6366F1', fontWeight: 700 }}>Add Education</Button>
                  </Box>
                )}

                {/* Experience */}
                {tab === 2 && (
                  <Box>
                    {data.experience.length === 0 && (
                      <Box sx={{ p: 4, textAlign: 'center', border: '2px dashed #E5E7EB', borderRadius: '12px', mb: 2, color: '#9CA3AF' }}>
                        <WorkIcon sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
                        <Typography fontSize="0.875rem">No experience added yet — add internships, freelance, or part-time work</Typography>
                      </Box>
                    )}
                    {data.experience.map((e, i) => (
                      <Box key={i} sx={{ mb: 2.5, p: 2.5, border: '1px solid #E5E7EB', borderRadius: '14px', position: 'relative' }}>
                        <IconButton size="small" onClick={() => delRow('experience', i)} sx={{ position: 'absolute', top: 10, right: 10, color: '#EF4444' }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>
                        <Grid container spacing={1.5}>
                          <Grid item xs={12}><F label="Role / Position *" val={e.role || ''} onChange={v => updRow('experience', i, 'role', v)} placeholder="Software Engineer Intern" /></Grid>
                          <Grid item xs={7}><F label="Company *" val={e.company || ''} onChange={v => updRow('experience', i, 'company', v)} /></Grid>
                          <Grid item xs={5}><F label="Duration" val={e.duration || ''} onChange={v => updRow('experience', i, 'duration', v)} placeholder="Jun–Aug 2024" /></Grid>
                          <Grid item xs={12}><F label="Location" val={e.location || ''} onChange={v => updRow('experience', i, 'location', v)} placeholder="Bengaluru, India" /></Grid>
                          <Grid item xs={12}><F label="Key Contributions (one per line)" val={e.bullets || ''} onChange={v => updRow('experience', i, 'bullets', v)} multiline rows={3} placeholder="Developed REST APIs using Node.js & PostgreSQL&#10;Reduced page load time by 40% through caching..." /></Grid>
                        </Grid>
                      </Box>
                    ))}
                    <Button startIcon={<AddIcon />} onClick={() => addRow('experience', { role: '', company: '', location: '', duration: '', bullets: '' })} sx={{ textTransform: 'none', color: '#6366F1', fontWeight: 700 }}>Add Experience</Button>
                  </Box>
                )}

                {/* Projects */}
                {tab === 3 && (
                  <Box>
                    {data.projects.map((p, i) => (
                      <Box key={i} sx={{ mb: 2.5, p: 2.5, border: '1px solid #E5E7EB', borderRadius: '14px', position: 'relative' }}>
                        {data.projects.length > 1 && <IconButton size="small" onClick={() => delRow('projects', i)} sx={{ position: 'absolute', top: 10, right: 10, color: '#EF4444' }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>}
                        <Grid container spacing={1.5}>
                          <Grid item xs={12}><F label="Project Name *" val={p.name} onChange={v => updRow('projects', i, 'name', v)} /></Grid>
                          <Grid item xs={8}><F label="Tech Stack" val={p.tech} onChange={v => updRow('projects', i, 'tech', v)} placeholder="React, Node.js, MongoDB" /></Grid>
                          <Grid item xs={4}><F label="Duration" val={p.duration} onChange={v => updRow('projects', i, 'duration', v)} placeholder="3 months" /></Grid>
                          <Grid item xs={12}><F label="Description (one point per line)" val={p.bullets} onChange={v => updRow('projects', i, 'bullets', v)} multiline rows={3} placeholder="Built a platform that allows VTU students to...&#10;Implemented real-time notifications using WebSockets..." /></Grid>
                        </Grid>
                      </Box>
                    ))}
                    <Button startIcon={<AddIcon />} onClick={() => addRow('projects', { name: '', tech: '', duration: '', bullets: '' })} sx={{ textTransform: 'none', color: '#6366F1', fontWeight: 700 }}>Add Project</Button>
                  </Box>
                )}

                {/* Skills & More */}
                {tab === 4 && (
                  <Grid container spacing={2.5}>
                    {Object.keys(data.skills).map(cat => (
                      <Grid item xs={12} key={cat}>
                        <TagInput label={cat} tags={data.skills[cat]} onChange={v => setSk(cat, v)} placeholder="Type and press Enter..." />
                      </Grid>
                    ))}
                    <Grid item xs={12}><Divider /></Grid>
                    <Grid item xs={12}><TagInput label="Certifications" tags={data.certifications} onChange={v => set('certifications', v)} placeholder="AWS Cloud Practitioner / NPTEL Python..." /></Grid>
                    <Grid item xs={12}><TagInput label="Achievements" tags={data.achievements} onChange={v => set('achievements', v)} placeholder="1st Place – SIH 2024 / VTU Rank 3..." /></Grid>
                    <Grid item xs={12}><TagInput label="Co-Curricular Activities" tags={data.activities} onChange={v => set('activities', v)} placeholder="NSS Volunteer / Coding Club Lead..." /></Grid>
                    <Grid item xs={12}><TagInput label="Languages Known" tags={data.languages} onChange={v => set('languages', v)} placeholder="English, Kannada, Hindi..." /></Grid>
                  </Grid>
                )}
              </Box>
            </Card>
          </Grid>

          {/* ── Preview ── */}
          <Grid item xs={12} lg={7}>
            <Box sx={{ position: 'sticky', top: 72 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 800, color: 'var(--text-1,#111827)', fontSize: '0.95rem' }}>Live Preview</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {RESUME_TEMPLATES.map((t, i) => (
                    <Chip key={i} label={t.name} size="small" clickable onClick={() => setTemplate(i)}
                      sx={{ fontWeight: 700, fontSize: '0.7rem',
                        bgcolor: template === i ? t.color : '#F1F5F9',
                        color: template === i ? 'white' : '#374151',
                        border: `1.5px solid ${template === i ? t.color : '#E5E7EB'}` }} />
                  ))}
                  <Chip label="ATS ✓" size="small" sx={{ bgcolor: '#D1FAE5', color: '#065F46', fontWeight: 700, fontSize: '0.7rem' }} />
                </Box>
              </Box>
              <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'auto', maxHeight: '80vh', bgcolor: '#F3F4F6', p: 2 }}>
                {template === 0 && <ResumePreview data={data} />}
                {template === 1 && <ResumeModern data={data} />}
                {template === 2 && <ResumeMinimal data={data} />}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      <Footer />
    </Box>
  );
}
