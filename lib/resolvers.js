import prisma from './prisma';

const resolvers = {
  Query: {
    users: () => prisma.user.findMany(),
    user: (_, { id }) => prisma.user.findUnique({ where: { id } }),
    hospitals: () => prisma.hospital.findMany(),
    hospital: (_, { id }) => prisma.hospital.findUnique({ where: { id } }),
    shifts: () => prisma.shift.findMany(),
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
    createShift: (_, { userId, startTime, latitude, longitude, note }) =>
      prisma.shift.create({
        data: { userId, startTime: new Date(startTime), latitude, longitude, note },
      }),
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