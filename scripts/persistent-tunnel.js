const { spawn } = require('child_process');

const port = 3000;
const restartDelay = 5000;

function startTunnel() {
    console.log(`[${new Date().toLocaleTimeString()}] Starting tunnel on port ${port}...`);

    // On Windows, we need to use shell: true for npx
    const tunnel = spawn('npx', ['-y', 'localtunnel', '--port', port.toString()], {
        shell: true,
        stdio: 'inherit'
    });

    tunnel.on('close', (code) => {
        console.error(`[${new Date().toLocaleTimeString()}] Tunnel crashed with code ${code}. Restarting in ${restartDelay / 1000}s...`);
        setTimeout(startTunnel, restartDelay);
    });

    tunnel.on('error', (err) => {
        console.error(`[${new Date().toLocaleTimeString()}] Error starting tunnel:`, err.message);
    });
}

console.log('--- Agent OPS Persistent Tunnel Manager (JS) ---');
startTunnel();
