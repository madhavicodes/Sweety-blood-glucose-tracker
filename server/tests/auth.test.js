const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/knex');

require('./setup');

describe('Auth Endpoints (/api/auth)', () => {
  const validUser = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'Password123'
  };

  describe('POST /api/auth/register', () => {
    it('registers a user successfully and returns 201 with token and user profile', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('jane@example.com');
      expect(res.body.user.name).toBe('Jane Doe');
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user).not.toHaveProperty('password_hash');

      // Verify DB contains hashed password, never plaintext
      const dbUser = await db('users').where({ email: 'jane@example.com' }).first();
      expect(dbUser).toBeDefined();
      expect(dbUser.password_hash).not.toBe(validUser.password);
      expect(dbUser.password_hash.startsWith('$2')).toBe(true);
    });

    it('rejects duplicate email with 409 EMAIL_EXISTS', async () => {
      await request(app).post('/api/auth/register').send(validUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Duplicate',
          email: 'JANE@example.com', // Case-insensitive test
          password: 'Password123'
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('EMAIL_EXISTS');
      expect(res.body.error.message).toBe('Email is already registered.');
    });

    it('rejects weak password with 400 VALIDATION_ERROR', async () => {
      // Missing number
      const res1 = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Jane', email: 'jane2@example.com', password: 'passwordonly' });
      expect(res1.status).toBe(400);
      expect(res1.body.error.code).toBe('VALIDATION_ERROR');

      // Shorter than 8 chars
      const res2 = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Jane', email: 'jane2@example.com', password: 'Pass1' });
      expect(res2.status).toBe(400);
      expect(res2.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validUser);
    });

    it('logs in successfully with valid credentials and returns 200 with token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'Password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('jane@example.com');
    });

    it('returns 401 with generic message on wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'WrongPassword123'
        });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toBe('Invalid email or password.');
    });

    it('returns 401 with identical generic message on unknown email (timing leak mitigation)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unknown@example.com',
          password: 'Password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toBe('Invalid email or password.');
    });
  });

  describe('GET /api/auth/me', () => {
    it('requires Bearer token and returns 401 when missing', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns current user profile when valid Bearer token is provided', async () => {
      const regRes = await request(app).post('/api/auth/register').send(validUser);
      const token = regRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('jane@example.com');
      expect(res.body.user.name).toBe('Jane Doe');
    });
  });
});

