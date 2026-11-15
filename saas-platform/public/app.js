// Multi-document upload handler
async function handleFileSelect(e) {
  if (e.target.files && e.target.files.length > 0) {
    uploadDocuments(Array.from(e.target.files));
  }
}

function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('dropZone').classList.add('border-blue-600', 'bg-blue-100/50');
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('dropZone').classList.remove('border-blue-600', 'bg-blue-100/50');
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('dropZone').classList.remove('border-blue-600', 'bg-blue-100/50');
  
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    uploadDocuments(Array.from(e.dataTransfer.files));
  }
}

async function uploadDocuments(files) {
  const loadingBox = document.getElementById('loadingBox');
  loadingBox.classList.remove('hidden');

  const formData = new FormData();
  files.forEach(f => formData.append('documents', f));

  const apiKey = localStorage.getItem('GEMINI_API_KEY') || '';
  if (apiKey) formData.append('apiKey', apiKey);

  try {
    const res = await fetch('/api/convert-document', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!data.success) {
      loadingBox.classList.add('hidden');
      alert('Erro na conversão: ' + (data.error || 'Erro desconhecido'));
      return;
    }

    // Immediately open the responsive workflow sequence!
    window.location.href = data.workflowUrl;
  } catch (err) {
    loadingBox.classList.add('hidden');
    alert('Erro de comunicação com o servidor: ' + err.message);
  }
}

// Quick demo loader (Single document)
async function loadDemoDocument(type) {
  const loadingBox = document.getElementById('loadingBox');
  loadingBox.classList.remove('hidden');

  let filename = 'Solicitação de instalaçãoPaX-i 047-024913.pdf';
  if (type === 'Checklist') filename = 'Checklist pós instalação PaX-i 047-024913.pdf';
  if (type === 'Relatorio') filename = 'Relatório visita tecnica PaX-i 047-024913.pdf';
  if (type === 'Garantia') filename = 'Termo de garantia PaX-i 047-024913.pdf';
  if (type === 'Feedback') filename = 'Feadback cliente PaX-i 047-024913.pdf';

  try {
    const res = await fetch(`/api/convert-demo?file=${encodeURIComponent(filename)}`);
    const data = await res.json();
    if (!data.success) {
      loadingBox.classList.add('hidden');
      alert('Erro: ' + data.error);
      return;
    }

    // Immediately open the responsive workflow sequence!
    window.location.href = data.workflowUrl;
  } catch (err) {
    loadingBox.classList.add('hidden');
    alert('Erro: ' + err.message);
  }
}

// Full attendance sequence loader (All 5 documents at once)
async function loadFullSequence() {
  const loadingBox = document.getElementById('loadingBox');
  loadingBox.classList.remove('hidden');

  try {
    const res = await fetch('/api/load-full-sequence');
    const data = await res.json();
    if (!data.success) {
      loadingBox.classList.add('hidden');
      alert('Erro ao carregar sequência: ' + data.error);
      return;
    }

    // Immediately open the full sequence!
    window.location.href = data.workflowUrl;
  } catch (err) {
    loadingBox.classList.add('hidden');
    alert('Erro: ' + err.message);
  }
}

// Desmontagem sequence loader (The 2 official Desmontagem documents)
async function loadDesmontagemSequence() {
  const loadingBox = document.getElementById('loadingBox');
  loadingBox.classList.remove('hidden');

  try {
    const res = await fetch('/api/load-desmontagem-sequence');
    const data = await res.json();
    if (!data.success) {
      loadingBox.classList.add('hidden');
      alert('Erro ao carregar sequência de desmontagem: ' + data.error);
      return;
    }

    // Immediately open the desmontagem workflow!
    window.location.href = data.workflowUrl;
  } catch (err) {
    loadingBox.classList.add('hidden');
    alert('Erro: ' + err.message);
  }
}

// Config modal
function openConfigModal() {
  document.getElementById('geminiApiKeyInput').value = localStorage.getItem('GEMINI_API_KEY') || '';
  document.getElementById('configModal').classList.remove('hidden');
}

function closeConfigModal() {
  document.getElementById('configModal').classList.add('hidden');
}

function saveApiKey() {
  const key = document.getElementById('geminiApiKeyInput').value.trim();
  if (key) {
    localStorage.setItem('GEMINI_API_KEY', key);
    alert('Chave salva com sucesso no navegador!');
  } else {
    localStorage.removeItem('GEMINI_API_KEY');
    alert('Chave removida.');
  }
  closeConfigModal();
}

// ============================================================================
// BANCO DE DADOS DE ATENDIMENTOS E CLIENTES (STUDIO SAAS)
// ============================================================================
let homeDbAttendances = [];
let homeDbFilter = 'todos';

async function loadHomeDatabase() {
  const container = document.getElementById('homeDbListContainer');
  if (!container) return;

  try {
    const res = await fetch('/api/attendances');
    const data = await res.json();
    homeDbAttendances = data.attendances || [];
    renderHomeDatabase();
  } catch (err) {
    console.warn('[Home DB Error]', err);
    container.innerHTML = `
      <div class="text-center py-6 text-red-500 text-xs">
        Erro ao carregar banco de dados: ${err.message}
      </div>
    `;
  }
}

function setHomeDbFilter(filter) {
  homeDbFilter = filter;
  ['todos', 'Montagem', 'Desmontagem'].forEach(f => {
    const btn = document.getElementById('homeFilter_' + f);
    if (btn) {
      if (f.toLowerCase() === filter.toLowerCase()) {
        btn.className = 'text-xs font-bold px-3 py-2 rounded-xl bg-slate-900 text-white shadow-sm transition';
      } else {
        btn.className = 'text-xs font-bold px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition';
      }
    }
  });
  filterHomeDatabase();
}

function filterHomeDatabase() {
  const input = document.getElementById('homeDbSearchInput');
  const q = input ? input.value.toLowerCase().trim() : '';
  renderHomeDatabase(q);
}

function renderHomeDatabase(query = '') {
  const container = document.getElementById('homeDbListContainer');
  const countBadge = document.getElementById('homeDbBadgeCount');
  if (!container) return;

  let filtrados = homeDbAttendances || [];

  if (homeDbFilter && homeDbFilter !== 'todos') {
    filtrados = filtrados.filter(a => (a.tipoServico || '').toLowerCase() === homeDbFilter.toLowerCase());
  }

  if (query) {
    filtrados = filtrados.filter(a =>
      (a.clienteNome && a.clienteNome.toLowerCase().includes(query)) ||
      (a.idAtendimento && a.idAtendimento.toLowerCase().includes(query)) ||
      (a.equipamentoSerie && a.equipamentoSerie.toLowerCase().includes(query)) ||
      (a.clienteCidadeUf && a.clienteCidadeUf.toLowerCase().includes(query)) ||
      (a.tipoServico && a.tipoServico.toLowerCase().includes(query)) ||
      (a.clienteContato && a.clienteContato.toLowerCase().includes(query))
    );
  }

  if (countBadge) {
    countBadge.textContent = `${filtrados.length} Registro${filtrados.length !== 1 ? 's' : ''}`;
  }

  if (filtrados.length === 0) {
    container.innerHTML = `
      <div class="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500">
        <i class="fa-solid fa-folder-open text-2xl text-slate-300 mb-2"></i>
        <p class="text-xs font-semibold">Nenhum atendimento encontrado para esta busca.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  filtrados.forEach(item => {
    const isDesm = (item.tipoServico || '').toLowerCase().includes('desmont');
    const badgeServico = isDesm
      ? `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">📦 Desmontagem</span>`
      : `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">🔧 Montagem</span>`;

    const osId = item.idAtendimento || item.id || '';
    const dataFmt = item.dataAtendimento || (item.dataCriacao ? item.dataCriacao.slice(0, 10) : '-');

    const card = document.createElement('div');
    card.className = 'bg-white hover:bg-slate-50/80 border border-slate-200 rounded-2xl p-4 shadow-sm transition flex flex-col md:flex-row md:items-center justify-between gap-4';
    card.innerHTML = `
      <div class="space-y-1">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-sm font-bold text-slate-900">${item.clienteNome || 'Cliente Não Informado'}</span>
          ${badgeServico}
          <span class="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">OS #${osId}</span>
        </div>
        <div class="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
          <span><i class="fa-solid fa-gear text-slate-400 mr-1"></i><b>${item.equipamentoModelo || 'PaX-i'}</b> (S/N: ${item.equipamentoSerie || 'Sem Série'})</span>
          <span>&bull;</span>
          <span><i class="fa-solid fa-location-dot text-slate-400 mr-1"></i>${item.clienteCidadeUf || 'Cidade não inf.'}</span>
          <span>&bull;</span>
          <span><i class="fa-regular fa-calendar text-slate-400 mr-1"></i>${dataFmt}</span>
          ${item.clienteContato ? `<span>&bull;</span><span><i class="fa-regular fa-user text-slate-400 mr-1"></i>${item.clienteContato}</span>` : ''}
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <a href="/workflow/os_${osId}" class="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm">
          <i class="fa-solid fa-up-right-from-square text-[10px]"></i>
          <span>Abrir</span>
        </a>
        <a href="/pdf-preview/os_${osId}" target="_blank" class="text-xs bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm">
          <i class="fa-solid fa-print text-[10px]"></i>
          <span>Dossiê PDF</span>
        </a>
        <button onclick="deleteHomeAttendance('${osId}', '${encodeURIComponent(item.clienteNome || '')}')" class="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition" title="Excluir">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

async function deleteHomeAttendance(osId, cliNomeEncoded) {
  const cliNome = decodeURIComponent(cliNomeEncoded || '');
  if (!confirm(`Deseja realmente excluir o atendimento de "${cliNome}" (OS #${osId}) do banco de dados?`)) return;

  try {
    const res = await fetch(`/api/attendance/${osId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      loadHomeDatabase();
    } else {
      alert('Erro ao excluir: ' + data.error);
    }
  } catch (err) {
    alert('Erro ao excluir: ' + err.message);
  }
}

// Auto-load database on startup
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    loadHomeDatabase();
  });
}
