const { Restaurant } = require('../models');

exports.list = async (req, res) => {
  const restaurants = await Restaurant.findAll();
  res.json(restaurants);
};

exports.get = async (req, res) => {
  const id = req.params.id;
  const restaurant = await Restaurant.findByPk(id);
  if (!restaurant) return res.status(404).json({ message: 'Not found' });
  res.json(restaurant);
};

exports.create = async (req, res) => {
  try {
    const r = await Restaurant.create(req.body);
    res.status(201).json(r);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'create error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) return res.status(404).json({ message: 'Not found' });
    await restaurant.update(req.body);
    res.json(restaurant);
  } catch (err) {
    res.status(400).json({ message: 'update error', error: err.message });
  }
};
