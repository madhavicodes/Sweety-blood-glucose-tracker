const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const email = 'demo@sweety.app'.toLowerCase().trim();
  const password = 'Demo@1234';
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
  const password_hash = await bcrypt.hash(password, saltRounds);

  // Idempotent: find existing or insert
  let user = await knex('users').whereRaw('LOWER(email) = ?', [email]).first();

  if (user) {
    // Delete demo user's previous readings to keep seed idempotent
    await knex('readings').where({ user_id: user.id }).del();
    await knex('users').where({ id: user.id }).update({
      name: 'Demo Patient',
      password_hash,
      updated_at: knex.fn.now()
    });
  } else {
    const [inserted] = await knex('users').insert({
      name: 'Demo Patient',
      email,
      password_hash
    }).returning('*');
    user = inserted;
  }

  // Generate realistic readings for previous month and current month up to today
  const slots = ['MORNING_FASTING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER'];
  const readings = [];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentDate = now.getDate();

  // Start from 1st of previous month
  const startDate = new Date(currentYear, currentMonth - 1, 1);
  const endDate = new Date(currentYear, currentMonth, currentDate);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // Deterministic pseudo-random generation to keep readings realistic (80-220 mg/dl)
    slots.forEach((slot, idx) => {
      // Occasionally skip a slot so reports and empty-states differ
      const pseudoHash = (d.getDate() * 7 + idx * 13) % 10;
      if (pseudoHash === 0) return; // skip this slot

      let baseVal = 95;
      if (slot === 'MORNING_FASTING') baseVal = 90 + ((d.getDate() * 3 + idx) % 30);
      else if (slot === 'AFTER_BREAKFAST') baseVal = 130 + ((d.getDate() * 5 + idx) % 50);
      else if (slot === 'AFTER_LUNCH') baseVal = 120 + ((d.getDate() * 7 + idx) % 60);
      else if (slot === 'AFTER_DINNER') baseVal = 135 + ((d.getDate() * 11 + idx) % 55);

      readings.push({
        user_id: user.id,
        reading_date: dateStr,
        slot,
        value_mgdl: Math.min(220, Math.max(80, baseVal))
      });
    });
  }

  if (readings.length > 0) {
    await knex('readings').insert(readings);
  }

  console.log('----------------------------------------------------');
  console.log('Seed completed successfully!');
  console.log(`Demo user credentials:`);
  console.log(`Email:    demo@sweety.app`);
  console.log(`Password: Demo@1234`);
  console.log(`Readings seeded: ${readings.length}`);
  console.log('----------------------------------------------------');
};

