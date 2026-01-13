import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.resolve('server', 'data');
const dbPath = path.join(dataDir, 'khovattu.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(path.resolve('server', 'db', 'schema.sql'), 'utf-8');
db.exec(schema);

const ensureSeed = async () => {
  const roleCount = db.prepare('SELECT COUNT(*) as count FROM roles').get().count;
  if (roleCount === 0) {
    const insertRole = db.prepare('INSERT INTO roles (name, description) VALUES (?, ?)');
    insertRole.run('admin', 'Toàn quyền hệ thống');
    insertRole.run('manager', 'Quản lý kho và phiếu');
    insertRole.run('staff', 'Nhân viên kho');
  }

  const permissionCount = db.prepare('SELECT COUNT(*) as count FROM permissions').get().count;
  if (permissionCount === 0) {
    const permissions = [
      ['users:read', 'Xem người dùng'],
      ['users:write', 'Quản lý người dùng'],
      ['products:read', 'Xem vật tư'],
      ['products:write', 'Quản lý vật tư'],
      ['categories:write', 'Quản lý nhóm vật tư'],
      ['suppliers:write', 'Quản lý nhà cung cấp'],
      ['warehouses:write', 'Quản lý kho'],
      ['receipts:read', 'Xem phiếu nhập'],
      ['receipts:write', 'Tạo phiếu nhập'],
      ['receipts:approve', 'Duyệt phiếu nhập'],
      ['issues:read', 'Xem phiếu xuất'],
      ['issues:write', 'Tạo phiếu xuất'],
      ['issues:approve', 'Duyệt phiếu xuất'],
      ['exports:read', 'Xuất báo cáo']
    ];
    const insertPermission = db.prepare('INSERT INTO permissions (key, description) VALUES (?, ?)');
    permissions.forEach(([key, description]) => insertPermission.run(key, description));

    const roleMap = db.prepare('SELECT id, name FROM roles').all();
    const permissionMap = db.prepare('SELECT id, key FROM permissions').all();
    const permissionByKey = new Map(permissionMap.map((row) => [row.key, row.id]));

    const assign = db.prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)');
    roleMap.forEach((role) => {
      if (role.name === 'admin') {
        permissionMap.forEach((perm) => assign.run(role.id, perm.id));
      }
      if (role.name === 'manager') {
        [
          'products:read',
          'products:write',
          'categories:write',
          'suppliers:write',
          'warehouses:write',
          'receipts:read',
          'receipts:write',
          'receipts:approve',
          'issues:read',
          'issues:write',
          'issues:approve',
          'exports:read'
        ].forEach((key) => assign.run(role.id, permissionByKey.get(key)));
      }
      if (role.name === 'staff') {
        ['products:read', 'receipts:read', 'issues:read', 'exports:read'].forEach((key) =>
          assign.run(role.id, permissionByKey.get(key))
        );
      }
    });
  }

  const adminCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (adminCount === 0) {
    const bcryptModule = await import('bcryptjs');
    const bcrypt = bcryptModule.default ?? bcryptModule;
    const hash = bcrypt.hashSync('admin123', 10);
    const userInsert = db
      .prepare('INSERT INTO users (username, password_hash, full_name, email) VALUES (?, ?, ?, ?)')
      .run('admin', hash, 'Quản trị viên', 'admin@khovattu.local');
    const adminRole = db.prepare('SELECT id FROM roles WHERE name = ?').get('admin');
    db.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)').run(userInsert.lastInsertRowid, adminRole.id);
  }
};

await ensureSeed();
