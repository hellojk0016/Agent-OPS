const fs = require('fs');
const content = fs.readFileSync('cf_final_final.txt', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Your quick Tunnel has been created') || lines[i].includes('Visit it at')) {
        for (let j = 1; j < 10; j++) {
            if (lines[i + j]) console.log(lines[i + j].trim());
        }
    }
}
const urlMatch = content.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
if (urlMatch) console.log('REGEX_MATCH:', urlMatch[0]);
else console.log('REGEX_MATCH: NOT FOUND');
