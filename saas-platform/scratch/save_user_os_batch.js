const storage = require('../src/database/storage');

const batch261029114334 = {
  id: 'os_261029114334',
  title: 'CLINICA DENTARIA UNIAO SAO JUDAS LTDA — PaX-i (047-024914)',
  createdAt: '2026-10-30T09:00:00.000Z',
  attendanceData: {
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
  }
};

storage.saveBatch(batch261029114334);
console.log('Batch os_261029114334 saved successfully!');
