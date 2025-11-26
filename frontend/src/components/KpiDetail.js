import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function KpiDetail() {
  const { id } = useParams();
  const [kpi, setKpi] = useState(null);
  const [entries, setEntries] = useState([]);
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    const res = await api.get(`/kpis/${id}`);
    setKpi(res.data);
    const res2 = await api.get(`/kpi-entries/kpi/${id}`);
    setEntries(res2.data);
  };

  const submitEntry = async (e) => {
    e.preventDefault();
    await api.post('/kpi-entries', { kpi_id: id, value: Number(value), period_start: date });
    setValue('');
    setDate('');
    load();
  };

  if (!kpi) return <div>Loading...</div>;

  const progress = kpi.target_value ? Math.round((Number(kpi.current_value || 0) / Number(kpi.target_value)) * 100) : 0;

  return (
    <div className="app-container">
      <Link to="/dashboard" className="back-link">← Back to dashboard</Link>
      <div className="kpi-card">
        <h2>{kpi.name}</h2>
        <p>{kpi.description}</p>
        <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={entries.map(e => ({ date: e.period_start, value: Number(e.value) }))}>
            <XAxis dataKey="date" />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#82ca9d" fill="#82ca9d" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
        <div style={{ marginTop: 12 }}>
          <div className="small-muted">Progress to target: {progress}% ({kpi.target_value ?? '-'})</div>
          <div className="kpi-progress" style={{ marginTop: 8 }}>
            <div className="kpi-progress-fill" style={{ width: `${progress}%`, background: '#4caf50' }} />
          </div>
          <form onSubmit={submitEntry} style={{ marginTop: 12 }}>
            <div className="form-row">
              <label>Value</label>
              <input value={value} onChange={e => setValue(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Date (YYYY-MM-DD)</label>
              <input value={date} onChange={e => setDate(e.target.value)} placeholder="2025-11-01" />
            </div>
            <button type="submit">Add entry</button>
          </form>
        </div>
      </div>
    </div>
  );
}
