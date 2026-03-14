const Recruitment = require('../models/Recruitment');

exports.getAll = async (req, res) => {
  try {
    const filters = req.query;
    const candidates = await Recruitment.findAll(filters);
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const candidate = await Recruitment.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const id = await Recruitment.create(req.body);
    const candidate = await Recruitment.findById(id);
    res.status(201).json(candidate);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const candidate = await Recruitment.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    await Recruitment.update(req.params.id, req.body);
    const updated = await Recruitment.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStage = async (req, res) => {
  try {
    const { stage } = req.body;
    const validStages = ['application_received', 'interview_scheduled', 'selected', 'rejected'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ message: 'Invalid stage' });
    }
    await Recruitment.update(req.params.id, { stage });
    const updated = await Recruitment.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const candidate = await Recruitment.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    await Recruitment.delete(req.params.id);
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
