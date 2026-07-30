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

    // Create user in the database
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

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'bridgeup_secret_key',
      { expiresIn: '7d' }
    );

    // Remove password from returned user object
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      message: 'Registration successful! 🎉',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
