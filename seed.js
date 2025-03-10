require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  await prisma.shift.deleteMany(); // Clear existing shifts first
  await prisma.hospital.deleteMany(); // Then clear hospitals
  await prisma.user.deleteMany(); // Then clear users

  await prisma.user.create({
    data: {
      id: 'temp-user-id', // Match the placeholder used in clock-in
      name: 'Test User',
      email: 'test@example.com',
      role: 'CARE_WORKER',
    },
  });

  await prisma.hospital.create({
    data: {
      name: 'Ashish Hospital Narsinghpur',
      latitude: 22.951065349454016,
      longitude: 79.1878753360974,
      radius: 100.0, // 5 km radius for testing
    },
  });

  console.log('Test user and hospital added');
}

seed()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
// require('dotenv').config({ path: '.env.local' });
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// async function seed() {
//   await prisma.hospital.deleteMany(); // Clear existing hospitals
//   await prisma.hospital.create({
//     data: {
//       name: 'Ashish Hospital Narsinghpur',
//       latitude: 22.951065349454016, // Updated to your hospital
//       longitude: 79.1878753360974, // Updated to your hospital
//       radius: 5.0, // 2 km radius
//     },
//   });
//   console.log('Test hospital added');
// }

// seed()
//   .catch((e) => console.error(e))
//   .finally(async () => await prisma.$disconnect());