import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { signToken, authenticate, requirePermission } from '../lib/auth.js';
import { loginSchema, userSchema, registerSchema } from '../lib/validators.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Thong tin dang nhap khong hop le.' });
  }
  const { username, password } = parsed.data;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: 'Sai tai khoan hoac mat khau.' });
  }
  const token = signToken(user);
  return res.json({ token });
});

router.get('/me', authenticate, (req, res) => {
  const user = db
    .prepare('SELECT id, username, full_name, email, is_active, created_at FROM users WHERE id = ?')
    .get(req.user.sub);
  const roles = db
    .prepare(
      `SELECT r.name FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`
    )
    .all(req.user.sub)
    .map((row) => row.name);
  return res.json({ ...user, roles });
});

router.post('/register', (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Du lieu dang ky khong hop le.' });
  }
  const { username, password, full_name, email } = parsed.data;

  try {
    const hash = bcrypt.hashSync(password, 10);
    const result = db
      .prepare('INSERT INTO users (username, password_hash, full_name, email) VALUES (?, ?, ?, ?)')
      .run(username, hash, full_name, email || null);

    // Gan vai tro mac dinh staff neu co
    const staffRole = db.prepare('SELECT id FROM roles WHERE name = ?').get('staff');
    if (staffRole) {
      db.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)').run(result.lastInsertRowid, staffRole.id);
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = signToken(user);
    return res.status(201).json({ token });
  } catch (error) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ message: 'Ten dang nhap da ton tai.' });
    }
    throw error;
  }
});

router.post('/users', authenticate, requirePermission('users:write'), (req, res) => {
  const parsed = userSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Du lieu nguoi dung khong hop le.' });
  }
  const { username, password, full_name, email, roles } = parsed.data;

  if (roles.length > 0) {
    const placeholders = roles.map(() => '?').join(',');
    const existingRoles = db.prepare(`SELECT name FROM roles WHERE name IN (${placeholders})`).all(...roles);
    if (existingRoles.length !== roles.length) {
      return res.status(400).json({ message: 'Role khong hop le.' });
    }
  }

  try {
    const hash = bcrypt.hashSync(password, 10);
    const result = db
      .prepare('INSERT INTO users (username, password_hash, full_name, email) VALUES (?, ?, ?, ?)')
      .run(username, hash, full_name, email || null);
    const userId = result.lastInsertRowid;
    if (roles.length > 0) {
      const roleRows = db
        .prepare(`SELECT id, name FROM roles WHERE name IN (${roles.map(() => '?').join(',')})`)
        .all(...roles);
      const insertUserRole = db.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)');
      roleRows.forEach((role) => insertUserRole.run(userId, role.id));
    }
    return res.status(201).json({ id: userId });
  } catch (error) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ message: 'Ten dang nhap da ton tai.' });
    }
    throw error;
  }
});

router.get('/users', authenticate, requirePermission('users:read'), (req, res) => {
  const users = db
    .prepare(
      `SELECT u.id, u.username, u.full_name, u.email, u.is_active, u.created_at,
        GROUP_CONCAT(r.name) as roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
       GROUP BY u.id`
    )
    .all();
  return res.json(users);
});

router.patch('/users/:id/status', authenticate, requirePermission('users:write'), (req, res) => {
  const { is_active } = req.body;
  db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, req.params.id);
  return res.json({ message: 'Cap nhat trang thai thanh cong.' });
});

export default router;
