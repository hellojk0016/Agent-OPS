const fs = require('fs');
const content = fs.readFileSync('cf_final_final.txt', 'utf8');
const lines = content.split('\n');
let url = '';
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('https://')) {
        url = lines[i].trim().split('|').pop().trim() +
            lines[i + 1].trim().split('|').pop().trim() +
            lines[i + 2].trim().split('|').pop().trim();
        break;
    }
}
console.log('FINAL_URL:', url.replace(/\s+/g, ''));
