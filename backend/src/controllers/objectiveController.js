const { Objective, Perspective, Restaurant, User } = require('../models');

exports.list = async (req, res) => {
  const where = {};
  if (req.query.restaurant_id) where.restaurant_id = req.query.restaurant_id;
  const objectives = await Objective.findAll({ where, include: [Perspective, Restaurant, { model: User, as: 'owner' }] });
  res.json(objectives);
};

exports.get = async (req, res) => {
  const objective = await Objective.findByPk(req.params.id);
  if (!objective) return res.status(404).json({ message: 'Not found' });
  res.json(objective);
};

exports.create = async (req, res) => {
  try {
    const obj = await Objective.create(req.body);
    res.status(201).json(obj);
  } catch (err) {
    res.status(400).json({ message: 'create error', error: err.message });
  }
};

exports.update = async (req, res) => {
  const obj = await Objective.findByPk(req.params.id);
  if (!obj) return res.status(404).json({ message: 'Not found' });
  try {
    await obj.update(req.body);
    res.json(obj);
  } catch (err) {
    res.status(400).json({ message: 'update error', error: err.message });
  }
};
