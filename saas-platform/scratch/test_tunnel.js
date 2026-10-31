async function checkTunnel() {
  try {
    const url = 'https://eight-reprints-labour-filtering.trycloudflare.com/';
    const res = await fetch(url);
    console.log('Tunnel Status:', res.status, res.statusText);
    const text = await res.text();
    console.log('Tunnel HTML length:', text.length);
    console.log('Has Studio title:', text.includes('DocToField') || text.includes('Vatech'));
  } catch (err) {
    console.error('Tunnel check error:', err);
  }
}

checkTunnel();
