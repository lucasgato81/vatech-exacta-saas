const fs = require('fs');
const { parsePdf } = require('./saas-platform/src/parsers/pdf-parser');

async function testSpatialTable() {
  const buf = fs.readFileSync('Termo de garantia PaX-i 047-024913.pdf');
  const d = await parsePdf(buf);
  const rows = d.spatialLines[0];

  console.log('--- TESTANDO EXTRAÇÃO POR LINHAS ESPACIAIS ---');
  
  let equipamento = '', serial = '', nf = '', tecnico = '', cliente = '', garantia = '', cidade = '', dataInicio = '', dataFim = '';

  for (let i = 0; i < rows.length; i++) {
    const text = rows[i].text;

    // Row containing PaX-i and Serial and NF
    if (text.includes('PaX-i') || text.includes('n. Série:')) {
      const parts = rows[i].items.map(it => it.str.trim()).filter(Boolean);
      equipamento = parts[0];
      const serialIdx = parts.findIndex(p => p.includes('047-'));
      if (serialIdx >= 0) serial = parts[serialIdx];
      const nfItem = parts.find(p => /^[0-9]{4,6}$/.test(p));
      if (nfItem) nf = nfItem;
    }

    // Row containing Lucas Gato
    if (text.includes('Lucas Gato') || (i > 0 && rows[i-1].text.includes('Nome do Técnico'))) {
      tecnico = rows[i].text;
    }

    // Row containing Cliente
    if (i > 0 && rows[i-1].text.includes('Dados do Cliente')) {
      cliente = rows[i].text;
    }

    // Row containing Datas e Cidade
    if (text.includes('Anos Total')) {
      const parts = rows[i].items.map(it => it.str.trim()).filter(Boolean);
      garantia = parts.slice(0, 2).join(' ');
      cidade = parts.find(p => p.includes('/'));
      const dates = parts.filter(p => /[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(p) || /[0-9]{2}-[0-9]{2}-[0-9]{4}/.test(p));
      if (dates.length >= 1) dataInicio = dates[0];
      if (dates.length >= 2) dataFim = dates[1];
    }
  }

  console.log('Equipamento:', equipamento);
  console.log('Serial:', serial);
  console.log('Nota Fiscal:', nf);
  console.log('Técnico:', tecnico);
  console.log('Cliente:', cliente);
  console.log('Garantia:', garantia);
  console.log('Cidade:', cidade);
  console.log('Data Início:', dataInicio);
  console.log('Data Fim:', dataFim);
}

testSpatialTable();
