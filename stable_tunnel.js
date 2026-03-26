const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'stable_tunnel.log');
const urlFile = path.join(__dirname, 'v_url.txt');

// Clear old logs
fs.writeFileSync(logFile, `--- Tunnel Log Started at ${new Date().toISOString()} ---\n`);

console.log('Starting Cloudflare tunnel...');

const tunnel = spawn('npx', ['cloudflared', 'tunnel', '--url', 'http://localhost:3000', '--no-autoupdate'], {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe']
});

let urlFound = false;

function handleOutput(data) {
    const output = data.toString();
    fs.appendFileSync(logFile, output);
    
    const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match && !urlFound) {
        const url = match[0];
        console.log('\n============================================================');
        console.log('SUCCESS: FRESH HTTPS URL FOUND!');
        console.log(url);
        console.log('============================================================\n');
        fs.writeFileSync(urlFile, url);
        urlFound = true;
    }
}

tunnel.stdout.on('data', handleOutput);
tunnel.stderr.on('data', handleOutput);

tunnel.on('close', (code) => {
    fs.appendFileSync(logFile, `\nTunnel process exited with code ${code}\n`);
    console.log(`Tunnel process exited with code ${code}. Check stable_tunnel.log for details.`);
    process.exit(code);
});

// Timeout for initial URL detection
setTimeout(() => {
    if (!urlFound) {
        console.log('Timeout: No URL found in 30 seconds. Check stable_tunnel.log for possible errors.');
    }
}, 30000);

// Keep the script running
process.stdin.resume();
