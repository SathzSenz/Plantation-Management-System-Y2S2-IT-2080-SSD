import { sign, verify } from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

function signToken(user) {
  const payload = {
    sub: user._id?.toString?.() || user.id || user.email,
    email: user.email,
    roles: user.roles || ['user'],
  };
  return sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return verify(token, JWT_SECRET);
}

export default { signToken, verifyToken };
