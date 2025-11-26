const { Perspective } = require('../models');

exports.list = async (req, res) => {
  const perspectives = await Perspective.findAll();
  res.json(perspectives);
};

exports.create = async (req, res) => {
  try {
    const p = await Perspective.create(req.body);
    res.status(201).json(p);
  } catch (err) {
    res.status(400).json({ message: 'create error', error: err.message });
  }
};
