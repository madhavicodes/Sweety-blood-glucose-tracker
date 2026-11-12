const request = require('supertest');
const app = require('../src/app');
const { getTodayString } = require('../src/utils/dates');

require('./setup');

describe('Full-Stack Frontend-Backend Contract Alignment (E2E Flow)', () => {
  const today = getTodayString();
  let token;

  beforeEach(async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alignment Test User',
        email: 'align@example.com',
        password: 'Password123'
      });
    token = regRes.body.token;
  });

  it('verifies the full frontend-to-backend user lifecycle seamlessly', async () => {
    // 1. Session verification (/auth/me)
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('align@example.com');

    // 2. Initial Dashboard load: readings and report both empty
    const [readingsRes, reportRes] = await Promise.all([
      request(app).get(`/api/readings?date=${today}`).set('Authorization', `Bearer ${token}`),
      request(app).get(`/api/reports/daily?date=${today}`).set('Authorization', `Bearer ${token}`)
    ]);

    expect(readingsRes.status).toBe(200);
    expect(Array.isArray(readingsRes.body)).toBe(true);
    expect(readingsRes.body.length).toBe(0);

    expect(reportRes.status).toBe(200);
    expect(reportRes.body.type).toBe('daily');
    expect(reportRes.body.stats).toEqual({
      count: 0,
      highest: null,
      lowest: null,
      average: null
    });

    // 3. Create reading (Dashboard / Readings Page)
    const createRes = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: today,
        slot: 'MORNING_FASTING',
        value: 92
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.slot).toBe('MORNING_FASTING');
    expect(createRes.body.slotLabel).toBe('Morning (fasting)');
    expect(createRes.body.value).toBe(92);
    const readingId = createRes.body.id;

    // 4. Duplicate prevention error contract parity
    const dupRes = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: today,
        slot: 'MORNING_FASTING',
        value: 98
      });

    expect(dupRes.status).toBe(409);
    expect(dupRes.body.error.code).toBe('DUPLICATE_SLOT');
    expect(dupRes.body.error.message).toBe('You already have a Morning (fasting) reading for this date.');

    // 5. Update reading
    const updateRes = await request(app)
      .put(`/api/readings/${readingId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: today,
        slot: 'MORNING_FASTING',
        value: 104
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.value).toBe(104);

    // 6. Reports reflection (Month-to-Date & Recharts query)
    const mtdRes = await request(app)
      .get(`/api/reports/month-to-date?date=${today}`)
      .set('Authorization', `Bearer ${token}`);

    expect(mtdRes.status).toBe(200);
    expect(mtdRes.body.stats.count).toBe(1);
    expect(mtdRes.body.stats.highest).toBe(104);
    expect(mtdRes.body.stats.lowest).toBe(104);
    expect(mtdRes.body.stats.average).toBe(104);

    // 7. Recharts Range query
    const chartRes = await request(app)
      .get(`/api/readings?from=${today}&to=${today}&limit=100`)
      .set('Authorization', `Bearer ${token}`);

    expect(chartRes.status).toBe(200);
    expect(chartRes.body.data.length).toBe(1);
    expect(chartRes.body.data[0].value).toBe(104);

    // 8. Delete reading
    const delRes = await request(app)
      .delete(`/api/readings/${readingId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.message).toBe('Reading deleted successfully.');

    // 9. Verify deletion reflected
    const finalListRes = await request(app)
      .get(`/api/readings?date=${today}`)
      .set('Authorization', `Bearer ${token}`);

    expect(finalListRes.status).toBe(200);
    expect(finalListRes.body.length).toBe(0);
  });
});
