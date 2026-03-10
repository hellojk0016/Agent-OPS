const fs = require('fs');
try {
    const content = fs.readFileSync('cf_dev.txt', 'utf8');
    const match = content.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match) {
        console.log(match[0]);
    } else {
        console.log('NOT_FOUND');
    }
} catch (e) {
    console.log('FILE_NOT_FOUND');
}
