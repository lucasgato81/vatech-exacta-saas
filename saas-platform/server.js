const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

const { ingestDocument } = require('./src/parsers/document-ingestion');
const { extractAttendanceData } = require('./src/parsers/attendance-extractor');
const { renderMasterWorkflowHtml } = require('./src/renderers/master-workflow-engine');
const storage = require('./src/database/storage');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static frontend studio
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for PDF/DOCX file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storageConfig = multer.memoryStorage();
const upload = multer({
  storage: storageConfig,
  limits: { fileSize: 30 * 1024 * 1024 }
});

function fixEncoding(str) {
  if (!str) return '';
  try {
    if (/[\u00C0-\u00FF]/.test(str)) {
      return Buffer.from(str, 'latin1').toString('utf8');
    }
  } catch {}
  return str;
}

/**
 * 1. POST /api/convert-document (Single or Multi-file Ingestion)
 * Ingests uploaded PDF/Word documents, extracts high-precision attendance metadata,
 * and generates the official 1:1 Vatech digital workflow.
 */
app.post('/api/convert-document', upload.array('documents', 10), async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) {
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado. Selecione um ou mais arquivos PDF/DOCX.' });
    }

    let combinedText = '';
    const combinedSpatial = [];
    const convertedDocs = [];

    for (const file of files) {
      const cleanName = fixEncoding(file.originalname);
      console.log(`[Ingestion] Processando: ${cleanName} (${(file.buffer.length / 1024).toFixed(1)} KB)`);

      const docInfo = await ingestDocument(file.buffer, cleanName, file.mimetype);
      combinedText += '\n' + (docInfo.rawText || '');
      if (docInfo.spatialLines && docInfo.spatialLines.length > 0) {
        combinedSpatial.push(...docInfo.spatialLines);
      }
      convertedDocs.push({
        name: cleanName,
        text: docInfo.rawText
      });
    }

    const attendanceData = extractAttendanceData(combinedText, combinedSpatial);
    console.log(`[Extracted] OS #${attendanceData.idAtendimento} | ${attendanceData.cliente.razaoSocial} | S/N: ${attendanceData.equipamento.nSerie} | NF: ${attendanceData.equipamento.notaFiscal}`);

    // Create a workflow batch
    const batchId = 'os_' + (attendanceData.idAtendimento || Date.now());
    const batchTitle = `${attendanceData.cliente.razaoSocial} — ${attendanceData.equipamento.modelo} (S/N: ${attendanceData.equipamento.nSerie})`;

    const batch = {
      id: batchId,
      title: batchTitle,
      createdAt: new Date().toISOString(),
      attendanceData,
      documents: convertedDocs
    };

    storage.saveBatch(batch);

    res.json({
      success: true,
      batchId,
      workflowUrl: `/workflow/${batchId}`,
      attendanceData
    });
  } catch (err) {
    console.error('[Ingestion Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 1.1 GET /api/convert-demo
 * Test single demo document with official master workflow
 */
app.get('/api/convert-demo', async (req, res) => {
  try {
    const rawFileName = req.query.file;
    if (!rawFileName) return res.status(400).json({ error: 'Parâmetro file obrigatório' });

    const fileName = fixEncoding(rawFileName);
    const parentDir = path.join(__dirname, '..');
    const filePath = path.join(parentDir, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo demonstrativo não encontrado: ' + fileName });
    }

    const buffer = fs.readFileSync(filePath);
    const mime = fileName.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf';

    const docInfo = await ingestDocument(buffer, fileName, mime);
    const attendanceData = extractAttendanceData(docInfo.rawText, docInfo.spatialLines);

    // Save batch for workflow view
    const batchId = 'demo_' + Date.now();
    const batch = {
      id: batchId,
      title: `${attendanceData.cliente.razaoSocial} — ${attendanceData.equipamento.modelo} (${attendanceData.equipamento.nSerie})`,
      createdAt: new Date().toISOString(),
      attendanceData,
      documents: [{ name: fileName, text: docInfo.rawText }]
    };
    storage.saveBatch(batch);

    res.json({
      success: true,
      batchId,
      workflowUrl: `/workflow/${batchId}`,
      appUrl: `/app/${batchId}`,
      pdfUrl: `/pdf-preview/${batchId}`,
      attendanceData
    });
  } catch (err) {
    console.error('[Demo Ingestion Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 1.2 GET /api/load-full-sequence
 * Instantly loads all reference documents of the installation into the official master sequence!
 */
app.get('/api/load-full-sequence', async (req, res) => {
  try {
    const parentDir = path.join(__dirname, '..');
    const sequenceFiles = [
      'Solicitação de instalaçãoPaX-i 047-024913.pdf',
      'Checklist pós instalação PaX-i 047-024913.pdf',
      'Relatório visita tecnica PaX-i 047-024913.pdf',
      'Termo de garantia PaX-i 047-024913.pdf',
      'Feadback cliente PaX-i 047-024913.pdf'
    ];

    let combinedText = '';
    const combinedSpatial = [];
    const convertedDocs = [];

    for (const f of sequenceFiles) {
      const filePath = path.join(parentDir, f);
      if (fs.existsSync(filePath)) {
        const buf = fs.readFileSync(filePath);
        const docInfo = await ingestDocument(buf, f, 'application/pdf');
        combinedText += '\n' + (docInfo.rawText || '');
        if (docInfo.spatialLines) combinedSpatial.push(...docInfo.spatialLines);
        convertedDocs.push({ name: f, text: docInfo.rawText });
      }
    }

    const attendanceData = extractAttendanceData(combinedText, combinedSpatial);
    const batchId = 'seq_vatech_' + Date.now();
    const batch = {
      id: batchId,
      title: 'Atendimento Técnico PaX-i (Sequência Completa de 5 Documentos)',
      createdAt: new Date().toISOString(),
      attendanceData,
      documents: convertedDocs
    };

    storage.saveBatch(batch);

    res.json({
      success: true,
      batchId,
      workflowUrl: `/workflow/${batchId}`,
      count: convertedDocs.length,
      attendanceData
    });
  } catch (err) {
    console.error('[Sequence Ingestion Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 2. GET /workflow/:id
 * Official 1:1 Responsive Digital Workflow.
 * Identical to original documents:
 * - Step 1: OS & Dados (pre-filled with customer & equipment)
 * - Step 2: Checklist (all 61 official items across 8 categories, voltage table, PC specs, software versions)
 * - Step 3: Relatório de Visita Técnica (intervention box, motive, period, operating term)
 * - Step 4: Certificado de Garantia (table, NF, all 16 legal warranty clauses in full, client declaration)
 * - Step 5: Feedback do Cliente (training ratings, positioning items, EzDent-i, Ez3D-i, 2 essay boxes)
 * - Step 6: Homologação (canvas touch signatures + GPS photo watermark)
 * Formats dynamically for PC (widescreen) and Mobile (fluid touch).
 */
app.get('/workflow/:id', (req, res) => {
  const batch = storage.getBatchById(req.params.id);
  const attendanceData = batch?.attendanceData || extractAttendanceData('');
  const html = renderMasterWorkflowHtml(attendanceData);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

/**
 * 3. GET /app/:id
 * Direct single form view (serves official master workflow)
 */
app.get('/app/:id', (req, res) => {
  const batch = storage.getBatchById(req.params.id);
  const attendanceData = batch?.attendanceData || extractAttendanceData('');
  const html = renderMasterWorkflowHtml(attendanceData);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

/**
 * 4. GET /pdf-preview/:id
 * Official A4 PDF preview modal / layout
 */
app.get('/pdf-preview/:id', (req, res) => {
  const batch = storage.getBatchById(req.params.id);
  const attendanceData = batch?.attendanceData || extractAttendanceData('');
  const html = renderMasterWorkflowHtml(attendanceData);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    if (name.toLowerCase().includes('topaz') || name.toLowerCase().includes('loopback')) continue;
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        const addr = iface.address;
        if (addr.startsWith('10.') || addr.startsWith('192.168.') || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(addr)) {
          return addr;
        }
      }
    }
  }
  return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIp();
  console.log(`\n======================================================`);
  console.log(`🚀 DocToField SaaS Platform Studio Rodando!`);
  console.log(`💻 Local PC:      http://localhost:${PORT}/`);
  console.log(`📱 Rede / Mobile: http://${ip}:${PORT}/`);
  console.log(`======================================================\n`);
});
