import express from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { db } from '../db/index.js';
import { authenticate, requirePermission } from '../lib/auth.js';
import { receiptSchema, issueSchema } from '../lib/validators.js';

const router = express.Router();

const handleValidation = (schema, data, res) => {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    res.status(400).json({ message: 'Du lieu khong hop le.', errors: parsed.error.flatten() });
    return null;
  }
  return parsed.data;
};

const createMovement = db.prepare(
  `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id)
   VALUES (?, ?, ?, ?, ?, ?)`
);

const upsertInventory = db.prepare(
  `INSERT INTO inventory (warehouse_id, product_id, quantity)
   VALUES (?, ?, ?)
   ON CONFLICT(warehouse_id, product_id) DO UPDATE SET quantity = quantity + excluded.quantity`
);

const getReceipt = (id) =>
  db
    .prepare(
      `SELECT r.*, s.name as supplier_name, w.name as warehouse_name, u.full_name as created_by_name
       FROM receipts r
       LEFT JOIN suppliers s ON s.id = r.supplier_id
       INNER JOIN warehouses w ON w.id = r.warehouse_id
       INNER JOIN users u ON u.id = r.created_by
       WHERE r.id = ?`
    )
    .get(id);

const getIssue = (id) =>
  db
    .prepare(
      `SELECT i.*, w.name as warehouse_name, u.full_name as created_by_name, i.created_at
       FROM issues i
       INNER JOIN warehouses w ON w.id = i.warehouse_id
       INNER JOIN users u ON u.id = i.created_by
       WHERE i.id = ?`
    )
    .get(id);

router.get('/receipts', authenticate, requirePermission('receipts:read'), (req, res) => {
  const receipts = db
    .prepare(
      `SELECT r.*, s.name as supplier_name, w.name as warehouse_name, u.full_name as created_by_name
       FROM receipts r
       LEFT JOIN suppliers s ON s.id = r.supplier_id
       INNER JOIN warehouses w ON w.id = r.warehouse_id
       INNER JOIN users u ON u.id = r.created_by`
    )
    .all();
  return res.json(receipts);
});

router.post('/receipts', authenticate, requirePermission('receipts:write'), (req, res) => {
  const data = handleValidation(receiptSchema, req.body, res);
  if (!data) return null;

  const insertReceipt = db.prepare(
    `INSERT INTO receipts (code, supplier_id, warehouse_id, status, received_at, created_by)
     VALUES (?, ?, ?, 'draft', ?, ?)`
  );
  const insertItem = db.prepare(
    `INSERT INTO receipt_items (receipt_id, product_id, quantity, unit_cost)
     VALUES (?, ?, ?, ?)`
  );

  try {
    const transaction = db.transaction(() => {
      const receiptResult = insertReceipt.run(
        data.code,
        data.supplier_id ?? null,
        data.warehouse_id,
        data.received_at || null,
        req.user.sub
      );
      data.items.forEach((item) => {
        insertItem.run(receiptResult.lastInsertRowid, item.product_id, item.quantity, item.unit_cost);
      });
      return receiptResult.lastInsertRowid;
    });

    const receiptId = transaction();
    return res.status(201).json({ id: receiptId });
  } catch (error) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ message: 'Ma phieu da ton tai.' });
    }
    throw error;
  }
});

router.post('/receipts/:id/submit', authenticate, requirePermission('receipts:write'), (req, res) => {
  const receipt = db.prepare('SELECT status FROM receipts WHERE id = ?').get(req.params.id);
  if (!receipt) {
    return res.status(404).json({ message: 'Khong tim thay phieu nhap.' });
  }
  if (receipt.status !== 'draft') {
    return res.status(400).json({ message: 'Chi duoc gui phieu o trang thai draft.' });
  }
  db.prepare("UPDATE receipts SET status = 'submitted' WHERE id = ?").run(req.params.id);
  return res.json({ message: 'Da gui phieu nhap.' });
});

router.post('/receipts/:id/approve', authenticate, requirePermission('receipts:approve'), (req, res) => {
  const receipt = db.prepare('SELECT * FROM receipts WHERE id = ?').get(req.params.id);
  if (!receipt) {
    return res.status(404).json({ message: 'Khong tim thay phieu nhap.' });
  }
  if (receipt.status !== 'submitted') {
    return res.status(400).json({ message: 'Phieu nhap chi duoc duyet khi o trang thai submitted.' });
  }
  const items = db.prepare('SELECT * FROM receipt_items WHERE receipt_id = ?').all(req.params.id);

  const transaction = db.transaction(() => {
    db.prepare("UPDATE receipts SET status = 'approved', received_at = datetime('now') WHERE id = ?").run(
      req.params.id
    );
    items.forEach((item) => {
      upsertInventory.run(receipt.warehouse_id, item.product_id, item.quantity);
      createMovement.run(item.product_id, receipt.warehouse_id, 'in', item.quantity, 'receipt', receipt.id);
    });
  });

  transaction();
  return res.json({ message: 'Da duyet phieu nhap.' });
});

router.post('/receipts/:id/cancel', authenticate, requirePermission('receipts:write'), (req, res) => {
  const receipt = db.prepare('SELECT * FROM receipts WHERE id = ?').get(req.params.id);
  if (!receipt) {
    return res.status(404).json({ message: 'Khong tim thay phieu nhap.' });
  }
  if (receipt.status === 'approved') {
    return res.status(400).json({ message: 'Phieu nhap da duoc duyet, khong the huy.' });
  }
  db.prepare("UPDATE receipts SET status = 'cancelled' WHERE id = ?").run(req.params.id);
  return res.json({ message: 'Da huy phieu nhap.' });
});

router.delete('/receipts/:id', authenticate, requirePermission('receipts:write'), (req, res) => {
  const receipt = db.prepare('SELECT status FROM receipts WHERE id = ?').get(req.params.id);
  if (!receipt) {
    return res.status(404).json({ message: 'Khong tim thay phieu nhap.' });
  }
  if (receipt.status === 'approved') {
    return res.status(400).json({ message: 'Khong the xoa phieu nhap da duyet.' });
  }
  db.prepare('DELETE FROM receipts WHERE id = ?').run(req.params.id);
  return res.json({ message: 'Da xoa phieu nhap.' });
});

router.get('/receipts/:id', authenticate, requirePermission('receipts:read'), (req, res) => {
  const receipt = getReceipt(req.params.id);
  if (!receipt) {
    return res.status(404).json({ message: 'Khong tim thay phieu nhap.' });
  }
  const items = db
    .prepare(
      `SELECT ri.*, p.name as product_name, p.sku
       FROM receipt_items ri
       INNER JOIN products p ON p.id = ri.product_id
       WHERE ri.receipt_id = ?`
    )
    .all(req.params.id);
  return res.json({ ...receipt, items });
});

router.get('/issues', authenticate, requirePermission('issues:read'), (req, res) => {
  const issues = db
    .prepare(
      `SELECT i.*, w.name as warehouse_name, u.full_name as created_by_name,
        (SELECT SUM(ii.quantity) FROM issue_items ii WHERE ii.issue_id = i.id) as total_quantity
       FROM issues i
       INNER JOIN warehouses w ON w.id = i.warehouse_id
       INNER JOIN users u ON u.id = i.created_by`
    )
    .all();
  return res.json(issues);
});

router.post('/issues', authenticate, requirePermission('issues:write'), (req, res) => {
  const data = handleValidation(issueSchema, req.body, res);
  if (!data) return null;

  const insertIssue = db.prepare(
    `INSERT INTO issues (code, warehouse_id, status, issued_at, created_by)
     VALUES (?, ?, ?, ?, ?)`
  );
  const insertItem = db.prepare(
    `INSERT INTO issue_items (issue_id, product_id, quantity, unit_price)
     VALUES (?, ?, ?, ?)`
  );

  try {
    const transaction = db.transaction(() => {
      const issueResult = insertIssue.run(
        data.code,
        data.warehouse_id,
        'draft',
        data.issued_at || null,
        req.user.sub
      );
      data.items.forEach((item) => {
        insertItem.run(issueResult.lastInsertRowid, item.product_id, item.quantity, item.unit_price);
      });
      return issueResult.lastInsertRowid;
    });

    const issueId = transaction();
    // Auto-approve and trừ tồn kho ngay khi lập phiếu
    const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
    const items = db.prepare('SELECT * FROM issue_items WHERE issue_id = ?').all(issueId);

    const shortages = items
      .map((item) => {
        const inventoryRow = db
          .prepare('SELECT quantity FROM inventory WHERE warehouse_id = ? AND product_id = ?')
          .get(issue.warehouse_id, item.product_id);
        const available = inventoryRow ? inventoryRow.quantity : 0;
        const shortage = available - item.quantity;
        return shortage < 0
          ? { product_id: item.product_id, required: item.quantity, available }
          : null;
      })
      .filter(Boolean);

    if (shortages.length > 0) {
      // rollback issue if thiếu hàng
      db.prepare('DELETE FROM issues WHERE id = ?').run(issueId);
      db.prepare('DELETE FROM issue_items WHERE issue_id = ?').run(issueId);
      return res.status(400).json({ message: 'Ton kho khong du de lap phieu xuat.', shortages });
    }

    const approveTx = db.transaction(() => {
      db.prepare("UPDATE issues SET status = 'approved', issued_at = datetime('now') WHERE id = ?").run(issueId);
      items.forEach((item) => {
        upsertInventory.run(issue.warehouse_id, item.product_id, -item.quantity);
        createMovement.run(item.product_id, issue.warehouse_id, 'out', -item.quantity, 'issue', issue.id);
      });
    });
    approveTx();

    return res.status(201).json({ id: issueId, status: 'approved' });
  } catch (error) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ message: 'Ma phieu da ton tai.' });
    }
    throw error;
  }
});

router.post('/issues/:id/submit', authenticate, requirePermission('issues:write'), (req, res) => {
  const issue = db.prepare('SELECT status FROM issues WHERE id = ?').get(req.params.id);
  if (!issue) {
    return res.status(404).json({ message: 'Khong tim thay phieu xuat.' });
  }
  if (issue.status !== 'draft') {
    return res.status(400).json({ message: 'Chi duoc gui phieu o trang thai draft.' });
  }
  db.prepare("UPDATE issues SET status = 'submitted' WHERE id = ?").run(req.params.id);
  return res.json({ message: 'Da gui phieu xuat.' });
});

router.post('/issues/:id/approve', authenticate, requirePermission('issues:approve'), (req, res) => {
  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id);
  if (!issue) {
    return res.status(404).json({ message: 'Khong tim thay phieu xuat.' });
  }
  if (issue.status === 'approved') {
    return res.status(400).json({ message: 'Phieu xuat da duoc duyet.' });
  }
  const items = db.prepare('SELECT * FROM issue_items WHERE issue_id = ?').all(req.params.id);

  const shortages = items
    .map((item) => {
      const inventoryRow = db
        .prepare('SELECT quantity FROM inventory WHERE warehouse_id = ? AND product_id = ?')
        .get(issue.warehouse_id, item.product_id);
      const available = inventoryRow ? inventoryRow.quantity : 0;
      const shortage = available - item.quantity;
      return shortage < 0
        ? { product_id: item.product_id, required: item.quantity, available }
        : null;
    })
    .filter(Boolean);

  if (shortages.length > 0) {
    return res.status(400).json({ message: 'Ton kho khong du de xuat.', shortages });
  }

  const transaction = db.transaction(() => {
    db.prepare("UPDATE issues SET status = 'approved', issued_at = datetime('now') WHERE id = ?").run(req.params.id);
    items.forEach((item) => {
      upsertInventory.run(issue.warehouse_id, item.product_id, -item.quantity);
      createMovement.run(item.product_id, issue.warehouse_id, 'out', -item.quantity, 'issue', issue.id);
    });
  });

  transaction();
  return res.json({ message: 'Da duyet phieu xuat.' });
});

router.post('/issues/:id/cancel', authenticate, requirePermission('issues:write'), (req, res) => {
  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id);
  if (!issue) {
    return res.status(404).json({ message: 'Khong tim thay phieu xuat.' });
  }
  if (issue.status === 'approved') {
    return res.status(400).json({ message: 'Phieu xuat da duoc duyet, khong the huy.' });
  }
  db.prepare("UPDATE issues SET status = 'cancelled' WHERE id = ?").run(req.params.id);
  return res.json({ message: 'Da huy phieu xuat.' });
});

router.delete('/issues/:id', authenticate, requirePermission('issues:write'), (req, res) => {
  const issue = db.prepare('SELECT status FROM issues WHERE id = ?').get(req.params.id);
  if (!issue) {
    return res.status(404).json({ message: 'Khong tim thay phieu xuat.' });
  }
  if (issue.status === 'approved') {
    return res.status(400).json({ message: 'Khong the xoa phieu xuat da duyet.' });
  }
  db.prepare('DELETE FROM issues WHERE id = ?').run(req.params.id);
  return res.json({ message: 'Da xoa phieu xuat.' });
});

router.get('/issues/:id', authenticate, requirePermission('issues:read'), (req, res) => {
  const issue = getIssue(req.params.id);
  if (!issue) {
    return res.status(404).json({ message: 'Khong tim thay phieu xuat.' });
  }
  const items = db
    .prepare(
      `SELECT ii.*, p.name as product_name, p.sku
       FROM issue_items ii
       INNER JOIN products p ON p.id = ii.product_id
       WHERE ii.issue_id = ?`
    )
    .all(req.params.id);
  return res.json({ ...issue, items });
});

const sendWorkbook = async (res, workbook, filename) => {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
};

const sendPdf = (res, doc, filename) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);
  doc.end();
};

router.get('/exports/products/excel', authenticate, requirePermission('exports:read'), async (req, res) => {
  const rows = db.prepare('SELECT sku, name, unit, cost, price, min_stock FROM products').all();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Products');
  sheet.columns = [
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Ten vat tu', key: 'name', width: 30 },
    { header: 'Don vi', key: 'unit', width: 12 },
    { header: 'Gia nhap', key: 'cost', width: 12 },
    { header: 'Gia xuat', key: 'price', width: 12 },
    { header: 'Ton toi thieu', key: 'min_stock', width: 15 }
  ];
  rows.forEach((row) => sheet.addRow(row));
  await sendWorkbook(res, workbook, 'products.xlsx');
});

router.get('/exports/products/pdf', authenticate, requirePermission('exports:read'), (req, res) => {
  const rows = db.prepare('SELECT sku, name, unit, cost, price, min_stock FROM products').all();
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.fontSize(16).text('Danh sach vat tu', { align: 'center' });
  doc.moveDown();
  rows.forEach((row) => {
    doc.fontSize(11).text(`${row.sku} - ${row.name} | ${row.unit} | Nhap: ${row.cost} | Xuat: ${row.price}`);
  });
  sendPdf(res, doc, 'products.pdf');
});

router.get('/exports/receipts/:id/excel', authenticate, requirePermission('exports:read'), async (req, res) => {
  const receipt = db.prepare('SELECT * FROM receipts WHERE id = ?').get(req.params.id);
  if (!receipt) {
    return res.status(404).json({ message: 'Khong tim thay phieu nhap.' });
  }
  const items = db
    .prepare(
      `SELECT ri.quantity, ri.unit_cost, p.sku, p.name
       FROM receipt_items ri
       INNER JOIN products p ON p.id = ri.product_id
       WHERE ri.receipt_id = ?`
    )
    .all(req.params.id);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Receipt');
  sheet.addRow(['Ma phieu', receipt.code]);
  sheet.addRow(['Trang thai', receipt.status]);
  sheet.addRow([]);
  sheet.columns = [
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Ten vat tu', key: 'name', width: 30 },
    { header: 'So luong', key: 'quantity', width: 12 },
    { header: 'Don gia', key: 'unit_cost', width: 12 }
  ];
  items.forEach((row) => sheet.addRow(row));
  await sendWorkbook(res, workbook, `receipt-${receipt.code}.xlsx`);
});

router.get('/exports/receipts/:id/pdf', authenticate, requirePermission('exports:read'), (req, res) => {
  const receipt = db.prepare('SELECT * FROM receipts WHERE id = ?').get(req.params.id);
  if (!receipt) {
    return res.status(404).json({ message: 'Khong tim thay phieu nhap.' });
  }
  const items = db
    .prepare(
      `SELECT ri.quantity, ri.unit_cost, p.sku, p.name
       FROM receipt_items ri
       INNER JOIN products p ON p.id = ri.product_id
       WHERE ri.receipt_id = ?`
    )
    .all(req.params.id);
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.fontSize(16).text(`Phieu nhap ${receipt.code}`, { align: 'center' });
  doc.moveDown();
  items.forEach((row) => {
    doc.fontSize(11).text(`${row.sku} - ${row.name} | SL: ${row.quantity} | DG: ${row.unit_cost}`);
  });
  sendPdf(res, doc, `receipt-${receipt.code}.pdf`);
});

router.get('/exports/issues/:id/excel', authenticate, requirePermission('exports:read'), async (req, res) => {
  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id);
  if (!issue) {
    return res.status(404).json({ message: 'Khong tim thay phieu xuat.' });
  }
  const items = db
    .prepare(
      `SELECT ii.quantity, ii.unit_price, p.sku, p.name
       FROM issue_items ii
       INNER JOIN products p ON p.id = ii.product_id
       WHERE ii.issue_id = ?`
    )
    .all(req.params.id);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Issue');
  sheet.addRow(['Ma phieu', issue.code]);
  sheet.addRow(['Trang thai', issue.status]);
  sheet.addRow([]);
  sheet.columns = [
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Ten vat tu', key: 'name', width: 30 },
    { header: 'So luong', key: 'quantity', width: 12 },
    { header: 'Don gia', key: 'unit_price', width: 12 }
  ];
  items.forEach((row) => sheet.addRow(row));
  await sendWorkbook(res, workbook, `issue-${issue.code}.xlsx`);
});

router.get('/exports/issues/:id/pdf', authenticate, requirePermission('exports:read'), (req, res) => {
  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id);
  if (!issue) {
    return res.status(404).json({ message: 'Khong tim thay phieu xuat.' });
  }
  const items = db
    .prepare(
      `SELECT ii.quantity, ii.unit_price, p.sku, p.name
       FROM issue_items ii
       INNER JOIN products p ON p.id = ii.product_id
       WHERE ii.issue_id = ?`
    )
    .all(req.params.id);
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.fontSize(16).text(`Phieu xuat ${issue.code}`, { align: 'center' });
  doc.moveDown();
  items.forEach((row) => {
    doc.fontSize(11).text(`${row.sku} - ${row.name} | SL: ${row.quantity} | DG: ${row.unit_price}`);
  });
  sendPdf(res, doc, `issue-${issue.code}.pdf`);
});

export default router;
