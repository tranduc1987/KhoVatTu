import express from 'express';
import { db } from '../db/index.js';
import { authenticate, requirePermission } from '../lib/auth.js';
import { categorySchema, supplierSchema, warehouseSchema, productSchema } from '../lib/validators.js';

const router = express.Router();

const handleValidation = (schema, data, res) => {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    res.status(400).json({ message: 'Dữ liệu không hợp lệ.', errors: parsed.error.flatten() });
    return null;
  }
  return parsed.data;
};

router.get('/categories', authenticate, requirePermission('products:read'), (req, res) => {
  const rows = db.prepare('SELECT * FROM categories').all();
  return res.json(rows);
});

router.post('/categories', authenticate, requirePermission('categories:write'), (req, res) => {
  const data = handleValidation(categorySchema, req.body, res);
  if (!data) return null;
  const result = db
    .prepare('INSERT INTO categories (name, description) VALUES (?, ?)')
    .run(data.name, data.description || null);
  return res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/categories/:id', authenticate, requirePermission('categories:write'), (req, res) => {
  const data = handleValidation(categorySchema, req.body, res);
  if (!data) return null;
  db.prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?').run(
    data.name,
    data.description || null,
    req.params.id
  );
  return res.json({ message: 'Cập nhật danh mục thành công.' });
});

router.delete('/categories/:id', authenticate, requirePermission('categories:write'), (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  return res.json({ message: 'Đã xoá danh mục.' });
});

router.get('/suppliers', authenticate, requirePermission('products:read'), (req, res) => {
  const rows = db.prepare('SELECT * FROM suppliers').all();
  return res.json(rows);
});

router.post('/suppliers', authenticate, requirePermission('suppliers:write'), (req, res) => {
  const data = handleValidation(supplierSchema, req.body, res);
  if (!data) return null;
  const result = db
    .prepare('INSERT INTO suppliers (name, phone, email, address) VALUES (?, ?, ?, ?)')
    .run(data.name, data.phone || null, data.email || null, data.address || null);
  return res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/suppliers/:id', authenticate, requirePermission('suppliers:write'), (req, res) => {
  const data = handleValidation(supplierSchema, req.body, res);
  if (!data) return null;
  db.prepare('UPDATE suppliers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?').run(
    data.name,
    data.phone || null,
    data.email || null,
    data.address || null,
    req.params.id
  );
  return res.json({ message: 'Cập nhật nhà cung cấp thành công.' });
});

router.delete('/suppliers/:id', authenticate, requirePermission('suppliers:write'), (req, res) => {
  db.prepare('DELETE FROM suppliers WHERE id = ?').run(req.params.id);
  return res.json({ message: 'Đã xoá nhà cung cấp.' });
});

router.get('/warehouses', authenticate, requirePermission('products:read'), (req, res) => {
  const rows = db.prepare('SELECT * FROM warehouses').all();
  return res.json(rows);
});

router.post('/warehouses', authenticate, requirePermission('warehouses:write'), (req, res) => {
  const data = handleValidation(warehouseSchema, req.body, res);
  if (!data) return null;
  const result = db
    .prepare('INSERT INTO warehouses (name, location) VALUES (?, ?)')
    .run(data.name, data.location || null);
  return res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/warehouses/:id', authenticate, requirePermission('warehouses:write'), (req, res) => {
  const data = handleValidation(warehouseSchema, req.body, res);
  if (!data) return null;
  db.prepare('UPDATE warehouses SET name = ?, location = ? WHERE id = ?').run(
    data.name,
    data.location || null,
    req.params.id
  );
  return res.json({ message: 'Cập nhật kho thành công.' });
});

router.delete('/warehouses/:id', authenticate, requirePermission('warehouses:write'), (req, res) => {
  db.prepare('DELETE FROM warehouses WHERE id = ?').run(req.params.id);
  return res.json({ message: 'Đã xoá kho.' });
});

router.get('/products', authenticate, requirePermission('products:read'), (req, res) => {
  const rows = db
    .prepare(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id`
    )
    .all();
  return res.json(rows);
});

router.post('/products', authenticate, requirePermission('products:write'), (req, res) => {
  const data = handleValidation(productSchema, req.body, res);
  if (!data) return null;
  const result = db
    .prepare(
      `INSERT INTO products (sku, name, category_id, unit, cost, price, min_stock)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.sku,
      data.name,
      data.category_id ?? null,
      data.unit,
      data.cost,
      data.price,
      data.min_stock
    );
  return res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/products/:id', authenticate, requirePermission('products:write'), (req, res) => {
  const data = handleValidation(productSchema, req.body, res);
  if (!data) return null;
  db.prepare(
    `UPDATE products
     SET sku = ?, name = ?, category_id = ?, unit = ?, cost = ?, price = ?, min_stock = ?
     WHERE id = ?`
  ).run(
    data.sku,
    data.name,
    data.category_id ?? null,
    data.unit,
    data.cost,
    data.price,
    data.min_stock,
    req.params.id
  );
  return res.json({ message: 'Cập nhật vật tư thành công.' });
});

router.delete('/products/:id', authenticate, requirePermission('products:write'), (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  return res.json({ message: 'Đã xoá vật tư.' });
});

router.get('/inventory', authenticate, requirePermission('products:read'), (req, res) => {
  const rows = db
    .prepare(
      `SELECT i.id, i.quantity, w.name as warehouse_name, p.name as product_name, p.sku
       FROM inventory i
       INNER JOIN warehouses w ON w.id = i.warehouse_id
       INNER JOIN products p ON p.id = i.product_id`
    )
    .all();
  return res.json(rows);
});

export default router;
