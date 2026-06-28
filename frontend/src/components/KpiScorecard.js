import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

/**
 * KPI Scorecard Component
 * Comprehensive evaluation view of all KPIs with traffic light system
 */
export default function KpiScorecard({ token }) {
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState('all');
    const [kpiData, setKpiData] = useState([]);
    const [perspectives, setPerspectives] = useState([]);
    const [objectives, setObjectives] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedRestaurant === 'all') {
            loadGlobalKpis();
        } else {
            loadRestaurantKpis(selectedRestaurant);
        }
    }, [selectedRestaurant]);

    const loadData = async () => {
        try {
            const [restRes, perspRes, objRes] = await Promise.all([
                api.get('/restaurants'),
                api.get('/perspectives'),
                api.get('/objectives')
            ]);
            setRestaurants(restRes.data.filter(r => r.status === 'open'));
            setPerspectives(perspRes.data);
            setObjectives(objRes.data);
            await loadGlobalKpis();
        } catch (err) {
            console.error('Error loading scorecard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadGlobalKpis = async () => {
        try {
            const res = await api.get('/dashboard/global');
            const all = [];
            res.data.forEach(group => {
                group.kpis.forEach(k => {
                    all.push({ ...k, restaurant: group.restaurant });
                });
            });
            setKpiData(all);
        } catch (err) {
            console.error('Error loading global KPIs:', err);
        }
    };

    const loadRestaurantKpis = async (restaurantId) => {
        try {
            const res = await api.get(`/dashboard/restaurant/${restaurantId}`);
            const r = restaurants.find(rr => rr.id === parseInt(restaurantId));
            setKpiData(res.data.map(item => ({ ...item, restaurant: r })));
        } catch (err) {
            console.error('Error loading restaurant KPIs:', err);
        }
    };

    // Calculate KPI score and status
    const evaluateKpi = (kpi) => {
        const current = Number(kpi.current_value || 0);
        const target = Number(kpi.target_value || 1);
        const ratio = current / target;

        let status, score, label;

        if (kpi.alert_condition === 'above') {
            // Lower is better (costs, waste, time)
            if (ratio <= 0.95) {
                status = 'excellent';
                score = 5;
                label = 'Excelente';
            } else if (ratio <= 1) {
                status = 'good';
                score = 4;
                label = 'Bien';
            } else if (ratio <= 1.1) {
                status = 'warning';
                score = 3;
                label = 'Atención';
            } else if (ratio <= 1.2) {
                status = 'poor';
                score = 2;
                label = 'Deficiente';
            } else {
                status = 'critical';
                score = 1;
                label = 'Crítico';
            }
        } else {
            // Higher is better
            if (ratio >= 1.05) {
                status = 'excellent';
                score = 5;
                label = 'Excelente';
            } else if (ratio >= 1) {
                status = 'good';
                score = 4;
                label = 'Bien';
            } else if (ratio >= 0.9) {
                status = 'warning';
                score = 3;
                label = 'Atención';
            } else if (ratio >= 0.8) {
                status = 'poor';
                score = 2;
                label = 'Deficiente';
            } else {
                status = 'critical';
                score = 1;
                label = 'Crítico';
            }
        }

        return { status, score, label, ratio: Math.round(ratio * 100) };
    };

    // Get perspective for a KPI
    const getPerspective = (kpi) => {
        const obj = objectives.find(o => o.id === kpi.objective_id);
        return obj ? perspectives.find(p => p.id === obj.perspective_id) : null;
    };

    // Status colors
    const statusColors = {
        excellent: { bg: '#10b981', light: '#dcfce7' },
        good: { bg: '#22c55e', light: '#f0fdf4' },
        warning: { bg: '#f59e0b', light: '#fef3c7' },
        poor: { bg: '#f97316', light: '#fff7ed' },
        critical: { bg: '#ef4444', light: '#fef2f2' }
    };

    // Format value with unit
    const formatValue = (value, unit) => {
        if (value == null) return '-';
        if (unit === 'currency') return `€${Number(value).toLocaleString()}`;
        if (unit === 'percent') return `${value}%`;
        return value.toString();
    };

    // Calculate overall score
    const calculateOverallScore = () => {
        if (kpiData.length === 0) return 0;
        const total = kpiData.reduce((sum, item) => sum + evaluateKpi(item.kpi).score, 0);
        return (total / kpiData.length).toFixed(1);
    };

    // Group KPIs by perspective
    const groupByPerspective = () => {
        const groups = {};
        perspectives.forEach(p => {
            groups[p.id] = { perspective: p, kpis: [] };
        });
        groups['none'] = { perspective: { id: 'none', name: 'Sin perspectiva' }, kpis: [] };

        kpiData.forEach(item => {
            const persp = getPerspective(item.kpi);
            const key = persp ? persp.id : 'none';
            if (groups[key]) {
                groups[key].kpis.push(item);
            }
        });

        return Object.values(groups).filter(g => g.kpis.length > 0);
    };

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 24 }}>Cargando cuadro de evaluación...</div>
            </div>
        );
    }

    const overallScore = calculateOverallScore();
    const groupedData = groupByPerspective();

    // Count KPIs by status
    const statusCounts = { excellent: 0, good: 0, warning: 0, poor: 0, critical: 0 };
    kpiData.forEach(item => {
        const { status } = evaluateKpi(item.kpi);
        statusCounts[status]++;
    });

    return (
        <div>
            <div className="app-header">
                <h1>📋 Cuadro de Evaluación de KPIs</h1>
                <div className="controls">
                    <select
                        value={selectedRestaurant}
                        onChange={e => setSelectedRestaurant(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: 6 }}
                    >
                        <option value="all">Todos los restaurantes</option>
                        {restaurants.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    <button onClick={() => navigate('/dashboard')}>← Volver al Dashboard</button>
                </div>
            </div>

            <div className="app-container">
                {/* Summary Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: 16,
                    marginBottom: 24
                }}>
                    {/* Overall Score */}
                    <div style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                        borderRadius: 12,
                        padding: 20,
                        color: '#fff',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{overallScore}</div>
                        <div style={{ opacity: 0.9 }}>Puntuación Global</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>(de 5.0)</div>
                    </div>

                    {/* Status breakdown */}
                    {Object.entries(statusCounts).map(([status, count]) => (
                        <div
                            key={status}
                            style={{
                                background: statusColors[status].light,
                                borderRadius: 12,
                                padding: 16,
                                textAlign: 'center',
                                border: `2px solid ${statusColors[status].bg}30`
                            }}
                        >
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: 700,
                                color: statusColors[status].bg
                            }}>
                                {count}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'capitalize' }}>
                                {status === 'excellent' && 'Excelente'}
                                {status === 'good' && 'Bien'}
                                {status === 'warning' && 'Atención'}
                                {status === 'poor' && 'Deficiente'}
                                {status === 'critical' && 'Crítico'}
                            </div>
                        </div>
                    ))}
                </div>

                {/* KPIs by Perspective */}
                {groupedData.map(group => (
                    <div
                        key={group.perspective.id}
                        style={{
                            background: '#fff',
                            borderRadius: 12,
                            marginBottom: 20,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid #e2e8f0',
                            fontWeight: 600,
                            fontSize: '1.1rem'
                        }}>
                            {group.perspective.name}
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{ padding: 12, textAlign: 'left' }}>KPI</th>
                                    {selectedRestaurant === 'all' && (
                                        <th style={{ padding: 12, textAlign: 'left' }}>Restaurante</th>
                                    )}
                                    <th style={{ padding: 12, textAlign: 'right' }}>Actual</th>
                                    <th style={{ padding: 12, textAlign: 'right' }}>Objetivo</th>
                                    <th style={{ padding: 12, textAlign: 'center' }}>% Cumplimiento</th>
                                    <th style={{ padding: 12, textAlign: 'center' }}>Estado</th>
                                    <th style={{ padding: 12, textAlign: 'center' }}>Puntuación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.kpis.map((item, idx) => {
                                    const { status, score, label, ratio } = evaluateKpi(item.kpi);
                                    return (
                                        <tr
                                            key={idx}
                                            style={{
                                                borderBottom: '1px solid #f1f5f9',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => navigate(`/kpi/${item.kpi.id}`)}
                                        >
                                            <td style={{ padding: 12 }}>
                                                <div style={{ fontWeight: 500 }}>{item.kpi.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    {item.kpi.description}
                                                </div>
                                            </td>
                                            {selectedRestaurant === 'all' && (
                                                <td style={{ padding: 12, color: '#64748b' }}>
                                                    {item.restaurant?.name?.replace('Grupo HORECA Demo - ', '')}
                                                </td>
                                            )}
                                            <td style={{ padding: 12, textAlign: 'right', fontWeight: 600 }}>
                                                {formatValue(item.kpi.current_value, item.kpi.unit)}
                                            </td>
                                            <td style={{ padding: 12, textAlign: 'right', color: '#64748b' }}>
                                                {formatValue(item.kpi.target_value, item.kpi.unit)}
                                            </td>
                                            <td style={{ padding: 12, textAlign: 'center' }}>
                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: '4px 10px',
                                                    borderRadius: 20,
                                                    background: statusColors[status].light,
                                                    color: statusColors[status].bg,
                                                    fontWeight: 600,
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {ratio}%
                                                </div>
                                            </td>
                                            <td style={{ padding: 12, textAlign: 'center' }}>
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    padding: '4px 10px',
                                                    borderRadius: 20,
                                                    background: statusColors[status].bg,
                                                    color: '#fff',
                                                    fontWeight: 500,
                                                    fontSize: '0.8rem'
                                                }}>
                                                    <span style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        background: '#fff'
                                                    }} />
                                                    {label}
                                                </div>
                                            </td>
                                            <td style={{ padding: 12, textAlign: 'center' }}>
                                                <div style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    background: statusColors[status].bg,
                                                    color: '#fff',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 700
                                                }}>
                                                    {score}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ))}

                {/* Legend */}
                <div style={{
                    background: '#f8fafc',
                    borderRadius: 12,
                    padding: 20,
                    marginTop: 20
                }}>
                    <h4 style={{ margin: '0 0 12px' }}>Leyenda de Evaluación</h4>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                        {[
                            { status: 'excellent', label: 'Excelente (5)', desc: '>105% o <95% según KPI' },
                            { status: 'good', label: 'Bien (4)', desc: '100-105% o 95-100%' },
                            { status: 'warning', label: 'Atención (3)', desc: '90-100% o 100-110%' },
                            { status: 'poor', label: 'Deficiente (2)', desc: '80-90% o 110-120%' },
                            { status: 'critical', label: 'Crítico (1)', desc: '<80% o >120%' }
                        ].map(item => (
                            <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    background: statusColors[item.status].bg
                                }} />
                                <div>
                                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.label}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
