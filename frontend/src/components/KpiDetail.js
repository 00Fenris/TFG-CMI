import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import jwt_decode from 'jwt-decode';

export default function KpiDetail() {
  const { id } = useParams();
  const [kpi, setKpi] = useState(null);
  const [entries, setEntries] = useState([]);
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');

  // Edit KPI form state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFormula, setEditFormula] = useState('');
  const [editTargetValue, setEditTargetValue] = useState('');
  const [editAlertCondition, setEditAlertCondition] = useState('below');
  const [editAlertThreshold, setEditAlertThreshold] = useState('');

  const token = localStorage.getItem('token');
  const user = token ? jwt_decode(token) : null;
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    const res = await api.get(`/kpis/${id}`);
    setKpi(res.data);
    
    // Initialize edit form states
    setEditName(res.data.name || '');
    setEditDescription(res.data.description || '');
    setEditFormula(res.data.formula || '');
    setEditTargetValue(res.data.target_value || '');
    setEditAlertCondition(res.data.alert_condition || 'below');
    setEditAlertThreshold(res.data.alert_threshold || '');

    const res2 = await api.get(`/kpi-entries/kpi/${id}`);
    setEntries(res2.data);
  };

  const submitEntry = async (e) => {
    e.preventDefault();
    if (!value || !date) {
      alert('Por favor ingresa valor y fecha');
      return;
    }
    try {
      await api.post('/kpi-entries', {
        kpi_id: parseInt(id),
        value: Number(value),
        period_start: date
      });
      setValue('');
      setDate('');
      load();
    } catch (err) {
      console.error('Error adding entry:', err);
      alert('Error al agregar entrada: ' + (err.response?.data?.message || err.message));
    }
  };

  const updateKpiConfig = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/kpis/${id}`, {
        name: editName,
        description: editDescription,
        formula: editFormula,
        target_value: editTargetValue === '' ? null : Number(editTargetValue),
        alert_condition: editAlertCondition,
        alert_threshold: editAlertThreshold === '' ? null : Number(editAlertThreshold)
      });
      alert('Configuración del KPI actualizada correctamente');
      load();
    } catch (err) {
      console.error('Error updating KPI config:', err);
      alert('Error al actualizar configuración: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!kpi) return <div style={{ padding: 40, color: '#fff' }}>Loading...</div>;

  const progress = kpi.target_value ? Math.round((Number(kpi.current_value || 0) / Number(kpi.target_value)) * 100) : 0;

  return (
    <div className="app-container">
      <Link to="/dashboard" className="back-link">← Volver al Dashboard</Link>
      
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 16 }}>
        {/* Left Column: KPI Info, Chart and Entry Form */}
        <div style={{ flex: 1, minWidth: 320 }} className="kpi-card">
          <h2>{kpi.name}</h2>
          <p>{kpi.description}</p>
          {kpi.formula && <p className="small-muted" style={{ fontStyle: 'italic' }}>Fórmula: {kpi.formula}</p>}
          
          <div style={{ width: '100%', height: 300, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={entries.map(e => ({ date: e.period_start, value: Number(e.value) }))}>
                <defs>
                  <linearGradient id={`g${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#82ca9d" fillOpacity={1} fill={`url(#g${kpi.id})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{ marginTop: 20 }}>
            <div className="small-muted">Cumplimiento del objetivo: {progress}% (Meta: {kpi.target_value ?? '-'})</div>
            <div className="kpi-progress" style={{ marginTop: 8 }}>
              <div className="kpi-progress-fill" style={{ width: `${Math.min(100, Math.max(0, progress))}%`, background: '#4caf50' }} />
            </div>
            
            <form onSubmit={submitEntry} style={{ marginTop: 24, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
              <h4>Añadir nuevo registro manual</h4>
              <div className="form-row">
                <label>Valor</label>
                <input value={value} onChange={e => setValue(e.target.value)} placeholder="Ej: 65" />
              </div>
              <div className="form-row">
                <label>Fecha de registro (AAAA-MM-DD)</label>
                <input value={date} onChange={e => setDate(e.target.value)} placeholder="Ej: 2024-12-01" />
              </div>
              <button type="submit" style={{ background: 'var(--success)' }}>Registrar dato</button>
            </form>
          </div>
        </div>

        {/* Right Column: Edit parameters (Admin Only) */}
        {isAdmin && (
          <div style={{ flex: 1, minWidth: 320 }} className="kpi-card">
            <h3>⚙️ Configuración del CMI (Parámetros)</h3>
            <p className="small-muted" style={{ marginBottom: 20 }}>Ajusta los targets, fórmulas y límites de alarma estratégico para este KPI.</p>
            
            <form onSubmit={updateKpiConfig}>
              <div className="form-row">
                <label>Nombre del Indicador</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              
              <div className="form-row">
                <label>Descripción</label>
                <input value={editDescription} onChange={e => setEditDescription(e.target.value)} />
              </div>
              
              <div className="form-row">
                <label>Fórmula de Cálculo</label>
                <input value={editFormula} onChange={e => setEditFormula(e.target.value)} />
              </div>
              
              <div className="form-row">
                <label>Meta del Indicador (Target Value)</label>
                <input type="number" step="any" value={editTargetValue} onChange={e => setEditTargetValue(e.target.value)} />
              </div>
              
              <div className="form-row">
                <label>Condición de Alarma</label>
                <select value={editAlertCondition} onChange={e => setEditAlertCondition(e.target.value)}>
                  <option value="below">Por debajo del límite (below)</option>
                  <option value="above">Por encima del límite (above)</option>
                </select>
              </div>
              
              <div className="form-row">
                <label>Límite de Alarma (Threshold Ratio)</label>
                <input type="number" step="any" value={editAlertThreshold} onChange={e => setEditAlertThreshold(e.target.value)} placeholder="Ej: 0.95 (alertar si baja del 95% del target)" />
              </div>
              
              <button type="submit" style={{ width: '100%', marginTop: 8 }}>Guardar Configuración</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
