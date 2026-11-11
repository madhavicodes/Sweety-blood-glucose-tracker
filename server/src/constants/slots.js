const SLOTS = {
  MORNING_FASTING: 'Morning (fasting)',
  AFTER_BREAKFAST: 'After breakfast',
  AFTER_LUNCH: 'After lunch',
  AFTER_DINNER: 'After dinner'
};

const SLOT_VALUES = Object.keys(SLOTS);

const SLOT_LABELS = SLOTS;

const SLOT_ORDER = [
  'MORNING_FASTING',
  'AFTER_BREAKFAST',
  'AFTER_LUNCH',
  'AFTER_DINNER'
];

module.exports = {
  SLOTS,
  SLOT_VALUES,
  SLOT_LABELS,
  SLOT_ORDER
};
