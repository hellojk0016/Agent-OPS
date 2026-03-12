
const { spawn } = require('child_process');
const fs = require('fs');

const tunnel = spawn('npx', ['cloudflared', 'tunnel', '--url', 'http://localhost:3000', '--no-autoupdate'], {
    shell: true
});

let urlFound = false;

tunnel.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match && !urlFound) {
        fs.writeFileSync('v_url.txt', match[0]);
        urlFound = true;
    }
});

tunnel.stderr.on('data', (data) => {
    const output = data.toString();
    console.error(output);
    const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match && !urlFound) {
        fs.writeFileSync('v_url.txt', match[0]);
        urlFound = true;
    }
});

setTimeout(() => {
    if (!urlFound) {
        console.log('Timeout waiting for URL');
    }
    // We don't kill the tunnel, let it run in background if needed
    // process.exit(0); 
}, 15000);
