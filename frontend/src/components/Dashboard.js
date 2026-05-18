import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ token, onLogout }) {
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
    setRestaurants(res.data);
    if (res.data.length) {
      setSelected(res.data[0].id);
      loadKpis(res.data[0].id);
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
    // res.data: [{ restaurant, kpis: [{ kpi, entries }] }]
    const all = [];
    res.data.forEach(group => {
      group.kpis.forEach(k => {
        all.push({ ...k, restaurant: group.restaurant });
      });
    });
    setKpiData(all);
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
  const removeKpiFromDashboard = (index) => {
    setKpiData(prev => prev.filter((_, i) => i !== index));
  };

  const loadTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data || []);
    } catch (err) {
      // ignore
    }
  };

  const loadCatalog = async () => {
    try {
      const res = await api.get('/kpis');
      setCatalogKpis(res.data);
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
      <div className="app-header">
        <h1>Claunafood — Cuadro de Mando Integral</h1>
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
            <h3>Restaurantes</h3>
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
                  <li key={t.id} style={{ padding: 6, borderBottom: '1px dashed #eee' }}>
                    <div style={{ fontWeight: 600 }}>{t.title}</div>
                    <div className="small-muted">{t.status} {t.due_date ? `• ${t.due_date}` : ''}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="main">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>KPIs</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div>
                  <label className="small-muted">Perspectiva</label>
                  <select value={selectedPerspective} onChange={e => setSelectedPerspective(e.target.value)} style={{ marginLeft: 8 }}>
                    <option value="all">Todas</option>
                    {perspectives.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="small-muted">Alcance</label>
                  <select value={scope} onChange={e => handleScopeChange(e.target.value)} style={{ marginLeft: 8 }}>
                    <option value="restaurant">Restaurante</option>
                    <option value="global">Global</option>
                  </select>
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
                        <button style={{ background: '#ff6b6b', color: '#fff' }} onClick={() => removeKpiFromDashboard(index)}>Eliminar</button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
      {showCatalog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: '80%', maxHeight: '80%', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Catálogo de KPIs</h3>
              <button onClick={() => setShowCatalog(false)}>Cerrar</button>
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
                      <button onClick={() => addKpiToDashboard(k.id)}>Añadir</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {showAlerts && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: '80%', maxHeight: '80%', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Alertas</h3>
              <button onClick={() => setShowAlerts(false)}>Cerrar</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {alerts.map(a => (
                <li key={a.id} style={{ borderBottom: '1px solid #eee', padding: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.Kpi ? a.Kpi.name : 'KPI'}</div>
                      <div className="small-muted">{a.message || a.condition || ''}</div>
                    </div>
                    <div className="small-muted">{a.created_at}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
