const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'bridgeup_secret_key';

exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      role, // 'student' or 'employer'
      firstName,
      lastName,
      companyName,
      age,
      city,
      university,
      degree,
      currentYear,
      aboutMe,
      selectedRoles,
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, password, first name and last name are required.' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userRole = role === 'employer' ? 'employer' : 'student';

    if (userRole === 'employer') {
      if (!companyName) {
        return res.status(400).json({ error: 'Company name is required for employers.' });
      }

      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'employer',
          firstName,
          lastName,
          companyName,
          age: 0,
          city: city || '',
          university: '',
          degree: '',
          currentYear: '',
          aboutMe: aboutMe || null,
          selectedRoles: [],
        },
      });

      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = newUser;

      return res.status(201).json({
        message: 'Employer registration successful! 🎉',
        user: userWithoutPassword,
        studentId: null,
        token,
      });
    } else {
      // Student signup validation
      if (!age || !city || !university || !degree || !currentYear || !selectedRoles || !Array.isArray(selectedRoles)) {
        return res.status(400).json({ error: 'Missing required student onboarding fields.' });
      }

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
          weeklyHours: 5,
        },
      });

      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = newUser;

      return res.status(201).json({
        message: 'Student registration successful! 🎉',
        user: userWithoutPassword,
        studentId: student.id,
        token,
      });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    let student = null;
    if (user.role === 'student') {
      student = await prisma.student.findUnique({ where: { userId: user.id } });
      if (!student) {
        student = await prisma.student.create({
          data: {
            userId: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            weeklyHours: 5,
          },
        });
      }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
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

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ error: 'Admin access required. Invalid credentials.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Admin access required. Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: 'Admin login successful!',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const {
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

    if (!firstName || !lastName || !city || !university || !degree || !currentYear) {
      return res.status(400).json({ error: 'Missing required profile fields.' });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student || !student.user) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // Update User
    const updatedUser = await prisma.user.update({
      where: { id: student.userId },
      data: {
        firstName,
        lastName,
        age: age ? parseInt(age, 10) : student.user.age,
        city,
        university,
        degree,
        currentYear,
        aboutMe: aboutMe || null,
        selectedRoles: selectedRoles || student.user.selectedRoles,
      }
    });

    // Update Student
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        name: `${firstName} ${lastName}`
      }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      message: 'Profile updated successfully!',
      user: userWithoutPassword,
      student: updatedStudent
    });
  } catch (error) {
    console.error('Profile Update Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateOnboarding = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const {
      degree,
      currentYear,
      selectedRoles,
      weeklyHours,
    } = req.body;

    if (!degree || !currentYear || !selectedRoles || !Array.isArray(selectedRoles) || !weeklyHours) {
      return res.status(400).json({ error: 'Missing required onboarding answers.' });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student || !student.user) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // Update User Onboarding info
    await prisma.user.update({
      where: { id: student.userId },
      data: {
        degree,
        currentYear,
        selectedRoles,
      }
    });

    // Update Student weekly hours
    await prisma.student.update({
      where: { id: studentId },
      data: {
        weeklyHours: parseInt(weeklyHours, 10),
      }
    });

    // Dynamically require roadmapService to avoid circular dependency
    const roadmapService = require('../services/roadmapService');
    const roadmap = await roadmapService.generateRoadmap(studentId, selectedRoles[0] || 'Software Engineer');

    return res.status(200).json({
      message: 'Onboarding answers updated and roadmap regenerated successfully!',
      roadmap
    });
  } catch (error) {
    console.error('Onboarding Update Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.suggestRoles = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.json({ suggestions: [] });
    }

    const response = await fetch('http://localhost:8000/pipeline/suggest-roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`NLP service returned status ${response.status}`);
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Suggest Roles Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

