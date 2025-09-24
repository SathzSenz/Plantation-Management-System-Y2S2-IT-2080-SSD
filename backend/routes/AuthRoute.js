// routes/AuthRoute.js
import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User Models/UserModel.js';
import { signToken } from '../middleware/auth.js';
import passport from 'passport';
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'elema_jwt';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false, // keep false in dev
  sameSite: 'lax', // Lax for localhost redirects
  maxAge:  60 * 60 * 1000, // 1 day
};

// Register (local)
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email & password required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ email, passwordHash, name, roles: ['user'], provider: 'local' });

    const token = signToken({ id: user._id, roles: user.roles });
    res.cookie(JWT_COOKIE_NAME, token, COOKIE_OPTIONS);
    res.status(201).json({ success: true, token, user: { id: user._id, email: user.email, roles: user.roles } });
  } catch (err) { next(err); }
});

// Login (local)
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email & password required' });

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ id: user._id, roles: user.roles });
    res.cookie(JWT_COOKIE_NAME, token, COOKIE_OPTIONS);
    res.json({ success: true, token, user: { id: user._id, email: user.email, roles: user.roles } });
  } catch (err) { next(err); }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie(JWT_COOKIE_NAME);
 req.logout(() => {
    res.status(200).json({ message: "Logged out" });
  });
});

// --- Google OAuth endpoints using passport (see passport setup) ---
// Start OAuth flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/google/failure' }),
  (req, res) => {
    // passport user attached to req.user
    const token = signToken({ id: req.user._id, roles: req.user.roles });
    res.cookie(JWT_COOKIE_NAME, token, COOKIE_OPTIONS);
    // explicit redirect to your frontend (add param or set cookie)
    res.redirect(`${process.env.OAUTH_SUCCESS_REDIRECT}?logged_in=true`);
  }
);

router.get('/google/failure', (req, res) => {
  res.status(401).json({ success: false, message: 'Google authentication failed' });
});

router.get('/me', async (req, res) => {
    const token = req.cookies[JWT_COOKIE_NAME];
    console.log(token);
    console.log("Hello");
    if (token) {
        try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Decoded:', decoded);
  const user = await User.findById(decoded.id).select('-passwordHash');
  console.log('User from DB:', user);
  res.json({ user });
} catch (err) {
  console.error('JWT verify error:', err.message);
  return res.status(401).json({ user: null });
}

    }
    if (!token) {
        console.log("Jeesh");
        return res.status(401).json({ user: null });
    } 
    
});

export default router;
