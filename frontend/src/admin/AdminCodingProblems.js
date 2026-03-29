import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, IconButton,
  Snackbar, Alert, Grid, Tabs, Tab, InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CodeIcon from '@mui/icons-material/Code';
import AdminLayout from './AdminLayout';
import api from '../utils/api';

const DIFF_COLORS = { easy:'#00b8a3', medium:'#ffc01e', hard:'#ff375f' };
const STARTER_TEMPLATE = {
  python: `def solution(n):\n    # Write your solution here\n    pass\n\n# Read input\nn = int(input())\nprint(solution(n))`,
  java: `import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Write your solution here\n    }\n}`,
  c: `#include <stdio.h>\nint main() {\n    int n;\n    scanf("%d", &n);\n    // Write your solution here\n    return 0;\n}`,
  csharp: `using System;\nclass Solution {\n    static void Main() {\n        int n = int.Parse(Console.ReadLine());\n        // Write your solution here\n    }\n}`,
};

const emptyProblem = {
  title: '', description: '', difficulty: 'easy',
  tags: '', constraints: '',
  hints: '',
  examples: '[{"input":"1","output":"1","explanation":""}]',
  test_cases: '[{"input":"1","expected_output":"1","hidden":false}]',
  starter_code: JSON.stringify(STARTER_TEMPLATE, null, 2),
  companies: '',
};

export default function AdminCodingProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [open, setOpen]         = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(emptyProblem);
  const [saving, setSaving]     = useState(false);
  const [snack, setSnack]       = useState({ open: false, msg: '', severity: 'success' });
  const [tab, setTab]           = useState(0);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/coding/admin/problems');
      setProblems(r.data || []);
    } catch { setProblems([]); }
    setLoading(false);
  };

  const openNew = () => { setEditing(null); setForm(emptyProblem); setOpen(true); setTab(0); };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      title: p.title || '',
      description: p.description || '',
      difficulty: p.difficulty || 'easy',
      tags: (p.tags || []).join(', '),
      constraints: p.constraints || '',
      hints: (() => { try { return JSON.parse(p.hints || '[]').join('\n'); } catch { return ''; } })(),
      examples: p.examples || '[]',
      test_cases: p.test_cases || '[]',
      starter_code: (() => { try { return JSON.stringify(typeof p.starter_code === 'string' ? JSON.parse(p.starter_code) : p.starter_code, null, 2); } catch { return JSON.stringify(STARTER_TEMPLATE, null, 2); } })(),
      companies: (p.companies || []).join(', '),
    });
    setOpen(true); setTab(0);
  };

  const handleSave = async () => {
    if (!form.title || !form.description) { setSnack({ open: true, msg: 'Title and description are required', severity: 'error' }); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        difficulty: form.difficulty,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        constraints: form.constraints,
        hints: form.hints.split('\n').filter(Boolean),
        examples: (() => { try { return JSON.parse(form.examples); } catch { return []; } })(),
        test_cases: (() => { try { return JSON.parse(form.test_cases); } catch { return []; } })(),
        starter_code: (() => { try { return JSON.parse(form.starter_code); } catch { return STARTER_TEMPLATE; } })(),
        companies: form.companies.split(',').map(c => c.trim()).filter(Boolean),
      };
      if (editing) await api.put(`/coding/admin/problems/${editing}`, payload);
      else await api.post('/coding/admin/problems', payload);
      setSnack({ open: true, msg: editing ? 'Problem updated!' : 'Problem created!', severity: 'success' });
      setOpen(false);
      load();
    } catch (e) {
      setSnack({ open: true, msg: 'Failed: ' + (e.response?.data?.error || e.message), severity: 'error' });
    }
    setSaving(false);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Archive problem "${title}"?`)) return;
    try {
      await api.delete(`/coding/admin/problems/${id}`);
      setSnack({ open: true, msg: 'Problem archived', severity: 'success' });
      load();
    } catch { setSnack({ open: true, msg: 'Failed to archive', severity: 'error' }); }
  };

  const filtered = problems.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) ||
    (p.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <Box sx={{ mb:3, display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk',sans-serif">Coding Problems</Typography>
          <Typography color="text.secondary" fontSize="0.875rem">{problems.filter(p => p.is_active !== false).length} active problems</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}
          sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', fontWeight:700, borderRadius:'10px', boxShadow:'none' }}>
          Add Problem
        </Button>
      </Box>

      <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'14px', p:2, mb:3 }}>
        <TextField fullWidth size="small" placeholder="Search problems by title or tag..."
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon sx={{ color:'#9CA3AF', fontSize:18 }}/></InputAdornment> }}
          sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
      </Card>

      <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', overflow:'hidden' }}>
        {loading ? (
          <Box sx={{ display:'flex', justifyContent:'center', py:6 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ overflowX:'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor:'#F9FAFB' }}>
                  {['#','Title','Difficulty','Tags','Accepted','Submissions','Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight:700, fontSize:'0.7rem', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', py:1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p, i) => (
                  <TableRow key={p.id} sx={{ '&:hover':{ bgcolor:'#FAFAFA' }, opacity: p.is_active === false ? 0.5 : 1 }}>
                    <TableCell><Typography fontSize="0.78rem" color="#9CA3AF" fontFamily="monospace">{p.id}</Typography></TableCell>
                    <TableCell sx={{ maxWidth:220 }}>
                      <Typography fontWeight={700} fontSize="0.82rem" sx={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {p.title}
                      </Typography>
                      {p.companies?.length > 0 && (
                        <Typography variant="caption" color="text.secondary">{p.companies.slice(0,2).join(', ')}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={p.difficulty} size="small"
                        sx={{ bgcolor:DIFF_COLORS[p.difficulty]+'22', color:DIFF_COLORS[p.difficulty], fontWeight:700, fontSize:'0.68rem' }} />
                    </TableCell>
                    <TableCell sx={{ maxWidth:150 }}>
                      <Box sx={{ display:'flex', gap:0.5, flexWrap:'wrap' }}>
                        {(p.tags || []).slice(0,2).map(t => (
                          <Chip key={t} label={t} size="small" sx={{ bgcolor:'#F1F5F9', fontSize:'0.62rem', height:18 }} />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell><Typography fontSize="0.78rem" color="#10B981" fontWeight={600}>{p.accepted || 0}</Typography></TableCell>
                    <TableCell><Typography fontSize="0.78rem" color="#9CA3AF">{p.total_submissions || 0}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display:'flex', gap:0.5 }}>
                        <IconButton size="small" onClick={() => openEdit(p)} sx={{ color:'#4F46E5' }}><EditIcon sx={{ fontSize:15 }} /></IconButton>
                        <IconButton size="small" onClick={() => handleDelete(p.id, p.title)} sx={{ color:'#EF4444' }}><DeleteIcon sx={{ fontSize:15 }} /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} sx={{ textAlign:'center', py:6, color:'#9CA3AF' }}>
                    {search ? 'No problems match search' : 'No problems yet. Create one!'}
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx:{ borderRadius:'16px' } }}>
        <DialogTitle sx={{ fontWeight:800, pb:1 }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
            <CodeIcon sx={{ color:'#4F46E5' }} />
            {editing ? 'Edit Problem' : 'Add New Problem'}
          </Box>
        </DialogTitle>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px:3, borderBottom:'1px solid #E5E7EB',
          '& .MuiTab-root':{ textTransform:'none', fontWeight:600 }, '& .Mui-selected':{ color:'#4F46E5' }, '& .MuiTabs-indicator':{ bgcolor:'#4F46E5' } }}>
          <Tab label="Basic Info" />
          <Tab label="Examples" />
          <Tab label="Test Cases" />
          <Tab label="Starter Code" />
        </Tabs>
        <DialogContent sx={{ pt:3 }}>
          {tab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={9}>
                <TextField label="Problem Title *" fullWidth size="small" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Difficulty *</InputLabel>
                  <Select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} label="Difficulty *">
                    <MenuItem value="easy" sx={{ color:'#00b8a3' }}>Easy</MenuItem>
                    <MenuItem value="medium" sx={{ color:'#ffc01e' }}>Medium</MenuItem>
                    <MenuItem value="hard" sx={{ color:'#ff375f' }}>Hard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Description * (Markdown supported)" fullWidth multiline rows={6} size="small"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the problem clearly. You can use **bold**, `code`, and newlines." />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Tags (comma-separated)" fullWidth size="small" value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="array, dynamic-programming, string" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Companies (comma-separated)" fullWidth size="small" value={form.companies}
                  onChange={e => setForm(f => ({ ...f, companies: e.target.value }))}
                  placeholder="Amazon, Google, Microsoft" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Constraints" fullWidth multiline rows={2} size="small"
                  value={form.constraints} onChange={e => setForm(f => ({ ...f, constraints: e.target.value }))}
                  placeholder="1 ≤ n ≤ 10^5" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Hints (one per line)" fullWidth multiline rows={2} size="small"
                  value={form.hints} onChange={e => setForm(f => ({ ...f, hints: e.target.value }))}
                  placeholder="Think about using a hash map&#10;Consider sorting first" />
              </Grid>
            </Grid>
          )}
          {tab === 1 && (
            <Box>
              <Alert severity="info" sx={{ mb:2, borderRadius:'10px', fontSize:'0.8rem' }}>
                JSON array of {'{'}input, output, explanation{'}'} objects. These are shown to students as sample examples.
              </Alert>
              <TextField fullWidth multiline rows={10} size="small" value={form.examples}
                onChange={e => setForm(f => ({ ...f, examples: e.target.value }))}
                inputProps={{ style:{ fontFamily:'monospace', fontSize:'0.8rem' } }}
                placeholder='[{"input":"nums = [2,7,11,15], target = 9","output":"[0,1]","explanation":"nums[0]+nums[1]=9"}]' />
            </Box>
          )}
          {tab === 2 && (
            <Box>
              <Alert severity="warning" sx={{ mb:2, borderRadius:'10px', fontSize:'0.8rem' }}>
                JSON array of {'{'}input, expected_output, hidden{'}'} objects. Set hidden:true for secret test cases. Input/output must match exactly what your code reads/prints.
              </Alert>
              <TextField fullWidth multiline rows={10} size="small" value={form.test_cases}
                onChange={e => setForm(f => ({ ...f, test_cases: e.target.value }))}
                inputProps={{ style:{ fontFamily:'monospace', fontSize:'0.8rem' } }}
                placeholder='[{"input":"9\n2 7 11 15","expected_output":"0 1","hidden":false},{"input":"6\n3 2 4","expected_output":"1 2","hidden":true}]' />
              <Typography variant="caption" color="text.secondary" sx={{ mt:1, display:'block' }}>
                Tip: input is exactly what stdin receives. expected_output is exactly what stdout should print (trimmed).
              </Typography>
            </Box>
          )}
          {tab === 3 && (
            <Box>
              <Alert severity="info" sx={{ mb:2, borderRadius:'10px', fontSize:'0.8rem' }}>
                JSON object with keys: python, java, c, csharp, javascript. Each value is the starter code string shown in the editor.
              </Alert>
              <TextField fullWidth multiline rows={14} size="small" value={form.starter_code}
                onChange={e => setForm(f => ({ ...f, starter_code: e.target.value }))}
                inputProps={{ style:{ fontFamily:'monospace', fontSize:'0.8rem' } }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px:3, pb:3 }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform:'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            startIcon={saving ? <CircularProgress size={14} sx={{ color:'#fff' }} /> : null}
            sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', fontWeight:700, borderRadius:'10px', boxShadow:'none' }}>
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Problem'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert severity={snack.severity} sx={{ borderRadius:'10px' }}>{snack.msg}</Alert>
      </Snackbar>
    </AdminLayout>
  );
}
