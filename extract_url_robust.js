const fs = require('fs');
const content = fs.readFileSync('cf_final_final.txt', 'utf8');
const lines = content.split('\n');
let tunnelUrl = '';
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Your quick Tunnel has been created!')) {
        // The URL is usually a few lines down, often split across 2-3 lines
        // We look for parts that contain .trycloudflare.com
        let candidates = [];
        for (let j = 1; j < 10; j++) {
            if (lines[i + j] && lines[i + j].includes('|')) {
                let part = lines[i + j].split('|')[1].trim();
                if (part) candidates.push(part);
            }
        }
        tunnelUrl = candidates.join('').split(' ').join('');
        break;
    }
}
console.log('TUNNEL_URL:', tunnelUrl);
