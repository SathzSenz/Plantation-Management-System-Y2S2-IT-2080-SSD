// routes/AuthRoute.js
import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User Models/UserModel.js';
import { signToken } from '../middleware/auth.js';
import passport from 'passport';

const router = express.Router();
const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'elema_jwt';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // keep false in dev
  sameSite: 'lax', // Lax for localhost redirects
  maxAge: 24 * 60 * 60 * 1000, // 1 day
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
  res.json({ success: true });
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
    if (!token) return res.status(401).json({ user: null });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-passwordHash');
        res.json({ user });
    } catch {
        res.status(401).json({ user: null });
    }
});

export default router;
