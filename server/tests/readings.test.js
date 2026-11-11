const request = require('supertest');
const app = require('../src/app');
const { getTodayString } = require('../src/utils/dates');

require('./setup');

describe('Health and Readings Endpoints', () => {
  let userA, tokenA;
  let userB, tokenB;
  const today = getTodayString();

  beforeEach(async () => {
    // Register User A
    const resA = await request(app).post('/api/auth/register').send({
      name: 'User A',
      email: 'user.a@example.com',
      password: 'Password123'
    });
    userA = resA.body.user;
    tokenA = resA.body.token;

    // Register User B
    const resB = await request(app).post('/api/auth/register').send({
      name: 'User B',
      email: 'user.b@example.com',
      password: 'Password123'
    });
    userB = resB.body.user;
    tokenB = resB.body.token;
  });

  describe('GET /health', () => {
    it('returns 200 with status ok and db up', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok', db: 'up' });
    });
  });

  describe('POST /api/readings - Validation Rules', () => {
    it('rejects missing or empty glucose value with exact message', async () => {
      const res1 = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MORNING_FASTING' });

      expect(res1.status).toBe(400);
      expect(res1.body.error.message).toBe('Please enter a glucose value.');

      const res2 = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MORNING_FASTING', value: '' });

      expect(res2.status).toBe(400);
      expect(res2.body.error.message).toBe('Please enter a glucose value.');

      const res3 = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MORNING_FASTING', value: 'abc' });

      expect(res3.status).toBe(400);
      expect(res3.body.error.message).toBe('Please enter a glucose value.');
    });

    it('rejects decimal values with exact whole number message', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MORNING_FASTING', value: 120.5 });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Value must be a whole number.');
    });

    it('rejects values outside 40-600 range with exact message', async () => {
      const resLow = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MORNING_FASTING', value: 39 });

      expect(resLow.status).toBe(400);
      expect(resLow.body.error.message).toBe('Value must be between 40 and 600 mg/dl.');

      const resHigh = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MORNING_FASTING', value: 601 });

      expect(resHigh.status).toBe(400);
      expect(resHigh.body.error.message).toBe('Value must be between 40 and 600 mg/dl.');
    });

    it('rejects invalid or missing date', async () => {
      const resMissing = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ slot: 'MORNING_FASTING', value: 100 });

      expect(resMissing.status).toBe(400);
      expect(resMissing.body.error.message).toBe('Date is required.');

      const resInvalid = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: '2026-02-30', slot: 'MORNING_FASTING', value: 100 });

      expect(resInvalid.status).toBe(400);
      expect(resInvalid.body.error.message).toBe('Enter a valid date.');
    });

    it('rejects invalid slot', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MIDNIGHT_SNACK', value: 100 });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Choose a valid time slot.');
    });

    it('rejects future date with exact message', async () => {
      const futureDate = '2099-01-01';
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: futureDate, slot: 'MORNING_FASTING', value: 100 });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_DATE');
      expect(res.body.error.message).toBe('Date cannot be in the future.');
    });
  });

  describe('Readings CRUD and Business Logic', () => {
    it('creates reading and returns 201 with correct JSON shape', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'AFTER_LUNCH', value: 140 });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.date).toBe(today);
      expect(res.body.slot).toBe('AFTER_LUNCH');
      expect(res.body.slotLabel).toBe('After lunch');
      expect(res.body.value).toBe(140);
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
      expect(res.body).not.toHaveProperty('reading_date');
      expect(res.body).not.toHaveProperty('value_mgdl');
    });

    it('rejects duplicate slot on same date with exact message', async () => {
      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'AFTER_LUNCH', value: 140 });

      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'AFTER_LUNCH', value: 150 });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('DUPLICATE_SLOT');
      expect(res.body.error.message).toBe('You already have an After lunch reading for this date.');
    });

    it('rejects more than 4 readings per day with exact message', async () => {
      const slots = ['MORNING_FASTING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER'];

      for (const s of slots) {
        await request(app)
          .post('/api/readings')
          .set('Authorization', `Bearer ${tokenA}`)
          .send({ date: today, slot: s, value: 120 });
      }

      // Try 5th reading
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MORNING_FASTING', value: 125 });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('MAX_READINGS');
      expect(res.body.error.message).toBe('You can add only 4 readings per day.');
    });

    it('allows updating an existing reading without triggering false positive duplicate on itself', async () => {
      const createRes = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MORNING_FASTING', value: 100 });

      const readingId = createRes.body.id;

      // Update value on same slot and date
      const updateRes = await request(app)
        .put(`/api/readings/${readingId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MORNING_FASTING', value: 105 });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.value).toBe(105);
    });

    it('returns 404 when updating a non-existent reading', async () => {
      const updateRes = await request(app)
        .put('/api/readings/999999')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MORNING_FASTING', value: 105 });

      expect(updateRes.status).toBe(404);
      expect(updateRes.body.error.code).toBe('NOT_FOUND');
    });

    it('rejects update if it conflicts with another slot on that date', async () => {
      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MORNING_FASTING', value: 90 });

      const res2 = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'AFTER_BREAKFAST', value: 130 });

      const id2 = res2.body.id;

      // Try updating reading 2 to MORNING_FASTING (which already exists)
      const conflictRes = await request(app)
        .put(`/api/readings/${id2}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MORNING_FASTING', value: 135 });

      expect(conflictRes.status).toBe(409);
      expect(conflictRes.body.error.code).toBe('DUPLICATE_SLOT');
    });

    it('allows deleting reading and returns 404 on subsequent get or delete', async () => {
      const createRes = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MORNING_FASTING', value: 100 });

      const readingId = createRes.body.id;

      const delRes = await request(app)
        .delete(`/api/readings/${readingId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(delRes.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/readings/${readingId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(getRes.status).toBe(404);
      expect(getRes.body.error.code).toBe('NOT_FOUND');

      const delAgainRes = await request(app)
        .delete(`/api/readings/${readingId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(delAgainRes.status).toBe(404);
    });

    it('enforces user isolation: User B gets 404 when attempting to read, update or delete User A reading', async () => {
      const createRes = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'AFTER_DINNER', value: 130 });

      const readingIdA = createRes.body.id;

      // User B tries to GET
      const getRes = await request(app)
        .get(`/api/readings/${readingIdA}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(getRes.status).toBe(404);

      // User B tries to PUT
      const putRes = await request(app)
        .put(`/api/readings/${readingIdA}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ date: today, slot: 'AFTER_DINNER', value: 135 });
      expect(putRes.status).toBe(404);

      // User B tries to DELETE
      const delRes = await request(app)
        .delete(`/api/readings/${readingIdA}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(delRes.status).toBe(404);
    });

    it('retrieves readings for a date ordered by slot', async () => {
      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'AFTER_DINNER', value: 140 });

      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MORNING_FASTING', value: 95 });

      const res = await request(app)
        .get(`/api/readings?date=${today}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].slot).toBe('MORNING_FASTING');
      expect(res.body[1].slot).toBe('AFTER_DINNER');
    });

    it('supports range query with pagination metadata', async () => {
      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MORNING_FASTING', value: 100 });

      const res = await request(app)
        .get(`/api/readings?from=${today}&to=${today}&page=1&limit=10`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('limit', 10);
      expect(res.body).toHaveProperty('total', 1);
      expect(res.body).toHaveProperty('totalPages', 1);
      expect(res.body.data.length).toBe(1);
    });
  });
});
