const fs = require('fs');
const path = require('path');
const vm = require('vm');

const { renderMasterWorkflowHtml } = require('../src/renderers/master-workflow-engine');

const testAttendance = {
  idAtendimento: '261029114334',
  status: 'Pendente',
  dataCriacao: '2026-10-30',
  cliente: {
    razaoSocial: 'CLINICA DENTARIA UNIAO SAO JUDAS LTDA',
    nomeContato: 'MAURI FERREIRA TRINDADE JUNIO',
    telefone: '11 96459-1460',
    email: 'MAURITRINDADE@GMAIL.COM',
    endereco: 'RUA DESEMBARGADOR JORGE FONTANA 180 PARQUE SÃO JUDAS',
    cidadeUf: 'SAO SEBASTIAO DO PARAISO/MG',
    cep: '37950-000'
  },
  equipamento: {
    modelo: 'PaX-i',
    nSerie: '047-024914',
    notaFiscal: '16440',
    anosGarantia: '3',
    comCeph: 'NÃO',
    comBase: 'NÃO'
  },
  tecnico: {
    empresa: 'EXACTA MANUTENCOES',
    nomeTecnico: 'Lucas Gato'
  },
  solicitante: 'Guilherme Pereira',
  horario: '9:00',
  servico: 'INSTALAÇÃO DE EQUIPAMENTO',
  observacoes: 'Manter contato com pós venda e tirar duvidas antes de qualquer circunstância.'
};

const rendered = renderMasterWorkflowHtml(testAttendance);
console.log('Total rendered HTML length:', rendered.length);

// Extract all <script> blocks and validate syntax with node:vm
const scriptMatches = [...rendered.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi)];
console.log(`Found ${scriptMatches.length} <script> blocks.`);

let errors = 0;
scriptMatches.forEach((m, idx) => {
  const code = m[1].trim();
  if (!code) return;
  try {
    new vm.Script(code);
  } catch (err) {
    console.error(`Script syntax error in block #${idx + 1}:`, err.message);
    errors++;
  }
});

console.log(`Script syntax validation: ${errors} errors.`);
console.log('Contains CLINICA DENTARIA UNIAO SAO JUDAS LTDA:', rendered.includes('CLINICA DENTARIA UNIAO SAO JUDAS LTDA'));
console.log('Contains 047-024914:', rendered.includes('047-024914'));
console.log('Contains NF 16440:', rendered.includes('16440'));
console.log('Contains Solicitante Guilherme Pereira:', rendered.includes('Guilherme Pereira'));
console.log('Contains 61 items in Step 2:', rendered.includes('q61'));
console.log('Contains 16 clauses in Step 4:', rendered.includes('• A garantia no equipamento será prestada pelo período'));
console.log('Contains Ez3D-i tools in Step 5:', rendered.includes('fb_q3b_3dpan'));
console.log('Contains PDF Dossie generator:', rendered.includes('gerarHtmlDossieCompleto'));
