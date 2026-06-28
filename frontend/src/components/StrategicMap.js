import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

/**
 * Strategic Map Component - Cuadro de Mando Integral
 * Visualizes the 4 BSC perspectives and their cause-effect relationships
 */
export default function StrategicMap({ token }) {
    const [perspectives, setPerspectives] = useState([]);
    const [objectives, setObjectives] = useState([]);
    const [kpis, setKpis] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [perspRes, objRes, kpiRes] = await Promise.all([
                api.get('/perspectives'),
                api.get('/objectives'),
                api.get('/kpis')
            ]);
            setPerspectives(perspRes.data);
            setObjectives(objRes.data);
            setKpis(kpiRes.data);
        } catch (err) {
            console.error('Error loading strategic map data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Map perspective names to visual configuration
    const perspectiveConfig = {
        'Financiera': {
            color: '#1e40af',
            bgColor: '#dbeafe',
            icon: '💰',
            level: 1,
            description: 'Resultados económicos y financieros'
        },
        'Clientes': {
            color: '#166534',
            bgColor: '#dcfce7',
            icon: '👥',
            level: 2,
            description: 'Satisfacción y fidelización del cliente'
        },
        'Procesos Internos': {
            color: '#92400e',
            bgColor: '#fef3c7',
            icon: '⚙️',
            level: 3,
            description: 'Eficiencia operativa y calidad'
        },
        'Aprendizaje y Crecimiento': {
            color: '#7c3aed',
            bgColor: '#f3e8ff',
            icon: '📚',
            level: 4,
            description: 'Desarrollo del capital humano'
        }
    };

    // Get objectives for a perspective
    const getObjectivesForPerspective = (perspectiveId) => {
        return objectives.filter(obj => obj.perspective_id === perspectiveId);
    };

    // Get KPIs for an objective
    const getKpisForObjective = (objectiveId) => {
        return kpis.filter(kpi => kpi.objective_id === objectiveId);
    };

    // Calculate KPI status
    const getKpiStatus = (kpi) => {
        const current = Number(kpi.current_value || 0);
        const target = Number(kpi.target_value || 1);
        const ratio = current / target;

        if (kpi.alert_condition === 'above') {
            // Lower is better (like costs)
            if (ratio <= 1) return 'success';
            if (ratio <= 1.1) return 'warning';
            return 'danger';
        } else {
            // Higher is better
            if (ratio >= 1) return 'success';
            if (ratio >= 0.9) return 'warning';
            return 'danger';
        }
    };

    const statusColors = {
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
    };

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 24 }}>Cargando mapa estratégico...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="app-header">
                <h1>📊 Mapa Estratégico - Grupo HORECA Demo</h1>
                <div className="controls">
                    <button onClick={() => navigate('/dashboard')}>← Volver al Dashboard</button>
                </div>
            </div>

            <div className="app-container">
                {/* Legend */}
                <div style={{
                    display: 'flex',
                    gap: 20,
                    marginBottom: 24,
                    padding: 16,
                    background: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ fontWeight: 600 }}>Leyenda:</div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 12, height: 12, background: statusColors.success, borderRadius: '50%' }}></span>
                            En objetivo
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 12, height: 12, background: statusColors.warning, borderRadius: '50%' }}></span>
                            Cerca del objetivo
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 12, height: 12, background: statusColors.danger, borderRadius: '50%' }}></span>
                            Requiere atención
                        </span>
                    </div>
                </div>

                {/* Strategic Map Visualization */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24,
                    position: 'relative'
                }}>
                    {/* Cause-effect arrows background */}
                    <div style={{
                        position: 'absolute',
                        left: '50%',
                        top: 0,
                        bottom: 0,
                        width: 4,
                        background: 'linear-gradient(to bottom, #f3e8ff 0%, #fef3c7 33%, #dcfce7 66%, #dbeafe 100%)',
                        transform: 'translateX(-50%)',
                        borderRadius: 4,
                        zIndex: 0
                    }} />

                    {/* Perspectives in reverse order (bottom-up causality) */}
                    {perspectives
                        .sort((a, b) => {
                            const configA = perspectiveConfig[a.name] || { level: 99 };
                            const configB = perspectiveConfig[b.name] || { level: 99 };
                            return configB.level - configA.level; // Reverse: Learning at bottom, Financial at top
                        })
                        .map((perspective, pIndex) => {
                            const config = perspectiveConfig[perspective.name] || {
                                color: '#475569',
                                bgColor: '#f1f5f9',
                                icon: '📊',
                                description: ''
                            };
                            const perspectiveObjectives = getObjectivesForPerspective(perspective.id);

                            return (
                                <div
                                    key={perspective.id}
                                    style={{
                                        background: config.bgColor,
                                        borderRadius: 16,
                                        padding: 20,
                                        border: `2px solid ${config.color}20`,
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                >
                                    {/* Perspective Header */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        marginBottom: 16,
                                        paddingBottom: 12,
                                        borderBottom: `2px solid ${config.color}30`
                                    }}>
                                        <span style={{ fontSize: 32 }}>{config.icon}</span>
                                        <div>
                                            <h2 style={{
                                                margin: 0,
                                                color: config.color,
                                                fontSize: '1.4rem'
                                            }}>
                                                {perspective.name}
                                            </h2>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                                {config.description || perspective.description}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Objectives Grid */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                        gap: 16
                                    }}>
                                        {perspectiveObjectives.length === 0 && (
                                            <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                                No hay objetivos definidos para esta perspectiva
                                            </div>
                                        )}
                                        {perspectiveObjectives.map(objective => {
                                            const objectiveKpis = getKpisForObjective(objective.id);
                                            return (
                                                <div
                                                    key={objective.id}
                                                    style={{
                                                        background: '#fff',
                                                        borderRadius: 12,
                                                        padding: 16,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                                    }}
                                                >
                                                    <div style={{
                                                        fontWeight: 600,
                                                        marginBottom: 10,
                                                        color: config.color
                                                    }}>
                                                        🎯 {objective.title}
                                                    </div>

                                                    {/* KPIs for this objective */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                        {objectiveKpis.length === 0 && (
                                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                                Sin KPIs asignados
                                                            </div>
                                                        )}
                                                        {objectiveKpis.map(kpi => {
                                                            const status = getKpiStatus(kpi);
                                                            const current = kpi.current_value ?? '-';
                                                            const target = kpi.target_value ?? '-';
                                                            const unit = kpi.unit === 'currency' ? '€' : (kpi.unit === 'percent' ? '%' : '');

                                                            return (
                                                                <div
                                                                    key={kpi.id}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 8,
                                                                        padding: '8px 10px',
                                                                        background: '#f8fafc',
                                                                        borderRadius: 8,
                                                                        borderLeft: `4px solid ${statusColors[status]}`,
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    onClick={() => navigate(`/kpi/${kpi.id}`)}
                                                                >
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                                                            {kpi.name}
                                                                        </div>
                                                                    </div>
                                                                    <div style={{
                                                                        textAlign: 'right',
                                                                        fontSize: '0.85rem'
                                                                    }}>
                                                                        <div style={{ fontWeight: 700, color: statusColors[status] }}>
                                                                            {current}{unit}
                                                                        </div>
                                                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                                                            Meta: {target}{unit}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Arrow indicator for cause-effect */}
                                    {pIndex < perspectives.length - 1 && (
                                        <div style={{
                                            position: 'absolute',
                                            left: '50%',
                                            bottom: -20,
                                            transform: 'translateX(-50%)',
                                            fontSize: 24,
                                            color: config.color,
                                            zIndex: 2
                                        }}>
                                            ⬆️
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>

                {/* Cause-Effect Explanation */}
                <div style={{
                    marginTop: 32,
                    padding: 20,
                    background: '#fff',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ margin: '0 0 12px', color: '#1e293b' }}>
                        📈 Cadena de Causa-Efecto
                    </h3>
                    <p style={{ margin: 0, color: '#64748b', lineHeight: 1.6 }}>
                        El Cuadro de Mando Integral establece una cadena de causa-efecto desde la base hasta la cima:
                        la <strong>formación y desarrollo del personal</strong> (Aprendizaje) mejora los
                        <strong> procesos internos</strong>, lo que aumenta la <strong>satisfacción del cliente</strong>,
                        y finalmente impulsa los <strong>resultados financieros</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
}
