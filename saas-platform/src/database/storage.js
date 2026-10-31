const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const TEMPLATES_FILE = path.join(DB_DIR, 'templates.json');
const ORDERS_FILE = path.join(DB_DIR, 'orders.json');
const BATCHES_FILE = path.join(DB_DIR, 'batches.json');

function readJson(file, fallback = []) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  getTemplates() {
    return readJson(TEMPLATES_FILE, []);
  },
  getTemplateById(id) {
    const list = readJson(TEMPLATES_FILE, []);
    return list.find(t => t.id === id);
  },
  saveTemplate(template) {
    const list = readJson(TEMPLATES_FILE, []);
    const idx = list.findIndex(t => t.id === template.id);
    if (idx >= 0) {
      list[idx] = template;
    } else {
      list.unshift(template);
    }
    writeJson(TEMPLATES_FILE, list);
    return template;
  },
  getOrders() {
    return readJson(ORDERS_FILE, []);
  },
  saveOrder(order) {
    const list = readJson(ORDERS_FILE, []);
    list.unshift(order);
    writeJson(ORDERS_FILE, list);
    return order;
  },
  getBatches() {
    return readJson(BATCHES_FILE, []);
  },
  getBatchById(id) {
    const list = readJson(BATCHES_FILE, []);
    return list.find(b => b.id === id);
  },
  saveBatch(batch) {
    const list = readJson(BATCHES_FILE, []);
    const idx = list.findIndex(b => b.id === batch.id);
    if (idx >= 0) {
      list[idx] = batch;
    } else {
      list.unshift(batch);
    }
    writeJson(BATCHES_FILE, list);
    return batch;
  }
};
