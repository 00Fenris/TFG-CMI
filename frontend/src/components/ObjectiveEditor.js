import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function ObjectiveEditor() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [perspectives, setPerspectives] = useState([]);
  const [perspectiveId, setPerspectiveId] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/perspectives').then(res => setPerspectives(res.data)).catch(console.error);
    api.get('/restaurants').then(res => setRestaurants(res.data)).catch(console.error);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/objectives', { title, description, perspective_id: perspectiveId, restaurant_id: restaurantId });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Error creating objective');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Crear Objetivo</h2>
      <form onSubmit={submit}>
        <div><label>Título</label><input value={title} onChange={e => setTitle(e.target.value)} /></div>
        <div><label>Descripción</label><textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
        <div><label>Perspectiva</label>
          <select value={perspectiveId || ''} onChange={e => setPerspectiveId(e.target.value)}>
            <option value="">Seleccione</option>
            {perspectives.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div><label>Restaurante</label>
          <select value={restaurantId || ''} onChange={e => setRestaurantId(e.target.value)}>
            <option value="">Todos</option>
            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <button type="submit">Crear</button>
      </form>
    </div>
  );
}
