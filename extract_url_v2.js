const fs = require('fs');
const content = fs.readFileSync('cf_final_final.txt', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('created! Visit it at') || lines[i].includes('reachable):')) {
        let block = lines.slice(i, i + 10).join('');
        let match = block.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
        if (match) {
            console.log(match[0]);
            process.exit(0);
        }
    }
}
// Fallback: search anywhere
const match = content.replace(/\s+/g, '').match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
if (match) console.log(match[0]);
else console.log('NOT_FOUND');
