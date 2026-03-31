import React, { useState, useRef } from 'react';
import {
  Box, Container, Typography, Card, Button, Alert, Table,
  TableHead, TableRow, TableCell, TableBody, Chip, LinearProgress,
  Snackbar, Divider, Grid, Paper
} from '@mui/material';
import UploadFileIcon  from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon    from '@mui/icons-material/Download';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const TEMPLATE_CSV = `subject_code,subject_name,internal_marks,external_marks,total,credits,grade_points
21CS51,Automata Theory and Compiler Design,47,28,75,3,8
21CS52,Computer Networks,50,28,78,4,8
21CS53,Database Management Systems,47,34,81,3,9
21CS54,Artificial Intelligence and Machine Learning,50,21,71,3,8
21CSL55,DBMS Lab with Mini Project,50,46,96,1,10
21RMI56,Research Methodology and IPR,44,39,83,2,9
21CIV57,Environmental Studies,50,32,82,1,9`;

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  }).filter(r => r.subject_code);
}

export default function BulkMarksUpload() {
  const [parsed, setParsed]     = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [snack, setSnack]       = useState('');
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) { setError('Please upload a .csv file'); return; }
    setFileName(file.name);
    setError(''); setParsed(null); setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const rows = parseCSV(ev.target.result);
        if (rows.length === 0) { setError('No valid rows found in CSV'); return; }
        // Validate
        const issues = [];
        rows.forEach((r, i) => {
          if (!r.subject_code) issues.push(`Row ${i+2}: missing subject_code`);
          if (isNaN(parseInt(r.total))) issues.push(`Row ${i+2}: invalid total marks`);
        });
        if (issues.length > 0) { setError(issues.slice(0,3).join(', ')); return; }
        setParsed(rows);
      } catch (err) { setError('Failed to parse CSV: ' + err.message); }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!parsed) return;
    setLoading(true); setError('');
    try {
      // Calculate SGPA
      const totalCr = parsed.reduce((s,r) => s + parseInt(r.credits||4), 0);
      const totalGP = parsed.reduce((s,r) => s + (parseInt(r.grade_points||0) * parseInt(r.credits||4)), 0);
      const sgpa = totalCr > 0 ? parseFloat((totalGP/totalCr).toFixed(2)) : 0;

      // Save each subject via the marks endpoint
      for (const r of parsed) {
        await api.post('/users/marks-manual', {
          subject_code:   r.subject_code,
          subject_name:   r.subject_name || r.subject_code,
          internal_marks: parseInt(r.internal_marks || 0),
          external_marks: parseInt(r.external_marks || 0),
          total:          parseInt(r.total),
          credits:        parseInt(r.credits || 4),
          grade_points:   parseInt(r.grade_points || 0),
        });
      }

      // Update SGPA/CGPA
      await api.post('/users/recalculate-cgpa');

      setResult({ sgpa, subjects: parsed.length, failed: parsed.filter(r=>parseInt(r.total)<40).length });
      setSnack(`✅ ${parsed.length} subjects uploaded! SGPA: ${sgpa}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally { setLoading(false); }
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type:'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vtu_marks_template.csv';
    a.click();
  };

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <Header />
      <Box sx={{ background:'linear-gradient(135deg,#065F46,#059669)', py:{ xs:5,md:7 }, px:2 }}>
        <Container maxWidth="lg">
          <Chip label="Academic Tool" sx={{ bgcolor:'rgba(255,255,255,0.2)', color:'white', fontWeight:700, mb:1 }} />
          <Typography sx={{ fontSize:{ xs:'2rem', md:'2.5rem' }, fontWeight:900, color:'white', fontFamily:"'Space Grotesk',sans-serif" }}>
            Bulk Marks Upload (CSV)
          </Typography>
          <Typography sx={{ color:'rgba(255,255,255,0.75)', mt:0.5 }}>
            Upload multiple semesters at once using a CSV file
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py:4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'20px', p:3, mb:3 }}>
              <Typography fontWeight={800} mb={2}>Step 1: Download Template</Typography>
              <Button fullWidth variant="outlined" startIcon={<DownloadIcon />} onClick={downloadTemplate}
                sx={{ borderRadius:'12px', textTransform:'none', fontWeight:700, mb:2, borderColor:'#10B981', color:'#10B981' }}>
                Download CSV Template
              </Button>
              <Alert severity="info" sx={{ borderRadius:'10px', fontSize:'0.8rem' }}>
                Fill in the template with your marks, then upload it below.
              </Alert>
            </Card>

            <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'20px', p:3 }}>
              <Typography fontWeight={800} mb={2}>Step 2: Upload CSV</Typography>
              <input ref={fileRef} type="file" accept=".csv" hidden onChange={handleFile} />
              <Paper component="label" onClick={() => fileRef.current?.click()} sx={{
                p:3, textAlign:'center', border:`2px dashed ${fileName ? '#10B981':'#CBD5E1'}`,
                bgcolor: fileName ? '#F0FDF4':'#F8FAFC', borderRadius:'12px', cursor:'pointer',
                display:'block', mb:2, '&:hover':{ borderColor:'#10B981' }, transition:'all 0.2s'
              }}>
                <UploadFileIcon sx={{ fontSize:36, color: fileName?'#10B981':'#94A3B8', mb:0.5 }} />
                <Typography fontWeight={600} color={fileName?'#065F46':'#64748B'}>
                  {fileName || 'Click to select CSV file'}
                </Typography>
                <Typography variant="caption" color="text.secondary">.csv only</Typography>
              </Paper>

              {error && <Alert severity="error" sx={{ mb:2, borderRadius:'10px' }}>{error}</Alert>}
              {loading && <LinearProgress sx={{ mb:2, borderRadius:99 }} />}

              {parsed && (
                <>
                  <Alert severity="success" sx={{ mb:2, borderRadius:'10px' }}>
                    ✅ {parsed.length} subjects ready to upload
                  </Alert>
                  <Button fullWidth variant="contained" onClick={handleUpload} disabled={loading}
                    sx={{ background:'linear-gradient(135deg,#059669,#10B981)', textTransform:'none', fontWeight:700, borderRadius:'12px', py:1.5, boxShadow:'none' }}>
                    Upload {parsed.length} Subjects
                  </Button>
                </>
              )}
            </Card>

            {result && (
              <Card elevation={0} sx={{ border:'2px solid #10B981', borderRadius:'16px', p:3, mt:2, bgcolor:'#F0FDF4' }}>
                <Box sx={{ display:'flex', gap:1.5, alignItems:'center', mb:1.5 }}>
                  <CheckCircleIcon sx={{ color:'#10B981' }} />
                  <Typography fontWeight={800} color="#065F46">Upload Complete!</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography fontFamily="'DM Mono',monospace" fontWeight={900} fontSize="1.75rem" color="#059669">{result.sgpa}</Typography>
                    <Typography variant="caption" color="#6B7280" fontWeight={700}>SGPA</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography fontWeight={900} fontSize="1.75rem" color="#4F46E5">{result.subjects}</Typography>
                    <Typography variant="caption" color="#6B7280" fontWeight={700}>Subjects</Typography>
                  </Grid>
                </Grid>
                {result.failed > 0 && (
                  <Alert severity="warning" sx={{ mt:1.5, borderRadius:'10px', fontSize:'0.8rem' }}>
                    {result.failed} subject(s) below pass mark (40)
                  </Alert>
                )}
              </Card>
            )}
          </Grid>

          <Grid item xs={12} md={7}>
            {parsed ? (
              <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'20px', overflow:'hidden' }}>
                <Box sx={{ px:3, py:2, borderBottom:'1px solid #F3F4F6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <Typography fontWeight={800}>Preview ({parsed.length} subjects)</Typography>
                  <Chip label={`SGPA: ${parsed.length > 0 ? (parsed.reduce((s,r)=>s+parseInt(r.grade_points||0)*parseInt(r.credits||4),0)/Math.max(1,parsed.reduce((s,r)=>s+parseInt(r.credits||4),0))).toFixed(2) : '—'}`}
                    sx={{ bgcolor:'#EEF2FF', color:'#4F46E5', fontWeight:800 }} />
                </Box>
                <Box sx={{ overflowX:'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor:'#F9FAFB' }}>
                        {['Code','Subject','Int','Ext','Total','Cr','GP'].map(h => (
                          <TableCell key={h} sx={{ fontWeight:700, fontSize:'0.7rem', color:'#9CA3AF', textTransform:'uppercase', py:1.5 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parsed.map((r, i) => (
                        <TableRow key={i} sx={{ bgcolor: parseInt(r.total)<40 ? '#FFF5F5':'white', '&:hover':{ bgcolor:'#F9FAFB' } }}>
                          <TableCell sx={{ fontWeight:700, color:'#4F46E5', fontFamily:'monospace', fontSize:'0.78rem' }}>{r.subject_code}</TableCell>
                          <TableCell sx={{ maxWidth:160, fontSize:'0.78rem' }}><Typography noWrap fontSize="0.78rem">{r.subject_name||'—'}</Typography></TableCell>
                          <TableCell align="center">{r.internal_marks||'—'}</TableCell>
                          <TableCell align="center">{r.external_marks||'—'}</TableCell>
                          <TableCell align="center" sx={{ fontWeight:800, color: parseInt(r.total)<40?'#EF4444':'#111827' }}>{r.total}</TableCell>
                          <TableCell align="center">{r.credits||4}</TableCell>
                          <TableCell align="center" sx={{ fontWeight:700 }}>{r.grade_points||0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Card>
            ) : (
              <Card elevation={0} sx={{ border:'2px dashed #E5E7EB', borderRadius:'20px', p:8, textAlign:'center' }}>
                <UploadFileIcon sx={{ fontSize:56, color:'#CBD5E1', mb:2 }} />
                <Typography fontWeight={700} color="#374151" mb={1}>CSV Preview Will Appear Here</Typography>
                <Typography color="text.secondary" fontSize="0.875rem">
                  Download the template, fill in your marks, and upload to see a preview before saving
                </Typography>
              </Card>
            )}

            <Alert severity="info" sx={{ mt:2, borderRadius:'12px' }}>
              <strong>CSV Format:</strong> subject_code, subject_name, internal_marks, external_marks, total, credits, grade_points
              — one row per subject. Download the template for the exact format.
            </Alert>
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical:'bottom', horizontal:'center' }} />
      <Footer />
    </Box>
  );
}
