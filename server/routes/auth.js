import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { signToken, authenticate, requirePermission } from '../lib/auth.js';
import { loginSchema, userSchema } from '../lib/validators.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Thông tin đăng nhập không hợp lệ.' });
  }
  const { username, password } = parsed.data;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu.' });
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

router.post('/users', authenticate, requirePermission('users:write'), (req, res) => {
  const parsed = userSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ.' });
  }
  const { username, password, full_name, email, roles } = parsed.data;
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (exists) {
    return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại.' });
  }
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
  return res.json({ message: 'Cập nhật trạng thái thành công.' });
});

export default router;
