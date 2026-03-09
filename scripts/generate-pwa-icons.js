const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const generateIcons = async () => {
    const inputImage = path.join(__dirname, '../public/ops-logo.png');
    const publicDir = path.join(__dirname, '../public');

    // All sizes required by manifest.json + standard favicons
    const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

    for (const size of sizes) {
        const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);

        try {
            await sharp(inputImage)
                .resize({
                    width: size,
                    height: size,
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background for PWA
                })
                .png()
                .toFile(outputPath);

            console.log(`Generated ${size}x${size} icon: ${outputPath}`);
        } catch (error) {
            console.error(`Error generating ${size}x${size} icon:`, error);
        }
    }
};

generateIcons();
