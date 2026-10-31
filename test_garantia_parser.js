const fs = require('fs');
const { parsePdf } = require('./saas-platform/src/parsers/pdf-parser');

async function testGarantia() {
  const buf = fs.readFileSync('Termo de garantia PaX-i 047-024913.pdf');
  const d = await parsePdf(buf);
  const text = d.text;
  const rows = d.spatialLines[0];

  console.log('--- PARSING TERMO DE GARANTIA ---');

  // 1. NF
  const nfMatch = text.match(/(?:numero da nota fiscal|nota fiscal|nf)[:\s]*([0-9]+)/i) || 
                  text.match(/(?:16208|16440|[0-9]{4,6})/);
  
  // 2. Equipamento e Serial
  const equipMatch = text.match(/PaX-i|Smart|Tom[oó]grafo|[A-Za-z0-9\-]+/i);
  const serialMatch = text.match(/(?:n[oº\.]?\s*s[eé]rie|serial)[:\s]*([0-9]{3}-[0-9]{6})/i);

  // 3. Técnico
  const techMatch = text.match(/Lucas Gato|[A-Z][a-z]+ [A-Z][a-z]+/);

  // 4. Cliente
  const clientMatch = text.match(/(?:SOUZA & CARVALHO ODONTOLOGIA LTDA|CLINICA DENTARIA [^\n\r]+)/i);

  // 5. Cidade
  const cityMatch = text.match(/LIMEIRA\/SP|SAO SEBASTIAO DO PARAISO\/MG|[A-Z\s]+\/[A-Z]{2}/i);

  // 6. Datas e Prazo
  const prazoMatch = text.match(/([0-9]\s*Anos\s*Total)/i);
  const dataInicioMatch = text.match(/(2026-[0-9]{2}-[0-9]{2}|[0-9]{2}\/[0-9]{2}\/[0-9]{4})/);
  const dataFimMatch = text.match(/(2031-[0-9]{2}-[0-9]{2}|30-10-2029|[0-9]{2}-[0-9]{2}-[0-9]{4})/);

  // 7. Bullets (All 16 clauses)
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const bullets = [];
  let currentBullet = '';

  for (const line of lines) {
    if (line.startsWith('•')) {
      if (currentBullet) bullets.push(currentBullet);
      currentBullet = line;
    } else if (currentBullet && !line.includes('EU ___') && !line.includes('declaro estar') && !line.includes('Vatech')) {
      currentBullet += ' ' + line;
    }
  }
  if (currentBullet) bullets.push(currentBullet);

  console.log('NF:', nfMatch ? nfMatch[0] : 'N/A');
  console.log('Serial:', serialMatch ? serialMatch[1] : 'N/A');
  console.log('Cliente:', clientMatch ? clientMatch[0] : 'N/A');
  console.log('Prazo:', prazoMatch ? prazoMatch[0] : 'N/A');
  console.log('Cidade:', cityMatch ? cityMatch[0] : 'N/A');
  console.log('Data Início:', dataInicioMatch ? dataInicioMatch[0] : 'N/A');
  console.log('Data Fim:', dataFimMatch ? dataFimMatch[0] : 'N/A');
  console.log('TOTAL DE CLÁUSULAS EXTRAÍDAS:', bullets.length);
  bullets.forEach((b, i) => console.log(`  [Art. ${i+1}]: ${b.slice(0, 70)}...`));
}

testGarantia();
