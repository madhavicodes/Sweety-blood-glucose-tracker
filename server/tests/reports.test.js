const request = require('supertest');
const app = require('../src/app');
const { getTodayString } = require('../src/utils/dates');

require('./setup');

describe('Reports Endpoints (/api/reports)', () => {
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

  describe('Empty State Handling', () => {
    it('returns count: 0 and null stats when there are no readings', async () => {
      const res = await request(app)
        .get(`/api/reports/daily?date=${today}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.type).toBe('daily');
      expect(res.body.stats).toEqual({
        count: 0,
        highest: null,
        lowest: null,
        average: null
      });
      expect(res.body.readings).toEqual([]);
    });
  });

  describe('GET /api/reports/daily', () => {
    it('computes exact stats and returns readings sorted by slot', async () => {
      // Add readings: 90 and 150 -> count 2, highest 150, lowest 90, avg 120.0
      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'AFTER_LUNCH', value: 150 });

      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MORNING_FASTING', value: 90 });

      const res = await request(app)
        .get(`/api/reports/daily?date=${today}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.stats.count).toBe(2);
      expect(res.body.stats.highest).toBe(150);
      expect(res.body.stats.lowest).toBe(90);
      expect(res.body.stats.average).toBe(120);
      expect(res.body.readings.length).toBe(2);
      expect(res.body.readings[0].slot).toBe('MORNING_FASTING');
      expect(res.body.readings[1].slot).toBe('AFTER_LUNCH');
    });

    it('rejects future date with 400', async () => {
      const res = await request(app)
        .get('/api/reports/daily?date=2099-01-01')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_DATE');
      expect(res.body.error.message).toBe('Date cannot be in the future.');
    });
  });

  describe('GET /api/reports/month-to-date', () => {
    it('aggregates readings strictly from 1st of month to selected date', async () => {
      const [year, month] = today.split('-');
      const firstOfMonth = `${year}-${month}-01`;

      // Reading on 1st of month
      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: firstOfMonth, slot: 'MORNING_FASTING', value: 100 });

      // If today is not the 1st of the month, add a reading for today as well
      if (today !== firstOfMonth) {
        await request(app)
          .post('/api/readings')
          .set('Authorization', `Bearer ${tokenA}`)
          .send({ date: today, slot: 'AFTER_DINNER', value: 120 });
      }

      const res = await request(app)
        .get(`/api/reports/month-to-date?date=${today}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.type).toBe('month-to-date');
      expect(res.body.stats.count).toBe(today === firstOfMonth ? 1 : 2);
      expect(res.body.range.from).toBe(firstOfMonth);
      expect(res.body.range.to).toBe(today);
    });
  });

  describe('GET /api/reports/monthly (Previous Month Boundaries)', () => {
    it('accurately captures boundaries: 1st and last day of previous month', async () => {
      // Create date objects for previous month boundaries
      const now = new Date();
      const prevMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1));
      const prevYear = prevMonth.getUTCFullYear();
      const prevM = String(prevMonth.getUTCMonth() + 1).padStart(2, '0');
      const lastDayOfPrevMonth = new Date(Date.UTC(prevYear, prevMonth.getUTCMonth() + 1, 0)).getUTCDate();
      const prevLastD = String(lastDayOfPrevMonth).padStart(2, '0');

      const firstDayStr = `${prevYear}-${prevM}-01`;
      const lastDayStr = `${prevYear}-${prevM}-${prevLastD}`;

      // Insert reading on 1st day of prev month
      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: firstDayStr, slot: 'MORNING_FASTING', value: 80 });

      // Insert reading on last day of prev month
      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: lastDayStr, slot: 'AFTER_DINNER', value: 200 });

      // Insert reading today (current month, should be excluded from prev month report)
      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'AFTER_LUNCH', value: 150 });

      const res = await request(app)
        .get(`/api/reports/monthly?date=${today}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.type).toBe('monthly');
      expect(res.body.stats.count).toBe(2);
      expect(res.body.stats.lowest).toBe(80);
      expect(res.body.stats.highest).toBe(200);
      expect(res.body.stats.average).toBe(140);
      expect(res.body.range.from).toBe(firstDayStr);
      expect(res.body.range.to).toBe(lastDayStr);
    });
  });

  describe('User Data Isolation', () => {
    it('ensures User B reports never contain User A data', async () => {
      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ date: today, slot: 'MORNING_FASTING', value: 110 });

      const resB = await request(app)
        .get(`/api/reports/daily?date=${today}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(resB.status).toBe(200);
      expect(resB.body.stats.count).toBe(0);
      expect(resB.body.readings).toEqual([]);
    });
  });
});

