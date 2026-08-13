require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');

async function createUser() {
  const hashedPassword = await bcrypt.hash('student123', 10);
  
  // 1. Create or update Student User
  const user = await prisma.user.upsert({
    where: { email: 'student@bridgeup.dev' },
    update: {
      password: hashedPassword,
      firstName: 'Kavindu',
      lastName: 'Perera',
      age: 22,
      city: 'Colombo',
      university: 'University of Moratuwa',
      degree: 'BSc (Hons) in Computer Science & Engineering',
      currentYear: 'Year 3',
      selectedRoles: ['Backend Developer', 'Software Engineer']
    },
    create: {
      email: 'student@bridgeup.dev',
      password: hashedPassword,
      role: 'student',
      firstName: 'Kavindu',
      lastName: 'Perera',
      age: 22,
      city: 'Colombo',
      university: 'University of Moratuwa',
      degree: 'BSc (Hons) in Computer Science & Engineering',
      currentYear: 'Year 3',
      selectedRoles: ['Backend Developer', 'Software Engineer']
    }
  });

  // 2. Create or update Student profile
  let student = await prisma.student.findFirst({
    where: { email: 'student@bridgeup.dev' }
  });

  if (!student) {
    student = await prisma.student.create({
      data: {
        userId: user.id,
        email: 'student@bridgeup.dev',
        name: 'Kavindu Perera',
        currentXP: 240,
        level: 2,
        streakCount: 3
      }
    });
  } else {
    student = await prisma.student.update({
      where: { id: student.id },
      data: {
        userId: user.id,
        name: 'Kavindu Perera'
      }
    });
  }

  // 3. Create or update Employer User
  const employerPassword = await bcrypt.hash('employer123', 10);
  const employer = await prisma.user.upsert({
    where: { email: 'employer@bridgeup.dev' },
    update: {
      password: employerPassword
    },
    create: {
      email: 'employer@bridgeup.dev',
      password: employerPassword,
      role: 'employer',
      firstName: 'Sysco',
      lastName: 'Labs',
      companyName: 'Sysco Labs',
      age: 0,
      city: 'Colombo',
      university: 'N/A',
      degree: 'N/A',
      currentYear: 'N/A',
      selectedRoles: []
    }
  });

  console.log('✅ SUCCESS: Users created in database!', {
    studentEmail: user.email,
    studentPassword: 'student123',
    studentId: student.id,
    employerEmail: employer.email,
    employerPassword: 'employer123'
  });
}

createUser()
  .catch(e => {
    console.error('Error creating user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
