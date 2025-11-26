const { Task } = require('../models');

exports.list = async (req, res) => {
  const where = {};
  if (req.query.assigned_to) where.assigned_to = req.query.assigned_to;
  const tasks = await Task.findAll({ where });
  res.json(tasks);
};

exports.create = async (req, res) => {
  try {
    const t = await Task.create({ ...req.body, owner_id: req.user.id });
    res.status(201).json(t);
  } catch (err) {
    res.status(400).json({ message: 'create error', error: err.message });
  }
};

exports.update = async (req, res) => {
  const t = await Task.findByPk(req.params.id);
  if (!t) return res.status(404).json({ message: 'Not found' });
  try {
    await t.update(req.body);
    res.json(t);
  } catch (err) {
    res.status(400).json({ message: 'update error', error: err.message });
  }
};
