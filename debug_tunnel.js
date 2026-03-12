const { spawn } = require('child_process');
const fs = require('fs');

const tunnel = spawn('npx', ['cloudflared', 'tunnel', '--url', 'http://localhost:3000', '--no-autoupdate'], {
    shell: true
});

tunnel.stdout.on('data', (data) => {
    fs.appendFileSync('tunnel_debug.log', data.toString());
});

tunnel.stderr.on('data', (data) => {
    fs.appendFileSync('tunnel_debug.log', data.toString());
});

setTimeout(() => {
    process.exit(0);
}, 20000);
