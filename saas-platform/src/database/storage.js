const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const TEMPLATES_FILE = path.join(DB_DIR, 'templates.json');
const ORDERS_FILE = path.join(DB_DIR, 'orders.json');
const BATCHES_FILE = path.join(DB_DIR, 'batches.json');
const ATTENDANCES_FILE = path.join(DB_DIR, 'attendances.json');

function readJson(file, fallback = []) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const content = fs.readFileSync(file, 'utf8').trim();
    if (!content) return fallback;
    return JSON.parse(content);
  } catch (err) {
    console.error(`[Storage Read Error] ${file}:`, err.message);
    return fallback;
  }
}

function writeJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[Storage Write Error] ${file}:`, err.message);
  }
}

function cleanClientName(name) {
  if (!name) return 'Cliente Não Informado';
  return String(name).replace(/^\|\s*/, '').replace(/\|\s*TEL:.*$/i, '').replace(/\|/g, '').trim();
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
  },

  /**
   * BANCO DE DADOS DE ATENDIMENTOS E CLIENTES
   * Salva e gerencia cada preenchimento organizado com o nome do cliente.
   */
  getAttendances(query = '') {
    let list = readJson(ATTENDANCES_FILE, null);
    if (!list) {
      list = [];
    }

    const map = new Map(list.map(item => [item.idAtendimento || item.id, item]));

    // 1. Atendimento de Desmontagem de referência (PaX-i 047-017430)
    if (!map.has('261110191159') || !map.get('261110191159').attendanceData) {
      map.set('261110191159', {
        id: 'att_261110191159',
        idAtendimento: '261110191159',
        clienteNome: 'MAYCON DE SOUSA NOGUEIRA',
        clienteContato: 'MAYCON DE SOUSA NOGUEIRA',
        clienteTelefone: '35 99960-7007',
        clienteCidadeUf: 'ALTEROSA/MG',
        clienteEndereco: 'R DO CONTORNO 253 . CRUZEIRO',
        clienteCep: '37145-000',
        equipamentoModelo: 'PaX-i',
        equipamentoSerie: '047-017430',
        equipamentoNF: '16208',
        tipoServico: 'Desmontagem',
        dataAtendimento: '2026-11-15',
        tecnicoNome: 'Lucas Gato',
        tecnicoEmpresa: 'EXACTA MANUTENCOES',
        status: 'Homologado',
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
        temAssinaturas: true,
        temFotos: false,
        attendanceData: {
          idAtendimento: '261110191159',
          servico: 'DESMONTAGEM DE EQUIPAMENTO',
          tipoServico: 'desmontagem',
          cliente: {
            razaoSocial: 'MAYCON DE SOUSA NOGUEIRA',
            nomeContato: 'MAYCON DE SOUSA NOGUEIRA',
            telefone: '35 99960-7007',
            email: 'MAYCONSNOGUEIRA@GMAIL.COM',
            endereco: 'R DO CONTORNO 253 . CRUZEIRO',
            cidadeUf: 'ALTEROSA/MG',
            cep: '37145-000'
          },
          equipamento: {
            modelo: 'PaX-i',
            nSerie: '047-017430',
            notaFiscal: '16208',
            anosGarantia: '5',
            comCeph: 'NÃO',
            comBase: 'NÃO'
          },
          equipamento_desmontagem: {
            modelo: 'PaX-i',
            nSerie: '047-017430',
            notaFiscal: '16208',
            anosGarantia: '5',
            comCeph: 'NÃO',
            comBase: 'NÃO',
            osId: '261110191159',
            servico: 'DESMONTAGEM DE EQUIPAMENTO'
          },
          equipamento_montagem: {
            modelo: 'Vatech A9',
            nSerie: 'RC098-003544',
            notaFiscal: '16457',
            anosGarantia: '10',
            comCeph: 'SIM',
            comBase: 'SIM',
            osId: '261110191017',
            servico: 'INSTALAÇÃO DE EQUIPAMENTO'
          },
          tecnico: { empresa: 'EXACTA MANUTENCOES', nomeTecnico: 'Lucas Gato' },
          solicitante: 'Guilherme Pereira',
          horario: '9:00',
          observacoes: 'Manter contato com pós venda e tirar duvidas antes de qualquer circunstância.'
        },
        payload: null
      });
    }

    // 2. Atendimento de Montagem de referência (Vatech A9 RC098-003544)
    if (!map.has('261110191017') || !map.get('261110191017').attendanceData) {
      map.set('261110191017', {
        id: 'att_261110191017',
        idAtendimento: '261110191017',
        clienteNome: 'MAYCON DE SOUSA NOGUEIRA',
        clienteContato: 'MAYCON DE SOUSA NOGUEIRA',
        clienteTelefone: '35 99960-7007',
        clienteCidadeUf: 'ALTEROSA/MG',
        clienteEndereco: 'R DO CONTORNO 253 . CRUZEIRO',
        clienteCep: '37145-000',
        equipamentoModelo: 'Vatech A9',
        equipamentoSerie: 'RC098-003544',
        equipamentoNF: '16457',
        tipoServico: 'Montagem',
        dataAtendimento: '2026-11-15',
        tecnicoNome: 'Lucas Gato',
        tecnicoEmpresa: 'EXACTA MANUTENCOES',
        status: 'Homologado',
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
        temAssinaturas: true,
        temFotos: false,
        attendanceData: {
          idAtendimento: '261110191017',
          servico: 'INSTALAÇÃO DE EQUIPAMENTO',
          tipoServico: 'montagem',
          cliente: {
            razaoSocial: 'MAYCON DE SOUSA NOGUEIRA',
            nomeContato: 'MAYCON DE SOUSA NOGUEIRA',
            telefone: '35 99960-7007',
            email: 'MAYCONSNOGUEIRA@GMAIL.COM',
            endereco: 'R DO CONTORNO 253 . CRUZEIRO',
            cidadeUf: 'ALTEROSA/MG',
            cep: '37145-000'
          },
          equipamento: {
            modelo: 'Vatech A9',
            nSerie: 'RC098-003544',
            notaFiscal: '16457',
            anosGarantia: '10',
            comCeph: 'SIM',
            comBase: 'SIM'
          },
          equipamento_montagem: {
            modelo: 'Vatech A9',
            nSerie: 'RC098-003544',
            notaFiscal: '16457',
            anosGarantia: '10',
            comCeph: 'SIM',
            comBase: 'SIM',
            osId: '261110191017',
            servico: 'INSTALAÇÃO DE EQUIPAMENTO'
          },
          equipamento_desmontagem: {
            modelo: 'PaX-i',
            nSerie: '047-017430',
            notaFiscal: '16208',
            anosGarantia: '5',
            comCeph: 'NÃO',
            comBase: 'NÃO',
            osId: '261110191159',
            servico: 'DESMONTAGEM DE EQUIPAMENTO'
          },
          tecnico: { empresa: 'EXACTA MANUTENCOES', nomeTecnico: 'Lucas Gato' },
          solicitante: 'Guilherme Pereira',
          horario: '9:00',
          observacoes: 'Manter contato com pós venda e tirar duvidas antes de qualquer circunstância.'
        },
        payload: null
      });
    }

    const batches = readJson(BATCHES_FILE, []);
    for (const b of batches) {
      if (b && b.attendanceData) {
        const ad = b.attendanceData;
        const cliName = cleanClientName(ad.cliente?.razaoSocial);
        const osId = ad.idAtendimento || '261029114334';
        if (cliName && cliName !== '...' && !map.has(osId)) {
          map.set(osId, {
            id: b.id || ('att_' + osId),
            idAtendimento: osId,
            clienteNome: cliName,
            clienteContato: cleanClientName(ad.cliente?.nomeContato),
            clienteTelefone: cleanClientName(ad.cliente?.telefone),
            clienteCidadeUf: cleanClientName(ad.cliente?.cidadeUf),
            clienteEndereco: cleanClientName(ad.cliente?.endereco),
            clienteCep: ad.cliente?.cep || '',
            equipamentoModelo: ad.equipamento?.modelo || 'PaX-i',
            equipamentoSerie: ad.equipamento?.nSerie || '',
            equipamentoNF: ad.equipamento?.notaFiscal || '',
            tipoServico: ad.servico && /DESMONTAGEM/i.test(ad.servico) ? 'Desmontagem' : 'Montagem',
            dataAtendimento: ad.dataCriacao || new Date().toISOString().split('T')[0],
            tecnicoNome: ad.tecnico?.nomeTecnico || 'Lucas Gato',
            tecnicoEmpresa: ad.tecnico?.empresa || 'EXACTA MANUTENCOES',
            status: 'Salvo',
            dataCriacao: b.createdAt || new Date().toISOString(),
            dataAtualizacao: b.createdAt || new Date().toISOString(),
            temAssinaturas: false,
            temFotos: false,
            attendanceData: ad,
            payload: b.savedPayload || null
          });
        }
      }
    }
    list = Array.from(map.values());
    writeJson(ATTENDANCES_FILE, list);

    if (query) {
      const q = query.toLowerCase().trim();
      return list.filter(a =>
        (a.clienteNome && a.clienteNome.toLowerCase().includes(q)) ||
        (a.idAtendimento && a.idAtendimento.toLowerCase().includes(q)) ||
        (a.equipamentoSerie && a.equipamentoSerie.toLowerCase().includes(q)) ||
        (a.equipamentoModelo && a.equipamentoModelo.toLowerCase().includes(q)) ||
        (a.clienteCidadeUf && a.clienteCidadeUf.toLowerCase().includes(q)) ||
        (a.tipoServico && a.tipoServico.toLowerCase().includes(q)) ||
        (a.tecnicoNome && a.tecnicoNome.toLowerCase().includes(q))
      );
    }
    return list;
  },

  getAttendanceById(id) {
    const list = this.getAttendances();
    const cleanId = String(id).replace(/^(?:os_|att_)/, '');
    return list.find(a =>
      a.id === id ||
      a.idAtendimento === id ||
      a.idAtendimento === cleanId ||
      ('os_' + a.idAtendimento) === id ||
      ('att_' + a.idAtendimento) === id
    );
  },

  saveAttendance(data) {
    const list = this.getAttendances();
    
    // Extrai e normaliza todos os metadados do cliente e do equipamento
    const ad = data.attendanceData || data.dadosAtendimento || data;
    const cli = ad.cliente || {};
    const eq = ad.equipamento || {};
    const tec = ad.tecnico || {};
    const idAtendimento = data.idAtendimento || ad.idAtendimento || (data.inputs ? data.inputs.osId : null) || Date.now().toString();
    const id = data.id || ('att_' + idAtendimento);

    const rawClienteNome = cli.razaoSocial || (data.inputs ? data.inputs.cliRazao : null) || data.clienteNome || 'Cliente';
    const clienteNome = cleanClientName(rawClienteNome);
    
    const isDesm = (data.tipoServico && /desmont/i.test(data.tipoServico)) ||
                   (ad.servico && /desmont/i.test(ad.servico)) ||
                   (data.modoDesmontagem === true);
    const tipoServico = isDesm ? 'Desmontagem' : 'Montagem';

    const record = {
      id: id,
      idAtendimento: idAtendimento,
      clienteNome: clienteNome,
      clienteContato: cleanClientName(cli.nomeContato || (data.inputs ? data.inputs.cliContato : '')),
      clienteTelefone: cleanClientName(cli.telefone || (data.inputs ? data.inputs.cliTelefone : '')),
      clienteCidadeUf: cleanClientName(cli.cidadeUf || (data.inputs ? data.inputs.cliCidadeUf : '')),
      clienteEndereco: cleanClientName(cli.endereco || (data.inputs ? data.inputs.cliEndereco : '')),
      clienteCep: cli.cep || (data.inputs ? data.inputs.cliCep : ''),
      equipamentoModelo: eq.modelo || (data.inputs ? data.inputs.eqModelo : 'PaX-i'),
      equipamentoSerie: eq.nSerie || (data.inputs ? data.inputs.eqSerie : ''),
      equipamentoNF: eq.notaFiscal || (data.inputs ? data.inputs.eqNF : ''),
      equipamentoGarantia: eq.anosGarantia || (data.inputs ? data.inputs.eqGarantia : '5 Anos'),
      tipoServico: tipoServico,
      dataAtendimento: (data.inputs ? data.inputs.osData : '') || ad.dataCriacao || new Date().toISOString().split('T')[0],
      tecnicoNome: tec.nomeTecnico || (data.inputs ? data.inputs.tecNome : 'Lucas Gato'),
      tecnicoEmpresa: tec.empresa || (data.inputs ? data.inputs.tecEmpresa : 'EXACTA MANUTENCOES'),
      status: 'Homologado',
      dataAtualizacao: new Date().toISOString(),
      dataCriacao: data.dataCriacao || new Date().toISOString(),
      temAssinaturas: !!(data.assinaturas && (data.assinaturas.cliente || data.assinaturas.tecnico)),
      temFotos: !!(data.fotos && Object.keys(data.fotos).length > 0),
      payload: data
    };

    // Atualiza registro existente ou insere no topo
    const idx = list.findIndex(a => a.id === id || a.idAtendimento === idAtendimento);
    if (idx >= 0) {
      record.dataCriacao = list[idx].dataCriacao || record.dataCriacao;
      list[idx] = record;
    } else {
      list.unshift(record);
    }
    writeJson(ATTENDANCES_FILE, list);

    // Também atualiza o batch no servidor para acesso direto via /workflow/os_ID
    const batchId = 'os_' + idAtendimento;
    this.saveBatch({
      id: batchId,
      title: `${clienteNome} — ${record.equipamentoModelo} (${record.equipamentoSerie ? 'S/N: ' + record.equipamentoSerie : tipoServico})`,
      createdAt: record.dataAtualizacao,
      attendanceData: {
        idAtendimento: idAtendimento,
        status: record.status,
        dataCriacao: record.dataAtendimento,
        cliente: {
          razaoSocial: record.clienteNome,
          nomeContato: record.clienteContato,
          telefone: record.clienteTelefone,
          endereco: record.clienteEndereco,
          cidadeUf: record.clienteCidadeUf,
          cep: record.clienteCep
        },
        equipamento: {
          modelo: record.equipamentoModelo,
          nSerie: record.equipamentoSerie,
          notaFiscal: record.equipamentoNF,
          anosGarantia: record.equipamentoGarantia
        },
        tecnico: {
          nomeTecnico: record.tecnicoNome,
          empresa: record.tecnicoEmpresa
        },
        servico: tipoServico === 'Desmontagem' ? 'DESMONTAGEM DE EQUIPAMENTO' : 'INSTALAÇÃO DE EQUIPAMENTO'
      },
      savedPayload: data
    });

    console.log(`[Storage] Atendimento de "${clienteNome}" (OS #${idAtendimento} - ${tipoServico}) salvo com sucesso no banco de dados.`);
    return record;
  },

  deleteAttendance(id) {
    const list = this.getAttendances();
    const filtered = list.filter(a => a.id !== id && a.idAtendimento !== id && ('os_' + a.idAtendimento) !== id);
    writeJson(ATTENDANCES_FILE, filtered);
    return true;
  }
};
