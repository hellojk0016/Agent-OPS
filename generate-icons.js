const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const src = path.join(__dirname, 'public', 'images', 'ops-logo.png');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
    for (const s of sizes) {
        const out = path.join(__dirname, 'public', `icon-${s}x${s}.png`);
        await sharp(src)
            .resize(s, s, { fit: 'contain', background: { r: 9, g: 9, b: 11, alpha: 1 } })
            .toFile(out);
        console.log(`Generated ${out}`);
    }
    console.log('All PWA icons generated!');
}

generate().catch(console.error);
