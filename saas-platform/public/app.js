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
