const fs = require('fs');
const content = fs.readFileSync('cf_dev_run.txt', 'utf8');
const match = content.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
if (match) {
    console.log(match[0]);
} else {
    // try to find it in the "it may take some time" block
    const lines = content.replace(/\r/g, '').split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('reachable):')) {
            let combined = lines.slice(i, i + 5).join('').replace(/\s+/g, '');
            let subMatch = combined.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
            if (subMatch) {
                console.log(subMatch[0]);
                process.exit(0);
            }
        }
    }
    console.log('NOT_FOUND');
}
