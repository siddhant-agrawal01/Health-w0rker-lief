// require('dotenv').config({ path: '.env.local' });
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// async function seed() {
//   await prisma.shift.deleteMany(); // Clear existing shifts first
//   await prisma.hospital.deleteMany(); // Then clear hospitals
//   await prisma.user.deleteMany(); // Then clear users

//   await prisma.user.create({
//     data: {
//       id: 'temp-user-id', // Match the placeholder used in clock-in
//       name: 'Test User',
//       email: 'test@example.com',
//       role: 'CARE_WORKER',
//     },
//   });

//   await prisma.hospital.create({
//     data: {
//       name: 'Ashish Hospital Narsinghpur',
//       latitude: 22.951065349454016,
//       longitude: 79.1878753360974,
//       radius: 100.0, // 5 km radius for testing
//     },
//   });

//   console.log('Test user and hospital added');
// }

// seed()
//   .catch((e) => console.error(e))
//   .finally(async () => await prisma.$disconnect());


  // seed.js
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  try {
    // Clear existing data
    await prisma.shift.deleteMany();
    await prisma.user.deleteMany();
    await prisma.hospital.deleteMany();
    console.log('Cleared existing data');

    // Create hospital
    const hospital = await prisma.hospital.create({
      data: {
        name: 'Ashish Hospital Narsinghpur',
        latitude: 23.157081465349638,
        longitude: 79.9080,
        radius: 5.0,
        
       
      },
    });
    console.log('Test hospital added:', hospital);

    // Hardcode Manager profile
    const manager = await prisma.user.create({
      data: {
        name: 'Manager',
        email: 'manager@ashishhospital.com',
        password: 'managerpass123', // Hardcoded password
        role: 'MANAGER',
        hospitalId: hospital.id,
      },
    });
    console.log('Created Manager:', manager);

    // Create sample Care Workers
    const careWorker1 = await prisma.user.create({
      data: {
        name: 'Care Worker 1',
        email: 'careworker1@ashishhospital.com',
        password: 'careworker1pass',
        role: 'CARE_WORKER',
        hospitalId: hospital.id,
      },
    });
    console.log('Created Care Worker 1:', careWorker1);

    const careWorker2 = await prisma.user.create({
      data: {
        name: 'Care Worker 2',
        email: 'careworker2@ashishhospital.com',
        password: 'careworker2pass',
        role: 'CARE_WORKER',
        hospitalId: hospital.id,
      },
    });
    console.log('Created Care Worker 2:', careWorker2);

    console.log('Seeding completed successfully');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

seed();