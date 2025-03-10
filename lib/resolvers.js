import prisma from './prisma';

const resolvers = {
  Query: {
    users: () => prisma.user.findMany(),
    user: (_, { id }) => prisma.user.findUnique({ where: { id } }),
    hospitals: () => prisma.hospital.findMany(),
    hospital: (_, { id }) => prisma.hospital.findUnique({ where: { id } }),
    shifts: (_, { where }) => {
      return prisma.shift.findMany({
        where: {
          userId: where?.userId,
          endTime: where?.endTime || (where?.endTime_not ? { not: where.endTime_not } : undefined),
        },
      });
    },
    shift: (_, { id }) => prisma.shift.findUnique({ where: { id } }),
  },
  Mutation: {
    createUser: (_, { name, email, role, hospitalId }) =>
      prisma.user.create({
        data: { name, email, role, hospitalId },
      }),
    createHospital: (_, { name, latitude, longitude, radius }) =>
      prisma.hospital.create({
        data: { name, latitude, longitude, radius },
      }),
    
      createShift: async (_, { userId, startTime, latitude, longitude, note }) => {
        console.log('Creating shift with userId:', userId); // Add debug logging
        const user = await prisma.user.findUnique({ where: { id: userId } });
        console.log('Found user:', user); // Add debug logging
        if (!user) {
          throw new Error(`User with ID ${userId} does not exist.`);
        }
        return prisma.shift.create({
          data: {
            userId,
            startTime: new Date(startTime),
            latitude,
            longitude,
            note,
          },
        });
      },
    updateShift: (_, { id, endTime, note }) => {
      const data = {};
      if (endTime) data.endTime = new Date(endTime);
      if (note) data.note = note;
      return prisma.shift.update({
        where: { id },
        data,
      });
    },
  },
  User: {
    hospital: (user) => prisma.hospital.findUnique({ where: { id: user.hospitalId } }),
    shifts: (user) => prisma.shift.findMany({ where: { userId: user.id } }),
  },
  Hospital: {
    users: (hospital) => prisma.user.findMany({ where: { hospitalId: hospital.id } }),
  },
  Shift: {
    user: (shift) => prisma.user.findUnique({ where: { id: shift.userId } }),
  },
};

export default resolvers;