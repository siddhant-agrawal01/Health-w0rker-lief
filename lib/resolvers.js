import prisma from './prisma';

const resolvers = {
  Query: {
    users: () => prisma.user.findMany(),
    user: (_, { id }) => {
      if (!id) throw new Error('User ID is required');
      return prisma.user.findUnique({ where: { id } });
    },
    hospitals: () => prisma.hospital.findMany(),
    hospital: (_, { id }) => {
      if (!id) throw new Error('Hospital ID is required');
      return prisma.hospital.findUnique({ where: { id } });
    },
    shifts: (_, { where = {} }) => {
      return prisma.shift.findMany({
        where: {
          userId: where.userId || undefined,
          endTime: where.endTime === null ? null : where.endTime ? new Date(where.endTime) : undefined,
        },
      });
    },
    shift: (_, { id }) => {
      if (!id) throw new Error('Shift ID is required');
      return prisma.shift.findUnique({ where: { id } });
    },
    activeShifts: () => prisma.shift.findMany({ where: { endTime: null }, include: { user: true } }),
    dailyStats: async (_, { startDate, endDate }) => {
      if (!startDate || !endDate) throw new Error('Start and end dates are required');
      const shifts = await prisma.shift.findMany({
        where: {
          startTime: { gte: new Date(startDate), lte: new Date(endDate) },
          endTime: { not: null },
        },
        include: { user: true },
      });

      const groupedByDate = shifts.reduce((acc, shift) => {
        const date = shift.startTime.toISOString().split('T')[0];
        if (!acc[date]) acc[date] = { totalHours: 0, staff: new Set() };
        const hours = (new Date(shift.endTime) - new Date(shift.startTime)) / 3600000;
        acc[date].totalHours += hours;
        acc[date].staff.add(shift.userId);
        return acc;
      }, {});

      return Object.entries(groupedByDate).map(([date, data]) => ({
        date,
        averageHours: data.totalHours / data.staff.size,
        staffCount: data.staff.size,
      }));
    },
    weeklyReport: async (_, { startDate, endDate }) => {
      if (!startDate || !endDate) throw new Error('Start and end dates are required');
      const shifts = await prisma.shift.findMany({
        where: {
          startTime: { gte: new Date(startDate), lte: new Date(endDate) },
          endTime: { not: null },
        },
      });

      const groupedByUser = shifts.reduce((acc, shift) => {
        acc[shift.userId] = (acc[shift.userId] || 0) + (new Date(shift.endTime) - new Date(shift.startTime)) / 3600000;
        return acc;
      }, {});

      return Object.entries(groupedByUser).map(([userId, totalHours]) => ({ userId, totalHours }));
    },
  },
  Mutation: {
    createUser: (_, { name, email, role, hospitalId }) => {
      if (!name || !email) throw new Error('Name and email are required');
      return prisma.user.create({ data: { name, email, role, hospitalId } });
    },
    createHospital: (_, { name, latitude, longitude, radius }) => {
      if (!name || latitude === undefined || longitude === undefined || radius === undefined) {
        throw new Error('All hospital fields are required');
      }
      return prisma.hospital.create({ data: { name, latitude, longitude, radius } });
    },
    createShift: async (_, { userId, startTime, latitude, longitude, note }) => {
      if (!userId || !startTime || latitude === undefined || longitude === undefined) {
        throw new Error('User ID, start time, latitude, and longitude are required');
      }
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error(`User with ID ${userId} does not exist`);
      return prisma.shift.create({
        data: {
          userId,
          startTime: new Date(startTime),
          latitude,
          longitude,
          note: note || null,
        },
      });
    },
    updateShift: (_, { id, endTime, note }) => {
      if (!id) throw new Error('Shift ID is required');
      const data = {};
      if (endTime !== undefined) data.endTime = endTime ? new Date(endTime) : null;
      if (note !== undefined) data.note = note;
      return prisma.shift.update({ where: { id }, data });
    },
  },
  User: {
    hospital: (user) => user.hospitalId ? prisma.hospital.findUnique({ where: { id: user.hospitalId } }) : null,
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