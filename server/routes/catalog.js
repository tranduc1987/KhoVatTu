import express from 'express';
import { db } from '../db/index.js';
import { authenticate, requirePermission } from '../lib/auth.js';
import { categorySchema, supplierSchema, warehouseSchema, productSchema } from '../lib/validators.js';
import fs from 'node:fs';
import path from 'node:path';

const router = express.Router();

const handleValidation = (schema, data, res) => {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    res.status(400).json({ message: 'Du lieu khong hop le.', errors: parsed.error.flatten() });
    return null;
  }
  return parsed.data;
};

const respondConstraint = (res, message) => res.status(409).json({ message });

const parsePagination = (req, defaultLimit = 200, maxLimit = 500) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit || defaultLimit, 10) || defaultLimit, 1), maxLimit);
  const offset = Math.max(parseInt(req.query.offset || '0', 10) || 0, 0);
  return { limit, offset };
};

router.get('/categories', authenticate, requirePermission('products:read'), (req, res) => {
  const { limit, offset } = parsePagination(req);
  const rows = db.prepare('SELECT * FROM categories LIMIT ? OFFSET ?').all(limit, offset);
  return res.json(rows);
});

router.post('/categories', authenticate, requirePermission('categories:write'), (req, res) => {
  const data = handleValidation(categorySchema, req.body, res);
  if (!data) return null;
  try {
    const result = db
      .prepare('INSERT INTO categories (name, description) VALUES (?, ?)')
      .run(data.name, data.description || null);
    return res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return respondConstraint(res, 'Danh muc da ton tai.');
    }
    throw error;
  }
});

router.put('/categories/:id', authenticate, requirePermission('categories:write'), (req, res) => {
  const data = handleValidation(categorySchema, req.body, res);
  if (!data) return null;
  const result = db
    .prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?')
    .run(data.name, data.description || null, req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Khong tim thay danh muc.' });
  }
  return res.json({ message: 'Cap nhat danh muc thanh cong.' });
});

router.delete('/categories/:id', authenticate, requirePermission('categories:write'), (req, res) => {
  const result = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Khong tim thay danh muc.' });
  }
  return res.json({ message: 'Da xoa danh muc.' });
});

router.get('/suppliers', authenticate, requirePermission('products:read'), (req, res) => {
  const { limit, offset } = parsePagination(req);
  const rows = db.prepare('SELECT * FROM suppliers LIMIT ? OFFSET ?').all(limit, offset);
  return res.json(rows);
});

router.post('/suppliers', authenticate, requirePermission('suppliers:write'), (req, res) => {
  const data = handleValidation(supplierSchema, req.body, res);
  if (!data) return null;
  try {
    const result = db
      .prepare('INSERT INTO suppliers (name, phone, email, address) VALUES (?, ?, ?, ?)')
      .run(data.name, data.phone || null, data.email || null, data.address || null);
    return res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return respondConstraint(res, 'Nha cung cap da ton tai.');
    }
    throw error;
  }
});

router.put('/suppliers/:id', authenticate, requirePermission('suppliers:write'), (req, res) => {
  const data = handleValidation(supplierSchema, req.body, res);
  if (!data) return null;
  const result = db
    .prepare('UPDATE suppliers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?')
    .run(data.name, data.phone || null, data.email || null, data.address || null, req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Khong tim thay nha cung cap.' });
  }
  return res.json({ message: 'Cap nhat nha cung cap thanh cong.' });
});

router.delete('/suppliers/:id', authenticate, requirePermission('suppliers:write'), (req, res) => {
  const result = db.prepare('DELETE FROM suppliers WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Khong tim thay nha cung cap.' });
  }
  return res.json({ message: 'Da xoa nha cung cap.' });
});

router.get('/warehouses', authenticate, requirePermission('products:read'), (req, res) => {
  const { limit, offset } = parsePagination(req);
  const rows = db.prepare('SELECT * FROM warehouses LIMIT ? OFFSET ?').all(limit, offset);
  return res.json(rows);
});

router.post('/warehouses', authenticate, requirePermission('warehouses:write'), (req, res) => {
  const data = handleValidation(warehouseSchema, req.body, res);
  if (!data) return null;
  try {
    const result = db
      .prepare('INSERT INTO warehouses (name, location) VALUES (?, ?)')
      .run(data.name, data.location || null);
    return res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return respondConstraint(res, 'Kho da ton tai.');
    }
    throw error;
  }
});

router.put('/warehouses/:id', authenticate, requirePermission('warehouses:write'), (req, res) => {
  const data = handleValidation(warehouseSchema, req.body, res);
  if (!data) return null;
  const result = db
    .prepare('UPDATE warehouses SET name = ?, location = ? WHERE id = ?')
    .run(data.name, data.location || null, req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Khong tim thay kho.' });
  }
  return res.json({ message: 'Cap nhat kho thanh cong.' });
});

router.delete('/warehouses/:id', authenticate, requirePermission('warehouses:write'), (req, res) => {
  const result = db.prepare('DELETE FROM warehouses WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Khong tim thay kho.' });
  }
  return res.json({ message: 'Da xoa kho.' });
});

router.get('/products', authenticate, requirePermission('products:read'), (req, res) => {
  const { limit, offset } = parsePagination(req);
  const rows = db
    .prepare(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LIMIT ? OFFSET ?`
    )
    .all(limit, offset);
  return res.json(rows);
});

router.post('/products', authenticate, requirePermission('products:write'), (req, res) => {
  const data = handleValidation(productSchema, req.body, res);
  if (!data) return null;
  try {
    const result = db
      .prepare(
        `INSERT INTO products (sku, name, category_id, unit, origin, image_url, cost, price, min_stock)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.sku,
        data.name,
        data.category_id ?? null,
        data.unit,
        data.origin,
        data.image_url || null,
        data.cost,
        data.price,
        data.min_stock
      );
    return res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return respondConstraint(res, 'SKU da ton tai.');
    }
    throw error;
  }
});

router.put('/products/:id', authenticate, requirePermission('products:write'), (req, res) => {
  const data = handleValidation(productSchema, req.body, res);
  if (!data) return null;
  try {
    const result = db
      .prepare(
        `UPDATE products
         SET sku = ?, name = ?, category_id = ?, unit = ?, origin = ?, image_url = ?, cost = ?, price = ?, min_stock = ?
         WHERE id = ?`
      )
      .run(
        data.sku,
        data.name,
        data.category_id ?? null,
        data.unit,
        data.origin,
        data.image_url || null,
        data.cost,
        data.price,
        data.min_stock,
        req.params.id
      );
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Khong tim thay vat tu.' });
    }
    return res.json({ message: 'Cap nhat vat tu thanh cong.' });
  } catch (error) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return respondConstraint(res, 'SKU da ton tai.');
    }
    throw error;
  }
});

router.delete('/products/:id', authenticate, requirePermission('products:write'), (req, res) => {
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Khong tim thay vat tu.' });
  }
  return res.json({ message: 'Da xoa vat tu.' });
});

// Upload image (base64 data URL) and return relative URL
router.post('/products/upload', authenticate, requirePermission('products:write'), (req, res) => {
  const { image_base64 } = req.body || {};
  if (!image_base64 || typeof image_base64 !== 'string' || !image_base64.startsWith('data:image')) {
    return res.status(400).json({ message: 'Dinh dang anh khong hop le.' });
  }
  const [, base64Data] = image_base64.split(',');
  if (!base64Data) {
    return res.status(400).json({ message: 'Khong tim thay du lieu anh.' });
  }
  const buffer = Buffer.from(base64Data, 'base64');
  const uploadDir = path.resolve('uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filename = `product-${Date.now()}.png`;
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, buffer);
  const url = `/uploads/${filename}`;
  return res.json({ url });
});

router.get('/inventory', authenticate, requirePermission('products:read'), (req, res) => {
  const { limit, offset } = parsePagination(req);
  const rows = db
    .prepare(
      `SELECT i.id, i.quantity, w.name as warehouse_name, p.name as product_name, p.sku
       FROM inventory i
       INNER JOIN warehouses w ON w.id = i.warehouse_id
       INNER JOIN products p ON p.id = i.product_id
       LIMIT ? OFFSET ?`
    )
    .all(limit, offset);
  return res.json(rows);
});

export default router;
