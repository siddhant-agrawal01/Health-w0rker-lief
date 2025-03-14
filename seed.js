require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seed() {
  try {
    await prisma.shift.deleteMany();
    await prisma.user.deleteMany();
    await prisma.hospital.deleteMany();
    console.log("Cleared existing data");

    const hospital = await prisma.hospital.create({
      data: {
        name: "Ashish Hospital Narsinghpur",
        latitude: 23.157081465349638,
        longitude: 79.908,
        radius: 5.0,
      },
    });
    console.log("Test hospital added:", hospital);

    const manager = await prisma.user.create({
      data: {
        name: "Manager",
        email: "manager@ashishhospital.com",
        password: "managerpass123",
        role: "MANAGER",
        hospitalId: hospital.id,
      },
    });
    console.log("Created Manager:", manager);

    const careWorker1 = await prisma.user.create({
      data: {
        name: "Care Worker 1",
        email: "careworker1@ashishhospital.com",
        password: "careworker1pass",
        role: "CARE_WORKER",
        hospitalId: hospital.id,
      },
    });
    console.log("Created Care Worker 1:", careWorker1);

    const careWorker2 = await prisma.user.create({
      data: {
        name: "Care Worker 2",
        email: "careworker2@ashishhospital.com",
        password: "careworker2pass",
        role: "CARE_WORKER",
        hospitalId: hospital.id,
      },
    });
    console.log("Created Care Worker 2:", careWorker2);

    console.log("Seeding completed successfully");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
