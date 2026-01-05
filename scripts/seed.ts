import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'tracknet.db');
const db = new Database(dbPath);

console.log('Seeding database...');

const testEmail = 'test@tracknet.com';
const testPassword = 'password123';
const hashedPassword = bcrypt.hashSync(testPassword, 10);

const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(testEmail);

if (!existingUser) {
  db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(testEmail, hashedPassword);
  console.log(`✓ Created test user: ${testEmail} / ${testPassword}`);
} else {
  console.log(`✓ Test user already exists: ${testEmail}`);
}

const trucks = [
  { deviceId: 'TRUCK001', latitude: 26.8532, longitude: 89.3850, status: 'active' },
  { deviceId: 'TRUCK002', latitude: 26.8600, longitude: 89.3900, status: 'active' },
  { deviceId: 'TRUCK003', latitude: 26.8500, longitude: 89.3800, status: 'active' },
];

trucks.forEach((truck) => {
  const existing = db.prepare('SELECT id FROM trucks WHERE deviceId = ?').get(truck.deviceId);
  if (!existing) {
    db.prepare(
      'INSERT INTO trucks (deviceId, latitude, longitude, status) VALUES (?, ?, ?, ?)'
    ).run(truck.deviceId, truck.latitude, truck.longitude, truck.status);
    console.log(`✓ Created truck: ${truck.deviceId}`);
  } else {
    console.log(`✓ Truck already exists: ${truck.deviceId}`);
  }
});

console.log('\nDatabase seeded successfully!');
console.log('\nTest Credentials:');
console.log(`Email: ${testEmail}`);
console.log(`Password: ${testPassword}`);

db.close();
