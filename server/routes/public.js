import express from 'express';
import { db } from '../db/index.js';

const router = express.Router();

// Public inventory summary: sums quantity per product across all warehouses
router.get('/inventory', (req, res) => {
  const rows = db
    .prepare(
      `SELECT p.id, p.sku, p.name, p.unit, p.origin,
              COALESCE(SUM(i.quantity), 0) as total_quantity
       FROM products p
       LEFT JOIN inventory i ON i.product_id = p.id
       GROUP BY p.id, p.sku, p.name, p.unit, p.origin
       ORDER BY p.name`
    )
    .all();
  return res.json(rows);
});

export default router;
