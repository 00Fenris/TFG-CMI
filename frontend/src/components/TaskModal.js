import React, { useState } from 'react';
import api from '../lib/api';

export default function TaskModal({ kpi, onClose, onTaskAdded }) {
  const [title, setTitle] = useState(`Corregir desviación en ${kpi.name}`);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title,
        description: description || `Acción correctiva asignada desde el CMI para el indicador: ${kpi.name}`,
        due_date: dueDate || null,
        status: 'todo',
        priority: 'high',
        assigned_to: kpi.owner_id,
        objective_id: kpi.objective_id
      });
      onTaskAdded();
      onClose();
    } catch (err) {
      console.error('Error creando tarea', err);
    }
  };

  return (
    <div className="catalog-overlay">
      <div className="catalog-modal glass-panel" style={{ maxWidth: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: 'var(--accent-cyan)' }}>Asignar OKR / Tarea Correctiva</h3>
          <button className="btn-secondary" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 12 }}>
            <label className="small-muted" style={{ display: 'block', marginBottom: 4 }}>Título del OKR</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} required />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="small-muted" style={{ display: 'block', marginBottom: 4 }}>Instrucciones (Contexto)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ width: '100%', padding: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} placeholder={`Detalles para corregir ${kpi.name}...`} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="small-muted" style={{ display: 'block', marginBottom: 4 }}>Fecha Límite</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Desplegar OKR en Cascada</button>
          </div>
        </form>
      </div>
    </div>
  );
}
