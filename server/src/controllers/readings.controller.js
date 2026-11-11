const readingService = require('../services/reading.service');

class ReadingsController {
  async create(req, res) {
    const reading = await readingService.createReading(req.user.id, req.body);
    res.status(201).json(reading);
  }

  async list(req, res) {
    const readings = await readingService.getReadings(req.user.id, req.query);
    res.status(200).json(readings);
  }

  async getById(req, res) {
    const reading = await readingService.getReadingById(req.user.id, req.params.id);
    res.status(200).json(reading);
  }

  async update(req, res) {
    const reading = await readingService.updateReading(req.user.id, req.params.id, req.body);
    res.status(200).json(reading);
  }

  async delete(req, res) {
    await readingService.deleteReading(req.user.id, req.params.id);
    res.status(200).json({ message: 'Reading deleted successfully.' });
  }
}

module.exports = new ReadingsController();

