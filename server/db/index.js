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

const schema = fs.readFileSync(path.resolve('db', 'schema.sql'), 'utf-8');
db.exec(schema);

// Ensure new columns exist when updating schema without dropping DB
const productColumns = db.prepare("PRAGMA table_info('products')").all();
const hasOrigin = productColumns.some((col) => col.name === 'origin');
if (!hasOrigin) {
  db.exec("ALTER TABLE products ADD COLUMN origin TEXT NOT NULL DEFAULT ''");
}
const hasImageUrl = productColumns.some((col) => col.name === 'image_url');
if (!hasImageUrl) {
  db.exec("ALTER TABLE products ADD COLUMN image_url TEXT");
}

const ensureSeed = async () => {
  const roleCount = db.prepare('SELECT COUNT(*) as count FROM roles').get().count;
  if (roleCount === 0) {
    const insertRole = db.prepare('INSERT INTO roles (name, description) VALUES (?, ?)');
    insertRole.run('admin', 'Toan quyen he thong');
    insertRole.run('manager', 'Quan ly kho va phieu');
    insertRole.run('staff', 'Nhan vien kho');
  }

  const permissionCount = db.prepare('SELECT COUNT(*) as count FROM permissions').get().count;
  if (permissionCount === 0) {
    const permissions = [
      ['users:read', 'Xem nguoi dung'],
      ['users:write', 'Quan ly nguoi dung'],
      ['products:read', 'Xem vat tu'],
      ['products:write', 'Quan ly vat tu'],
      ['categories:write', 'Quan ly nhom vat tu'],
      ['suppliers:write', 'Quan ly nha cung cap'],
      ['warehouses:write', 'Quan ly kho'],
      ['receipts:read', 'Xem phieu nhap'],
      ['receipts:write', 'Tao phieu nhap'],
      ['receipts:approve', 'Duyet phieu nhap'],
      ['issues:read', 'Xem phieu xuat'],
      ['issues:write', 'Tao phieu xuat'],
      ['issues:approve', 'Duyet phieu xuat'],
      ['exports:read', 'Xuat bao cao']
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

  // Seed default warehouse "Kho nhan" if none exists
  const warehouseCount = db.prepare('SELECT COUNT(*) as count FROM warehouses').get().count;
  if (warehouseCount === 0) {
    db.prepare('INSERT INTO warehouses (name, location) VALUES (?, ?)').run('Kho nhan', 'Mac dinh');
  }

  const adminCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (adminCount === 0) {
    const bcryptModule = await import('bcryptjs');
    const bcrypt = bcryptModule.default ?? bcryptModule;
    const adminUsername = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';

    if (adminPassword === 'admin123') {
      console.warn(
        'A default admin user will be created with a weak password. Set ADMIN_DEFAULT_PASSWORD in server/.env to override.'
      );
    }

    const hash = bcrypt.hashSync(adminPassword, 10);
    const userInsert = db
      .prepare('INSERT INTO users (username, password_hash, full_name, email) VALUES (?, ?, ?, ?)')
      .run(adminUsername, hash, 'Quan tri vien', 'admin@khovattu.local');
    const adminRole = db.prepare('SELECT id FROM roles WHERE name = ?').get('admin');
    db.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)').run(userInsert.lastInsertRowid, adminRole.id);
  }
};

await ensureSeed();
