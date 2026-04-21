import React, { useState, useEffect } from 'react';
import { fetchWorkshopFeedback } from '../components/workshop/workshopApi';

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}22`,
      borderRadius: '16px', padding: '1.25rem',
      display: 'flex', alignItems: 'center', gap: '1rem',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', flexShrink: 0,
        background: `${color}20`, border: `1px solid ${color}40`,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
        <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, marginTop: '0.2rem' }}>{value}</p>
      </div>
    </div>
  );
}

function StarDisplay({ value, max = 5 }) {
  return (
    <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ color: i < Math.round(value) ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}>★</span>
      ))}
      <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '0.25rem', fontSize: '0.75rem' }}>{Number(value).toFixed(1)}</span>
    </span>
  );
}

function FeedbackRow({ fb, index }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(fb.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const rowBase = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px', overflow: 'hidden', marginBottom: '0.75rem',
  };

  return (
    <div style={rowBase}>
      {/* Summary */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center', gap: '1rem',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', fontSize: '0.75rem', width: 24, flexShrink: 0 }}>#{index + 1}</span>
        <StarDisplay value={fb.overallRating} />
        <span style={{
          fontSize: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontFamily: 'monospace', flexShrink: 0,
          background: fb.recommend ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
          color: fb.recommend ? '#10b981' : '#ef4444',
          border: `1px solid ${fb.recommend ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
        }}>
          {fb.recommend ? '👍 Yes' : '👎 No'}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fb.likedMost}</span>
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', fontFamily: 'monospace', flexShrink: 0 }}>{date}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Expanded */}
      {expanded && (
        <div style={{
          padding: '1rem 1.5rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem',
        }}>
          {/* Technical */}
          <div>
            <h4 style={{ color: 'rgba(6,182,212,0.6)', fontSize: '0.7rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Technical</h4>
            {[['React', fb.reactConfidence], ['JavaScript', fb.jsUnderstanding], ['Node.js', fb.nodeClarity], ['MongoDB', fb.mongodbConfidence], ['Best Topic', fb.bestTopic], ['Needs Work', fb.improvementTopic]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{k}</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontFamily: 'monospace' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Faculty */}
          <div>
            <h4 style={{ color: 'rgba(245,158,11,0.6)', fontSize: '0.7rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Faculty Ratings</h4>
            {[['Mohan', fb.mohanRating], ['Raghav', fb.raghavRating], ['Manish', fb.manishRating]].map(([name, r]) => r && (
              <div key={name} style={{ marginBottom: '0.75rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>{name}</p>
                <div style={{ paddingLeft: '0.5rem' }}>
                  {[['Knowledge', r.knowledge], ['Clarity', r.clarity], ['Interaction', r.interaction]].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>{l}</span>
                      <StarDisplay value={v} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Comments */}
          <div>
            <h4 style={{ color: 'rgba(236,72,153,0.6)', fontSize: '0.7rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Comments</h4>
            {fb.improvement && (
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Improvements</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', lineHeight: 1.6 }}>{fb.improvement}</p>
              </div>
            )}
            {fb.suggestions && (
              <div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Suggestions</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', lineHeight: 1.6 }}>{fb.suggestions}</p>
              </div>
            )}
            {!fb.improvement && !fb.suggestions && (
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', fontStyle: 'italic' }}>No comments provided</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminWorkshopFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats,     setStats]     = useState({});
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [filters,   setFilters]   = useState({ rating: '', recommend: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.rating)    params.rating    = filters.rating;
      if (filters.recommend !== '') params.recommend = filters.recommend;
      const result = await fetchWorkshopFeedback(params);
      setFeedbacks(result.feedbacks);
      setStats(result.stats);
      setTotal(result.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, [filters]);

  const recommendPct = stats.totalResponses
    ? Math.round((stats.recommendCount / stats.totalResponses) * 100)
    : 0;

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: 'rgba(168,85,247,0.6)', fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          Admin Panel
        </p>
        <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 800 }}>
          Workshop <span style={{ color: '#a855f7', fontStyle: 'italic' }}>Feedback</span>
        </h1>
      </div>

      {/* Stats */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard label="Responses"       value={total}                                                     icon="📊" color="#7c3aed" />
          <StatCard label="Avg Rating"      value={stats.avgRating ? `${Number(stats.avgRating).toFixed(1)} ★` : '—'} icon="⭐" color="#f59e0b" />
          <StatCard label="Would Recommend" value={`${recommendPct}%`}                                        icon="👍" color="#10b981" />
          <StatCard label="Mohan Avg"       value={stats.avgMohanKnowledge ? `${Number(stats.avgMohanKnowledge).toFixed(1)}★` : '—'} icon="👨‍💻" color="#06b6d4" />
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem',
        display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Filter:</span>
        <select
          value={filters.rating}
          onChange={e => setFilters(f => ({ ...f, rating: e.target.value }))}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', borderRadius: '8px', padding: '0.5rem 0.75rem' }}
        >
          <option value="">All Ratings</option>
          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
        </select>
        <select
          value={filters.recommend}
          onChange={e => setFilters(f => ({ ...f, recommend: e.target.value }))}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', borderRadius: '8px', padding: '0.5rem 0.75rem' }}
        >
          <option value="">All Responses</option>
          <option value="true">Would Recommend</option>
          <option value="false">Would Not Recommend</option>
        </select>
        {(filters.rating || filters.recommend) && (
          <button
            onClick={() => setFilters({ rating: '', recommend: '' })}
            style={{ background: 'none', border: 'none', color: 'rgba(168,85,247,0.6)', fontSize: '0.75rem', fontFamily: 'monospace', cursor: 'pointer' }}
          >
            Clear filters ×
          </button>
        )}
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', fontFamily: 'monospace' }}>{feedbacks.length} shown</span>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '0.75rem' }}>
          <span style={{
            display: 'inline-block', width: 24, height: 24,
            border: '2px solid rgba(168,85,247,0.3)', borderTopColor: '#a855f7',
            borderRadius: '50%', animation: 'workshopSpin 1s linear infinite',
          }} />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: '0.875rem' }}>Loading responses...</span>
          <style>{`@keyframes workshopSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '6rem 0' }}>
          <p style={{ color: 'rgba(239,68,68,0.7)' }}>{error}</p>
          <button onClick={loadData} style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.75rem' }}>
            Try again
          </button>
        </div>
      ) : feedbacks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 0' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</p>
          <p style={{ color: 'rgba(255,255,255,0.3)' }}>No feedback yet. Share the form to get started!</p>
        </div>
      ) : (
        <div>
          {feedbacks.map((fb, i) => <FeedbackRow key={fb._id} fb={fb} index={i} />)}
        </div>
      )}
    </div>
  );
}
