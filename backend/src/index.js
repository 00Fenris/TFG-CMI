require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json());

const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const perspectiveRoutes = require('./routes/perspectives');
const objectiveRoutes = require('./routes/objectives');
const kpiRoutes = require('./routes/kpis');
const kpiEntryRoutes = require('./routes/kpiEntries');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');
const alertRoutes = require('./routes/alerts');
const { sequelize } = require('./models');
const seed = require('./seed');

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/perspectives', perspectiveRoutes);
app.use('/objectives', objectiveRoutes);
app.use('/kpis', kpiRoutes);
app.use('/kpi-entries', kpiEntryRoutes);
app.use('/tasks', taskRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/alerts', alertRoutes);

app.get('/', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ message: 'API - CMI Claunafood', db: 'connected' });
  } catch (err) {
    console.error('DB connect error', err);
    res.status(500).json({ message: 'db error', error: err.message });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
  if (process.env.SEED_DB && process.env.SEED_DB === 'true') {
    console.log('Seeding DB...');
    seed().catch(err => console.error('Seed failed', err));
  }
});
