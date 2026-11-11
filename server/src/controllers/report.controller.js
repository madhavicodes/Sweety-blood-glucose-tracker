const reportService = require('../services/report.service');

class ReportController {
  async daily(req, res) {
    const report = await reportService.getDailyReport(req.user.id, req.query.date);
    res.status(200).json(report);
  }

  async monthToDate(req, res) {
    const report = await reportService.getMonthToDateReport(req.user.id, req.query.date);
    res.status(200).json(report);
  }

  async monthly(req, res) {
    const report = await reportService.getMonthlyReport(req.user.id, req.query.date);
    res.status(200).json(report);
  }
}

module.exports = new ReportController();

