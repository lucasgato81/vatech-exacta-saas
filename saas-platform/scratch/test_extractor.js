const { extractAttendanceData } = require('../src/parsers/attendance-extractor');

const sampleText = `
Solicitação de Serviço rev 01 vatech
Solicitação n.: 261029114334
Data de Serviço: 2026-10-30
Solicitante: Guilherme Pereira
Dados do Cliente
Nome : CLINICA DENTARIA UNIAO SAO JUDAS LTDA
Endereço: RUA DESEMBARGADOR JORGE FONTANA 180 PARQUE SÃO JUDAS Cep: 37950-000
Municipio/ UF: SAO SEBASTIAO DO PARAISO/MG
Contato: MAURI FERREIRA TRINDADE JUNIO
Email: MAURITRINDADE@GMAIL.COM
Tel: 11 96459-1460
Equipamento: PaX-i Com Ceph: NÃO
n. Série: 047-024914 Com Base: NÃO
Serviço: INSTALAÇÃO DE EQUIPAMENTO
Técnico Acompanhará entrega : SIM Horário: 9:00
Empresa solicitada: EXACTA MANUTENCOES
Técnico: Lucas Gato
Observações: Manter contato com pós venda e tirar duvidas antes de qualquer circunstância.
`;

const data = extractAttendanceData(sampleText);
console.log('EXTRACTED DATA:');
console.log(JSON.stringify(data, null, 2));
