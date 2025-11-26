const path = require('path');
const fs = require('fs');
let sequelize = null;
let Sequelize = null;
let usingSequelize = false;
try {
  const Seq = require('sequelize');
  Sequelize = Seq.Sequelize || Seq;
  if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false });
  } else {
    // Fallback to a local sqlite database for quick demo (may throw if sqlite3 binary not present)
    sequelize = new Sequelize({ dialect: 'sqlite', storage: path.join(__dirname, '../../db/dev.sqlite'), logging: false });
  }
  usingSequelize = true;
} catch (err) {
  console.warn('Sequelize or driver initialization failed. Falling back to in-memory mode for demo.');
  usingSequelize = false;
}

const models = {};
const files = fs.readdirSync(__dirname).filter(f => f !== 'index.js' && f.endsWith('.js'));
if (usingSequelize && sequelize) {
  files.forEach((file) => {
    const modelDef = require(path.join(__dirname, file));
    const name = file.replace('.js', '');
    models[name] = modelDef(sequelize);
  });
} else {
  // Create basic in-memory models that implement the subset of Sequelize API used by the controllers
  const makeMemoryModel = (name) => {
    let data = [];
    let idCounter = 1;
    const ensureId = (item) => { if (!item.id) item.id = idCounter++; };
    return {
      name,
      _data: data,
      findAll: async ({ where } = {}) => {
        if (!where) return data.slice();
        return data.filter(d => Object.keys(where).every(k => where[k] === d[k]));
      },
      findByPk: async (id) => {
        const result = data.find(d => d.id == id);
        if (!result) return null;
        const instance = Object.assign({}, result);
        instance.update = async (patch) => {
          Object.assign(result, patch);
          return result;
        };
        return instance;
      },
      findOne: async ({ where } = {}) => {
        const found = data.find(d => Object.keys(where).every(k => where[k] === d[k]));
        return found ? Object.assign({}, found) : null;
      },
      findOrCreate: async ({ where, defaults }) => {
        const found = data.find(d => Object.keys(where).every(k => where[k] === d[k]));
        if (found) return [found, false];
        const newItem = Object.assign({}, defaults || {}, where);
        ensureId(newItem);
        data.push(newItem);
        return [newItem, true];
      },
      create: async (obj) => {
        const newItem = Object.assign({}, obj);
        ensureId(newItem);
        data.push(newItem);
        return newItem;
      }
    };
  };
  files.forEach(file => {
    const name = file.replace('.js', '');
    models[name] = makeMemoryModel(name);
  });
}

// Setup associations
const {
  user: UserModel,
  restaurant: RestaurantModel,
  perspective: PerspectiveModel,
  objective: ObjectiveModel,
  kpi: KpiModel,
  kpiEntry: KpiEntryModel,
  task: TaskModel,
  kpiAlert: KpiAlertModel
} = models;

// Sequelize returns models with file names as keys; the model name is capitalized in definitions
const User = models.user || models.User;
const Restaurant = models.restaurant || models.Restaurant;
const Perspective = models.perspective || models.Perspective;
const Objective = models.objective || models.Objective;
const Kpi = models.kpi || models.Kpi;
const KpiEntry = models.kpiEntry || models.KpiEntry;
const Task = models.task || models.Task;
const KpiAlert = models.kpiAlert || models.KpiAlert;

// Associations
if (User && Restaurant) {
  Restaurant.hasMany(User, { foreignKey: 'restaurant_id' });
  User.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });
}

if (Perspective && Objective) {
  Perspective.hasMany(Objective, { foreignKey: 'perspective_id' });
  Objective.belongsTo(Perspective, { foreignKey: 'perspective_id' });
}

if (Restaurant && Objective) {
  Restaurant.hasMany(Objective, { foreignKey: 'restaurant_id' });
  Objective.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });
}

if (User && Objective) {
  User.hasMany(Objective, { foreignKey: 'owner_id' });
  Objective.belongsTo(User, { as: 'owner', foreignKey: 'owner_id' });
}

if (Objective && Kpi) {
  Objective.hasMany(Kpi, { foreignKey: 'objective_id' });
  Kpi.belongsTo(Objective, { foreignKey: 'objective_id' });
}

if (User && Kpi) {
  User.hasMany(Kpi, { foreignKey: 'owner_id' });
  Kpi.belongsTo(User, { as: 'owner', foreignKey: 'owner_id' });
}

if (Restaurant && Kpi) {
  Restaurant.hasMany(Kpi, { foreignKey: 'restaurant_id' });
  Kpi.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });
}

if (Kpi && KpiEntry) {
  Kpi.hasMany(KpiEntry, { foreignKey: 'kpi_id' });
  KpiEntry.belongsTo(Kpi, { foreignKey: 'kpi_id' });
}

if (User && KpiEntry) {
  User.hasMany(KpiEntry, { foreignKey: 'recorded_by' });
  KpiEntry.belongsTo(User, { as: 'recorded_by_user', foreignKey: 'recorded_by' });
}

if (User && Task) {
  User.hasMany(Task, { foreignKey: 'owner_id' });
  User.hasMany(Task, { foreignKey: 'assigned_to' });
  Task.belongsTo(User, { as: 'owner', foreignKey: 'owner_id' });
  Task.belongsTo(User, { as: 'assignee', foreignKey: 'assigned_to' });
}

if (Objective && Task) {
  Objective.hasMany(Task, { foreignKey: 'objective_id' });
  Task.belongsTo(Objective, { foreignKey: 'objective_id' });
}

if (Kpi && Task) {
  Kpi.hasMany(Task, { foreignKey: 'kpi_id' });
  Task.belongsTo(Kpi, { foreignKey: 'kpi_id' });
}

if (Kpi && KpiAlert) {
  Kpi.hasMany(KpiAlert, { foreignKey: 'kpi_id' });
  KpiAlert.belongsTo(Kpi, { foreignKey: 'kpi_id' });
}

// Export models by PascalCase for convenience
module.exports = {
  sequelize,
  Sequelize,
  usingSequelize,
  User,
  Restaurant,
  Perspective,
  Objective,
  Kpi,
  KpiEntry,
  Task,
  KpiAlert,
  models
};

