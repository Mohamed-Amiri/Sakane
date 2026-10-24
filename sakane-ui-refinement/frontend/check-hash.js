// Temporary check: does the seeded hash match the documented password?
const bcrypt = require('bcryptjs');
const hash = '$2b$10$7rKOA18Zi1jx.Q0v7V3e4umk5R/.3W28RXizL5czQWZ1uX8.QGqai';
for (const pw of ['Password1!', 'Password123!', 'Demo123!']) {
  console.log(pw, '=>', bcrypt.compareSync(pw, hash));
}
