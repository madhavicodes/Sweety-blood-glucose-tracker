const authService = require('../services/auth.service');

class AuthController {
  async register(req, res) {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  }

  async login(req, res) {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  }

  async me(req, res) {
    res.status(200).json({ user: req.user });
  }
}

module.exports = new AuthController();
