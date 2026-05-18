import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

/**
 * Restaurant Comparison Component
 * Side-by-side comparison of KPIs between Salamanca and Zamora restaurants
 */
export default function RestaurantComparison({ token }) {
    const [restaurants, setRestaurants] = useState([]);
    const [kpiData, setKpiData] = useState({});
    const [perspectives, setPerspectives] = useState([]);
    const [selectedPerspective, setSelectedPerspective] = useState('all');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [restRes, perspRes] = await Promise.all([
                api.get('/restaurants'),
                api.get('/perspectives')
            ]);

            const activeRestaurants = restRes.data.filter(r => r.status === 'open');
            setRestaurants(activeRestaurants);
            setPerspectives(perspRes.data);

            // Load KPIs for each restaurant
            const kpiByRestaurant = {};
            for (const restaurant of activeRestaurants) {
                const res = await api.get(`/dashboard/restaurant/${restaurant.id}`);
                kpiByRestaurant[restaurant.id] = res.data;
            }
            setKpiData(kpiByRestaurant);
        } catch (err) {
            console.error('Error loading comparison data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Find matching KPIs across restaurants for comparison
    const getComparisonData = () => {
        if (restaurants.length < 2) return [];

        const [rest1, rest2] = restaurants;
        const kpis1 = kpiData[rest1.id] || [];
        const kpis2 = kpiData[rest2.id] || [];

        // Group by KPI name
        const comparison = [];
        const processedNames = new Set();

        kpis1.forEach(item => {
            const name = item.kpi.name;
            if (processedNames.has(name)) return;
            processedNames.add(name);

            const match = kpis2.find(k => k.kpi.name === name);
            if (match) {
                comparison.push({
                    name,
                    kpi1: item.kpi,
                    kpi2: match.kpi,
                    value1: Number(item.kpi.current_value) || 0,
                    value2: Number(match.kpi.current_value) || 0,
                    target: Number(item.kpi.target_value) || 0,
                    unit: item.kpi.unit,
                    objective_id: item.kpi.objective_id
                });
            }
        });

        return comparison;
    };

    const comparisonData = getComparisonData();

    // Get perspective for a KPI
    const getPerspectiveForKpi = (objectiveId) => {
        // This would need objectives data to work properly
        return null;
    };

    // Format value with unit
    const formatValue = (value, unit) => {
        if (unit === 'currency') return `€${value.toLocaleString()}`;
        if (unit === 'percent') return `${value}%`;
        return value.toString();
    };

    // Determine winner
    const getWinner = (item) => {
        if (item.unit === 'percent' && item.kpi1.alert_condition === 'above') {
            // Lower is better (costs, waste)
            return item.value1 < item.value2 ? 1 : (item.value2 < item.value1 ? 2 : 0);
        }
        // Higher is better
        return item.value1 > item.value2 ? 1 : (item.value2 > item.value1 ? 2 : 0);
    };

    const restaurantColors = {
        1: '#2563eb', // Blue for first restaurant
        2: '#10b981'  // Green for second restaurant
    };

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 24 }}>Cargando comparativa...</div>
            </div>
        );
    }

    if (restaurants.length < 2) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 24, color: '#64748b' }}>
                    Se necesitan al menos 2 restaurantes activos para la comparativa
                </div>
                <button onClick={() => navigate('/dashboard')} style={{ marginTop: 20 }}>
                    Volver al Dashboard
                </button>
            </div>
        );
    }

    const [rest1, rest2] = restaurants;

    return (
        <div>
            <div className="app-header">
                <h1>📊 Comparativa de Restaurantes</h1>
                <div className="controls">
                    <button onClick={() => navigate('/dashboard')}>← Volver al Dashboard</button>
                </div>
            </div>

            <div className="app-container">
                {/* Restaurant Headers */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 20,
                    marginBottom: 24
                }}>
                    <div style={{
                        background: `linear-gradient(135deg, ${restaurantColors[1]}15 0%, ${restaurantColors[1]}05 100%)`,
                        borderRadius: 12,
                        padding: 20,
                        textAlign: 'center',
                        border: `2px solid ${restaurantColors[1]}30`
                    }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>🏪</div>
                        <h2 style={{ margin: 0, color: restaurantColors[1] }}>{rest1.name}</h2>
                        <div style={{ color: '#64748b' }}>{rest1.city}</div>
                    </div>
                    <div style={{
                        background: `linear-gradient(135deg, ${restaurantColors[2]}15 0%, ${restaurantColors[2]}05 100%)`,
                        borderRadius: 12,
                        padding: 20,
                        textAlign: 'center',
                        border: `2px solid ${restaurantColors[2]}30`
                    }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>🏪</div>
                        <h2 style={{ margin: 0, color: restaurantColors[2] }}>{rest2.name}</h2>
                        <div style={{ color: '#64748b' }}>{rest2.city}</div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 16,
                    marginBottom: 32
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 20,
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: restaurantColors[1] }}>
                            {comparisonData.filter(d => getWinner(d) === 1).length}
                        </div>
                        <div style={{ color: '#64748b' }}>KPIs donde gana {rest1.city}</div>
                    </div>
                    <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 20,
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#94a3b8' }}>
                            {comparisonData.filter(d => getWinner(d) === 0).length}
                        </div>
                        <div style={{ color: '#64748b' }}>Empates</div>
                    </div>
                    <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 20,
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: restaurantColors[2] }}>
                            {comparisonData.filter(d => getWinner(d) === 2).length}
                        </div>
                        <div style={{ color: '#64748b' }}>KPIs donde gana {rest2.city}</div>
                    </div>
                </div>

                {/* Bar Chart Comparison */}
                <div style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 24,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <h3 style={{ margin: '0 0 16px' }}>Comparativa Visual de KPIs</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={comparisonData.map(d => ({
                                name: d.name.length > 20 ? d.name.substring(0, 18) + '...' : d.name,
                                [rest1.city]: d.value1,
                                [rest2.city]: d.value2,
                                target: d.target
                            }))}
                            layout="vertical"
                            margin={{ left: 120 }}
                        >
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey={rest1.city} fill={restaurantColors[1]} radius={[0, 4, 4, 0]} />
                            <Bar dataKey={rest2.city} fill={restaurantColors[2]} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Detailed Comparison Table */}
                <div style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <h3 style={{ margin: '0 0 16px' }}>Detalle por KPI</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: 12, textAlign: 'left' }}>KPI</th>
                                <th style={{ padding: 12, textAlign: 'right', color: restaurantColors[1] }}>
                                    {rest1.city}
                                </th>
                                <th style={{ padding: 12, textAlign: 'right', color: restaurantColors[2] }}>
                                    {rest2.city}
                                </th>
                                <th style={{ padding: 12, textAlign: 'right', color: '#64748b' }}>Objetivo</th>
                                <th style={{ padding: 12, textAlign: 'center' }}>Mejor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonData.map((item, idx) => {
                                const winner = getWinner(item);
                                return (
                                    <tr
                                        key={idx}
                                        style={{
                                            borderBottom: '1px solid #f1f5f9',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => navigate(`/kpi/${item.kpi1.id}`)}
                                    >
                                        <td style={{ padding: 12 }}>
                                            <div style={{ fontWeight: 500 }}>{item.name}</div>
                                        </td>
                                        <td style={{
                                            padding: 12,
                                            textAlign: 'right',
                                            fontWeight: winner === 1 ? 700 : 400,
                                            color: winner === 1 ? restaurantColors[1] : '#1e293b'
                                        }}>
                                            {formatValue(item.value1, item.unit)}
                                            {winner === 1 && ' 🏆'}
                                        </td>
                                        <td style={{
                                            padding: 12,
                                            textAlign: 'right',
                                            fontWeight: winner === 2 ? 700 : 400,
                                            color: winner === 2 ? restaurantColors[2] : '#1e293b'
                                        }}>
                                            {formatValue(item.value2, item.unit)}
                                            {winner === 2 && ' 🏆'}
                                        </td>
                                        <td style={{ padding: 12, textAlign: 'right', color: '#64748b' }}>
                                            {formatValue(item.target, item.unit)}
                                        </td>
                                        <td style={{ padding: 12, textAlign: 'center' }}>
                                            {winner === 0 && <span style={{ color: '#94a3b8' }}>Empate</span>}
                                            {winner === 1 && <span style={{ color: restaurantColors[1], fontWeight: 600 }}>{rest1.city}</span>}
                                            {winner === 2 && <span style={{ color: restaurantColors[2], fontWeight: 600 }}>{rest2.city}</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
