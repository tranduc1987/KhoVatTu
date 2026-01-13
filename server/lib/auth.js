import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret || rawSecret === 'change_me' || rawSecret === 'dev_secret_change_me') {
  throw new Error('JWT_SECRET is missing or set to a weak default. Update server/.env before starting the server.');
}
const JWT_SECRET = rawSecret;

export const signToken = (user) => {
  const roles = db
    .prepare(
      `SELECT r.name FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`
    )
    .all(user.id)
    .map((row) => row.name);

  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      roles
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
};

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Thiếu token xác thực.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ.' });
  }
};

export const requireRole = (roles) => (req, res, next) => {
  if (!req.user?.roles) {
    return res.status(403).json({ message: 'Không có quyền truy cập.' });
  }
  const allowed = roles.some((role) => req.user.roles.includes(role));
  if (!allowed) {
    return res.status(403).json({ message: 'Không có quyền truy cập.' });
  }
  return next();
};

export const requirePermission = (permissionKey) => (req, res, next) => {
  if (req.user?.roles?.includes('admin')) {
    return next();
  }
  const userId = req.user?.sub;
  if (!userId) {
    return res.status(403).json({ message: 'Không có quyền truy cập.' });
  }
  const permission = db
    .prepare(
      `SELECT p.key FROM permissions p
       INNER JOIN role_permissions rp ON rp.permission_id = p.id
       INNER JOIN user_roles ur ON ur.role_id = rp.role_id
       WHERE ur.user_id = ? AND p.key = ?`
    )
    .get(userId, permissionKey);

  if (!permission) {
    return res.status(403).json({ message: 'Không có quyền truy cập.' });
  }
  return next();
};
