const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    const filePath = path.join(__dirname, '..', '..', 'Solicitação de instalaçãoPaX-i 047-024913.pdf');
    const fileBuf = fs.readFileSync(filePath);
    const fileBlob = new Blob([fileBuf], { type: 'application/pdf' });

    const form = new FormData();
    form.append('documents', fileBlob, 'Solicitação de instalaçãoPaX-i 047-024913.pdf');

    const res = await fetch('http://localhost:3000/api/convert-document', {
      method: 'POST',
      body: form
    });

    const data = await res.json();
    console.log('Upload Response success:', data.success);
    console.log('Batch ID:', data.batchId);
    console.log('Workflow URL:', data.workflowUrl);
    console.log('Attendance Client:', data.attendanceData.cliente.razaoSocial);
    console.log('Attendance Equipment:', data.attendanceData.equipamento.modelo, data.attendanceData.equipamento.nSerie);

    const wfRes = await fetch('http://localhost:3000' + data.workflowUrl);
    const html = await wfRes.text();
    console.log('Workflow HTML length:', html.length);
    console.log('Has 61 items:', html.includes('q61'));
    console.log('Has 16 clauses:', html.includes('• A garantia no equipamento será prestada'));
    console.log('Has Ez3D-i:', html.includes('fb_q3b_3dpan'));
  } catch (err) {
    console.error('Upload test error:', err);
  }
}

testUpload();
