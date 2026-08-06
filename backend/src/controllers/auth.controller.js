const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      age,
      city,
      university,
      degree,
      currentYear,
      aboutMe,
      selectedRoles,
    } = req.body;

    // Validation
    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !age ||
      !city ||
      !university ||
      !degree ||
      !currentYear ||
      !selectedRoles ||
      !Array.isArray(selectedRoles)
    ) {
      return res.status(400).json({ error: 'Missing required signup fields.' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'student',
        firstName,
        lastName,
        age: parseInt(age, 10),
        city,
        university,
        degree,
        currentYear,
        aboutMe: aboutMe || null,
        selectedRoles,
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: newUser.id,
        email: newUser.email,
        name: `${newUser.firstName} ${newUser.lastName}`,
      },
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'bridgeup_secret_key',
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      message: 'Registration successful! 🎉',
      user: userWithoutPassword,
      studentId: student.id,
      token,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    let student = await prisma.student.findUnique({ where: { userId: user.id } });
    if (!student && user.role === 'student') {
      student = await prisma.student.create({
        data: {
          userId: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        },
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'bridgeup_secret_key',
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: 'Login successful!',
      user: userWithoutPassword,
      studentId: student?.id || null,
      token,
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
