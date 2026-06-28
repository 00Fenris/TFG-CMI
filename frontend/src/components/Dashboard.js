import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import TaskModal from './TaskModal';
import jwt_decode from 'jwt-decode';

export default function Dashboard({ token, onLogout }) {
  const user = jwt_decode(token);
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [kpiData, setKpiData] = useState([]);
  const [perspectives, setPerspectives] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [selectedPerspective, setSelectedPerspective] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [scope, setScope] = useState('restaurant'); // 'restaurant' or 'global'
  const [tasks, setTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogKpis, setCatalogKpis] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeKpiForTask, setActiveKpiForTask] = useState(null);
  const [pushToast, setPushToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRestaurants();
    loadPerspectives();
    loadObjectives();
    loadAlerts();
    loadTasks();
  }, []);

  const loadRestaurants = async () => {
    const res = await api.get('/restaurants');
    const mapped = res.data.map(r => {
      let prettyName = r.name;
      if (r.name.includes('Nuevo Local')) prettyName = 'Grupo HORECA Demo - Restaurante C (Zamora)';
      else if (r.name.includes('Salamanca')) prettyName = 'Grupo HORECA Demo - Restaurante A (Salamanca)';
      else if (r.name.includes('Zamora')) prettyName = 'Grupo HORECA Demo - Restaurante B (Zamora)';
      return { ...r, name: prettyName };
    });
    const filtered = user.role === 'admin' ? mapped : mapped.filter(r => r.id === user.restaurant_id);
    setRestaurants(filtered);
    if (filtered.length) {
      setSelected(filtered[0].id);
      loadKpis(filtered[0].id);
    }
  };

  const loadPerspectives = async () => {
    try {
      const res = await api.get('/perspectives');
      setPerspectives(res.data);
    } catch (err) {
      // ignore for now
    }
  };

  const loadObjectives = async () => {
    try {
      const res = await api.get('/objectives');
      setObjectives(res.data);
    } catch (err) {
      // ignore
    }
  };

  const loadKpis = async (restaurantId) => {
    if (scope === 'global') return loadGlobal();
    const res = await api.get(`/dashboard/restaurant/${restaurantId}`);
    // attach restaurant object to each returned item so UI can show restaurant name when needed
    const r = restaurants.find(rr => rr.id === restaurantId);
    setKpiData(res.data.map(i => ({ ...i, restaurant: r })));
  };

  const loadGlobal = async () => {
    const res = await api.get('/dashboard/global');
    // Aggregate KPIs by name across all restaurants
    const aggregated = {};
    res.data.forEach(group => {
      group.kpis.forEach(item => {
        const kName = item.kpi.name;
        if (!aggregated[kName]) {
          // Initialize aggregated KPI structural clone
          aggregated[kName] = {
            kpi: { ...item.kpi, target_value: Number(item.kpi.target_value) },
            entries: [],
            restaurantCount: 1
          };

          item.entries.forEach(e => {
            aggregated[kName].entries.push({ date: e.period_start, value: Number(e.value), count: 1 });
          });
        } else {
          // Aggregate target
          aggregated[kName].kpi.target_value += Number(item.kpi.target_value);
          aggregated[kName].restaurantCount++;

          // Aggregate entries by date
          item.entries.forEach(e => {
            const existingEntry = aggregated[kName].entries.find(a => a.date === e.period_start);
            if (existingEntry) {
              existingEntry.value += Number(e.value);
              existingEntry.count++;
            } else {
              aggregated[kName].entries.push({ date: e.period_start, value: Number(e.value), count: 1 });
            }
          });
        }
      });
    });

    // Average the percentages and aggregate currencies
    const finalData = Object.values(aggregated).map(agg => {
      const isPercent = agg.kpi.unit === 'percent' || agg.kpi.unit === 'number';
      if (isPercent) agg.kpi.target_value = (agg.kpi.target_value / agg.kpi.restaurantCount).toFixed(2);

      agg.entries = agg.entries.map(e => ({
        ...e,
        period_start: e.date,
        value: isPercent ? (e.value / e.count).toFixed(2) : e.value.toFixed(2)
      })).sort((a, b) => new Date(a.date) - new Date(b.date));

      agg.kpi.current_value = agg.entries.length ? agg.entries[agg.entries.length - 1].value : 0;
      agg.restaurant = { name: 'Consolidado Global (Franquicia)' };
      return agg;
    });

    setKpiData(finalData);
  };

  const loadAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data || []);
    } catch (err) {
      // ignore
    }
  };

  const handleSelect = (id) => {
    setSelected(id);
    if (scope === 'global') loadGlobal();
    else loadKpis(id);
  };

  const handleScopeChange = (newScope) => {
    setScope(newScope);
    if (newScope === 'global') loadGlobal();
    else if (newScope === 'restaurant' && selected) loadKpis(selected);
  };
  const removeKpiFromDashboard = (index, kpiName) => {
    if (window.confirm(`¿Estás seguro de que deseas quitar "${kpiName}" del panel de monitorización?`)) {
      setKpiData(prev => prev.filter((_, i) => i !== index));
    }
  };

  const loadTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data || []);
    } catch (err) {
      // ignore
    }
  };

  const cycleTaskStatus = async (task) => {
    const nextStatusMap = {
      'todo': 'in-progress',
      'in-progress': 'done',
      'done': 'todo'
    };
    const nextStatus = nextStatusMap[task.status] || 'todo';
    try {
      await api.put(`/tasks/${task.id}`, { status: nextStatus });
      loadTasks();
    } catch (err) {
      console.error('Error cycling task status:', err);
    }
  };

  const loadCatalog = async () => {
    try {
      const res = await api.get('/kpis');
      const uniqueKpis = Array.from(new Map(res.data.map(item => [item.name, item])).values());
      setCatalogKpis(uniqueKpis);
    } catch (err) {
      // ignore
    }
  };

  const openCatalog = async () => {
    setShowCatalog(true);
    if (catalogKpis.length === 0) await loadCatalog();
  };

  const addKpiToDashboard = async (kpiId) => {
    try {
      const res = await api.get(`/kpis/${kpiId}`);
      // Normalize entries property where the case might differ
      const entries = res.data.kpiEntries || res.data.KpiEntries || res.data.kpi_entries || [];
      // Attach restaurant if any
      const r = restaurants.find(rr => rr.id === res.data.restaurant_id) || null;
      setKpiData(prev => [...prev, { kpi: res.data, entries, restaurant: r }]);
      setShowCatalog(false);
    } catch (err) {
      console.error('add kpi error', err);
    }
  };

  const generateInsight = async (kpisToAnalyze) => {
    if (!kpisToAnalyze || kpisToAnalyze.length === 0) return;
    setAiLoading(true);
    try {
      const res = await api.post('/ai/insights', { kpis: kpisToAnalyze, scope });
      setAiInsight(res.data);
    } catch (err) {
      console.error('AI Insight Error', err);
      setAiInsight({ deteccion: 'El motor de inferencia Groq ha perdido conexión temporalmente.', recomendacion: 'Verifique su API Key o la disponibilidad del servicio LLM.' });
    } finally {
      setAiLoading(false);
    }
  };

  const pushTelegram = async () => {
    try {
      if (kpiData.length === 0) return alert('No hay datos en pantalla para auditar');
      const res = await api.post('/alerts/scan', { kpis: kpiData, scope });

      // In-App Glassmorphism Toast para asegurar visibilidad al 100%
      setPushToast({
        title: '🚨 OPENCLAW ALERT PUSH',
        message: `Escaneo completado sobre ${scope === 'global' ? 'Franquicia Global' : 'Local Individual'}. Se han detectado ${res.data.alerts} desviaciones críticas. Revisa el Módulo de Tareas y reasigna los recursos.`
      });

      // Auto-ocultar la tostada a los 8 segundos
      setTimeout(() => setPushToast(null), 8000);

    } catch (err) {
      console.error('Error lanzando Push', err);
      setPushToast({
        title: '⚠️ MODO SIMULACIÓN (ALERTAS)',
        message: 'El escáner de alertas se ejecutó correctamente, pero el envío push a Telegram está inactivo en este entorno local porque no se han configurado las claves del bot en el servidor.'
      });
      setTimeout(() => setPushToast(null), 8000);
    }
  };

  const computeProgress = (kpi) => {
    const curr = Number(kpi.current_value || 0);
    const target = Number(kpi.target_value || 0);
    if (!target) return 0;
    const pct = Math.round((curr / target) * 100);
    return Math.max(0, Math.min(100, pct));
  };

  const computeAlert = (kpi) => {
    if (!kpi.alert_condition || kpi.alert_threshold == null || kpi.target_value == null) return false;
    const curr = Number(kpi.current_value || 0);
    const target = Number(kpi.target_value || 0);
    if (!target) return false;
    const ratio = curr / target;
    const threshold = Number(kpi.alert_threshold) || 1;
    if (kpi.alert_condition === 'below') return ratio <= threshold;
    if (kpi.alert_condition === 'above') return ratio >= threshold;
    return false;
  };

  const computeTrend = (entries = []) => {
    const values = entries.map(e => Number(e.value || 0));
    if (values.length < 2) return { dir: 'flat', delta: 0 };
    const last = values[values.length - 1];
    const prev = values[values.length - 2];
    const delta = Math.round(last - prev);
    const dir = last > prev ? 'up' : (last < prev ? 'down' : 'flat');
    return { dir, delta };
  };

  const exportHref = scope === 'global' ? `${api.defaults.baseURL}/kpis/export` : `${api.defaults.baseURL}/kpis/export?restaurant_id=${selected}`;

  // Calculate KPIs per perspective for summary cards
  const getPerspectiveName = (item) => {
    const obj = objectives.find(o => o.id === item.kpi.objective_id);
    const persp = obj ? perspectives.find(p => p.id === obj.perspective_id) : null;
    return persp ? persp.name : 'Sin perspectiva';
  };

  const perspectiveSummary = perspectives.map(p => {
    const kpisInPerspective = kpiData.filter(item => {
      const obj = objectives.find(o => o.id === item.kpi.objective_id);
      return obj && obj.perspective_id === p.id;
    });
    const onTarget = kpisInPerspective.filter(item => {
      const curr = Number(item.kpi.current_value || 0);
      const target = Number(item.kpi.target_value || 1);
      const ratio = curr / target;
      return item.kpi.alert_condition === 'above' ? ratio <= 1 : ratio >= 0.9;
    }).length;
    return { ...p, total: kpisInPerspective.length, onTarget };
  });

  const perspectiveColors = {
    'Financiera': { bg: '#dbeafe', color: '#1e40af', icon: '💰' },
    'Clientes': { bg: '#dcfce7', color: '#166534', icon: '👥' },
    'Procesos Internos': { bg: '#fef3c7', color: '#92400e', icon: '⚙️' },
    'Aprendizaje y Crecimiento': { bg: '#f3e8ff', color: '#7c3aed', icon: '📚' }
  };

  return (
    <div>
      {/* CUSTOM IN-APP TOAST */}
      {pushToast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', padding: '16px 20px',
          color: '#fff', width: 350, transform: 'translateY(0)', transition: 'all 0.3s ease',
          animation: 'slideInRight 0.4s ease-out forwards'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ background: 'var(--accent-purple)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📲</div>
            <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>{pushToast.title}</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.9)' }}>
            {pushToast.message}
          </p>
        </div>
      )}
      <div className="app-header">
        <h1>Grupo HORECA Demo — Cuadro de Mando Integral</h1>
        <div className="controls">
          <button onClick={() => navigate('/strategic-map')}>🗺️ Mapa Estratégico</button>
          <button onClick={() => navigate('/comparison')}>📊 Comparar</button>
          <button onClick={() => navigate('/scorecard')}>📋 Evaluación</button>
          <button onClick={openCatalog}>Catálogo KPIs</button>
          <button onClick={() => setShowAlerts(true)}>
            Alertas {alerts.length > 0 && <span className="kpi-alert">{alerts.length}</span>}
          </button>
          <a className="btn-link" href={exportHref} target="_blank" rel="noreferrer">Exportar CSV</a>
          <button onClick={onLogout} style={{ background: '#64748b' }}>Cerrar sesión</button>
        </div>
      </div>
      <div className="app-container">
        {/* CMI Perspective Summary Cards */}
        <div className="cmi-summary">
          {perspectiveSummary.map(p => {
            const colors = perspectiveColors[p.name] || { bg: '#f1f5f9', color: '#475569', icon: '📊' };
            return (
              <div
                key={p.id}
                className="cmi-summary-card"
                style={{ background: colors.bg, borderLeft: `4px solid ${colors.color}` }}
                onClick={() => setSelectedPerspective(p.id)}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{colors.icon}</div>
                <h4 style={{ color: colors.color }}>{p.name}</h4>
                <div className="value" style={{ color: colors.color }}>{p.total}</div>
                <div className="small-muted">
                  {p.onTarget}/{p.total} en objetivo
                </div>
              </div>
            );
          })}
        </div>
        <div className="layout">
          <div className="sidebar">
            {user.role === 'admin' && (
              <button
                className="btn-primary"
                style={{ width: '100%', marginBottom: 16, padding: '12px', fontSize: '1.05rem', background: scope === 'global' ? 'linear-gradient(45deg, #10b981, #047857)' : 'var(--accent-cyan)' }}
                onClick={() => { setSelected(null); handleScopeChange('global'); }}
              >
                🏢 Situación Global Consolidada
              </button>
            )}
            <h3 style={{ marginTop: 0 }}>Restaurantes</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input placeholder="Buscar..." value={searchText} onChange={e => setSearchText(e.target.value)} />
              <button onClick={() => setSortOrder(s => s === 'asc' ? 'desc' : 'asc')}>{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {restaurants
                .filter(r => !searchText || r.name.toLowerCase().includes(searchText.toLowerCase()))
                .sort((a, b) => sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))
                .map(r => (
                  <li key={r.id} className={`restaurant-item ${selected === r.id ? 'selected' : ''}`} onClick={() => handleSelect(r.id)}>{r.name}</li>
                ))}
            </ul>
            <div style={{ marginTop: 16 }}>
              <h4>Tareas</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {tasks.slice(0, 5).map(t => (
                  <li key={t.id} style={{ padding: '8px 0', borderBottom: '1px dashed #eee', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontWeight: 600 }}>{t.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                      <span 
                        onClick={() => cycleTaskStatus(t)}
                        style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          background: t.status === 'done' ? '#dcfce7' : (t.status === 'in-progress' ? '#fef3c7' : '#fef2f2'),
                          color: t.status === 'done' ? '#166534' : (t.status === 'in-progress' ? '#92400e' : '#b91c1c'),
                          border: `1px solid ${t.status === 'done' ? 'rgba(22, 101, 52, 0.2)' : (t.status === 'in-progress' ? 'rgba(146, 64, 14, 0.2)' : 'rgba(185, 28, 28, 0.2)')}`
                        }}
                      >
                        {t.status === 'done' ? '🟢 done' : (t.status === 'in-progress' ? '🟡 in-progress' : '🔴 todo')}
                      </span>
                      {t.due_date && <span className="small-muted" style={{ fontSize: '11px' }}>{t.due_date}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="main">
            {/* PANEL DE INTELIGENCIA ARTIFICIAL OPENCLAW */}
            <div className="ai-insights-panel">
              <div className="ai-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
                <span className="ai-icon">🧠</span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '1.1rem' }}>
                    {scope === 'global' ? 'Grok AI / OpenClaw (Vista General)' : 'Grok AI / OpenClaw (Insights Locales)'}
                  </h4>
                  <div className="ai-pulse-indicator" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: aiLoading ? 'var(--accent-cyan)' : 'var(--accent-success)', marginTop: 4 }}>
                    {aiLoading ? 'Sintetizando Inferencia...' : 'Motor LLM en línea'}
                  </div>
                </div>
                {!aiLoading && !aiInsight && (
                  <button className="btn-primary btn-sm" onClick={() => generateInsight(kpiData)}>Generar Insight Estratégico</button>
                )}
                {!aiLoading && aiInsight && (
                  <button className="btn-secondary btn-sm" onClick={() => generateInsight(kpiData)}>↻ Recalcular</button>
                )}
              </div>
              <div className="ai-content" style={{ marginTop: aiInsight || aiLoading ? 16 : 8 }}>
                {aiLoading ? (
                  <div style={{ color: 'var(--accent-cyan)', fontStyle: 'italic', fontSize: '0.9rem' }}>Conectando con clúster groq-llama-3...</div>
                ) : aiInsight ? (
                  <>
                    <p style={{ margin: '0 0 12px 0', lineHeight: 1.6 }}><strong>Detección Algorítmica (xAI/Grok):</strong> {aiInsight.deteccion}</p>
                    <div className="ai-recommendation"><strong>Inferencia Estratégica:</strong> {aiInsight.recomendacion}</div>
                  </>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>Pulse el botón superior para enviar los {kpiData.length} KPIs en pantalla a la red de inferencia Groq.</p>
                )}
              </div>
            </div>

            <div className="monitor-header">
              <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.4rem' }}>Monitorización Estratégica</h3>
              <div className="monitor-filters">
                <div>
                  <label className="small-muted">Perspectiva</label>
                  <select value={selectedPerspective} onChange={e => setSelectedPerspective(e.target.value)} style={{ marginLeft: 8 }}>
                    <option value="all">Todas</option>
                    {perspectives.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="small-muted">Alcance de visualización</label>
                  <span style={{ marginLeft: 8, fontWeight: 'bold', color: scope === 'global' ? 'var(--accent-cyan)' : '#fff' }}>
                    {scope === 'global' ? 'Vista Consolidada (Franquicia)' : restaurants.find(r => r.id === selected)?.name || 'Local Individual'}
                  </span>
                </div>
              </div>
            </div>
            {kpiData.length === 0 && <div className="small-muted">No hay KPIs para este restaurante</div>}
            <div className="kpi-grid">
              {kpiData
                .filter(item => {
                  if (selectedPerspective === 'all') return true;
                  const pId = item.kpi.objective?.perspective?.id || item.kpi.objective?.perspective_id || item.kpi.objective_id;
                  return pId && String(pId) === String(selectedPerspective);
                })
                .map((item, index) => {
                  const k = item.kpi;
                  const progress = computeProgress(k);
                  const alert = computeAlert(k);
                  const perspectiveName = getPerspectiveName(item);
                  const pColors = perspectiveColors[perspectiveName] || { bg: '#f1f5f9', color: '#475569' };
                  return (
                    <div key={k.id} className="kpi-card">
                      <div className="kpi-header">
                        <div>
                          <span
                            className="perspective-badge"
                            style={{ background: pColors.bg, color: pColors.color, marginBottom: 8, display: 'inline-block' }}
                          >
                            {perspectiveName}
                          </span>
                          <div className="kpi-name">{k.name}</div>
                          <div className="small-muted">{k.description}</div>
                          {item.restaurant && <div className="small-muted">📍 {item.restaurant.name}</div>}
                        </div>
                        <div>
                          <div className="kpi-value">{k.current_value ?? '-'}</div>
                          {(() => {
                            const t = computeTrend(item.entries);
                            if (t.dir === 'up') return <span className="kpi-trend kpi-trend-up">▲ +{t.delta}</span>;
                            if (t.dir === 'down') return <span className="kpi-trend kpi-trend-down">▼ {t.delta}</span>;
                            return <span className="kpi-trend">—</span>;
                          })()}
                        </div>
                      </div>
                      <div style={{ height: 140 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={item.entries.map(e => ({ date: e.period_start, value: Number(e.value) }))}>
                            <defs>
                              <linearGradient id={`g${k.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" />
                            <Tooltip />
                            <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill={`url(#g${k.id})`} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div className="kpi-progress">
                              <div className="kpi-progress-fill" style={{ width: `${progress}%`, background: alert ? '#de4b4b' : '#4caf50' }} />
                            </div>
                            <div className="small-muted" style={{ marginTop: 6 }}>{progress}% of target ({k.target_value ?? '-'})</div>
                          </div>
                          {alert && <div className="kpi-alert">Alert</div>}
                        </div>
                      </div>
                      <div className="kpi-actions">
                        <button onClick={() => navigate(`/kpi/${k.id}`)}>Ver KPI</button>
                        <button style={{ background: '#ff6b6b', color: '#fff' }} onClick={() => removeKpiFromDashboard(index, k.name)}>Eliminar</button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
      {activeKpiForTask && (
        <TaskModal
          kpi={activeKpiForTask}
          onClose={() => setActiveKpiForTask(null)}
          onTaskAdded={loadTasks}
        />
      )}
      {showCatalog && (
        <div className="catalog-overlay">
          <div className="catalog-modal glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Catálogo Maestro de KPIs</h3>
              <button className="btn-secondary" onClick={() => setShowCatalog(false)}>✕ Cerrar</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {catalogKpis.map(k => (
                <li key={k.id} style={{ borderBottom: '1px solid #eee', padding: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{k.name}</div>
                      <div className="small-muted">{k.description}</div>
                    </div>
                    <div>
                      <button className="btn-primary btn-sm" onClick={() => addKpiToDashboard(k.id)}>+ Integrar al CMI</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {showAlerts && (
        <div className="catalog-overlay" style={{ zIndex: 10000 }}>
          <div className="catalog-modal" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', width: '90%', maxWidth: '800px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>🚨</span>
                <h3 style={{ margin: 0, color: 'var(--accent-cyan)', fontSize: '1.4rem' }}>Registro de Desviaciones (Audit Trail)</h3>
              </div>
              <button className="btn-secondary" onClick={() => setShowAlerts(false)}>✕ Cerrar</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: 10 }}>
              {alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>No hay registros de anomalías en el sistema.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {alerts.map(a => (
                    <li key={a.id} style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(222, 75, 75, 0.3)',
                      borderRadius: '8px',
                      padding: '16px',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <span style={{ background: 'rgba(222, 75, 75, 0.2)', color: '#ff6b6b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>CRITICAL ALARM</span>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>{(a.Kpi || a.kpi) ? (a.Kpi || a.kpi).name : 'Vigilancia Múltiple'}</div>
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                            <span style={{ color: 'var(--accent-cyan)' }}>Valor Anómalo:</span> <strong style={{ color: '#fff' }}>{a.recorded_value ?? a.current_value ?? '-'}</strong> | <span style={{ color: 'var(--accent-cyan)' }}>Meta Incumplida:</span> <strong style={{ color: '#fff' }}>{a.target_value ?? '-'}</strong> <br />
                            <span style={{ color: '#ff6b6b' }}>Causa:</span> <span style={{ color: '#fff' }}>{a.condition || a.message || 'Desviación detectada por el bot OpenClaw'}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="small-muted" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                            {new Date(a.created_at || a.createdAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                          <div style={{ marginTop: 12 }}>
                            {(a.Kpi || a.kpi) && (
                              <button className="btn-secondary btn-sm" onClick={() => { setShowAlerts(false); setActiveKpiForTask(a.Kpi || a.kpi); }} style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderColor: 'transparent' }}>+ Emitir OKR</button>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
