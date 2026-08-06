const prisma = require('../lib/prisma');

async function createEvent(employerId, data) {
  const { title, description, mode, location, link, eventDate, capacity, skills } = data;

  if (!title?.trim()) throw new Error('Title is required');
  if (!description?.trim()) throw new Error('Description is required');
  if (!mode || !['online', 'physical', 'hybrid'].includes(mode)) {
    throw new Error('Mode must be online, physical, or hybrid');
  }
  if (!eventDate) throw new Error('Event date is required');
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    throw new Error('At least one related skill is required');
  }
  if (mode === 'online' && !link?.trim()) throw new Error('Online events require a link');
  if (mode === 'physical' && !location?.trim()) throw new Error('Physical events require a location');
  if (mode === 'hybrid' && (!location?.trim() || !link?.trim())) {
    throw new Error('Hybrid events require both a location and a link');
  }

  const event = await prisma.event.create({
    data: {
      employerId,
      title: title.trim(),
      description: description.trim(),
      mode,
      location: location?.trim() || null,
      link: link?.trim() || null,
      eventDate: new Date(eventDate),
      capacity: capacity ? parseInt(capacity, 10) : null,
      skills
    },
    include: {
      employer: { select: { id: true, firstName: true, lastName: true, companyName: true } }
    }
  });

  return formatEvent(event);
}

function formatEvent(event, extras = {}) {
  const now = new Date();
  const isPast = new Date(event.eventDate) < now;

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    mode: event.mode,
    location: event.location,
    link: event.link,
    eventDate: event.eventDate,
    capacity: event.capacity,
    registrationCount: event.registrationCount,
    skills: event.skills,
    isPast,
    hostEmployer: event.employer
      ? {
          id: event.employer.id,
          name: event.employer.companyName ||
            `${event.employer.firstName} ${event.employer.lastName}`
        }
      : null,
    ...extras
  };
}

async function listUpcomingEvents(skillFilter, studentId) {
  const now = new Date();
  const where = { eventDate: { gte: now } };

  if (skillFilter) {
    where.skills = { has: skillFilter };
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { eventDate: 'asc' },
    include: {
      employer: { select: { id: true, firstName: true, lastName: true, companyName: true } },
      registrations: studentId
        ? { where: { studentId }, select: { id: true } }
        : false
    }
  });

  return events.map(e => {
    const isRegistered = studentId ? e.registrations?.length > 0 : false;
    const isFull = e.capacity ? e.registrationCount >= e.capacity : false;
    const { registrations, ...event } = e;
    return formatEvent(event, { isRegistered, isFull });
  });
}

async function getAvailableSkills() {
  const events = await prisma.event.findMany({
    where: { eventDate: { gte: new Date() } },
    select: { skills: true }
  });
  const skillSet = new Set();
  events.forEach(e => e.skills.forEach(s => skillSet.add(s)));
  return Array.from(skillSet).sort();
}

async function registerForEvent(studentId, eventId) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');

  if (new Date(event.eventDate) < new Date()) {
    throw new Error('Cannot register for a past event');
  }

  const existing = await prisma.eventRegistration.findUnique({
    where: { eventId_studentId: { eventId, studentId } }
  });
  if (existing) {
    return { alreadyRegistered: true, registration: existing };
  }

  if (event.capacity && event.registrationCount >= event.capacity) {
    throw new Error('This event is at full capacity');
  }

  const registration = await prisma.$transaction(async (tx) => {
    const reg = await tx.eventRegistration.create({
      data: { eventId, studentId }
    });
    await tx.event.update({
      where: { id: eventId },
      data: { registrationCount: { increment: 1 } }
    });
    return reg;
  });

  return { alreadyRegistered: false, registration };
}

async function getRegisteredEvents(studentId) {
  const registrations = await prisma.eventRegistration.findMany({
    where: { studentId },
    include: {
      event: {
        include: {
          employer: { select: { id: true, firstName: true, lastName: true, companyName: true } }
        }
      }
    },
    orderBy: { event: { eventDate: 'asc' } }
  });

  return registrations
    .filter(r => new Date(r.event.eventDate) >= new Date())
    .map(r => formatEvent(r.event, { registeredAt: r.registeredAt }));
}

async function unregisterFromEvent(studentId, eventId) {
  const registration = await prisma.eventRegistration.findUnique({
    where: { eventId_studentId: { eventId, studentId } }
  });
  if (!registration) throw new Error('You are not registered for this event');

  await prisma.$transaction(async (tx) => {
    await tx.eventRegistration.delete({ where: { id: registration.id } });
    await tx.event.update({
      where: { id: eventId },
      data: { registrationCount: { decrement: 1 } }
    });
  });

  return { success: true };
}

module.exports = {
  createEvent,
  listUpcomingEvents,
  getAvailableSkills,
  registerForEvent,
  getRegisteredEvents,
  unregisterFromEvent
};
