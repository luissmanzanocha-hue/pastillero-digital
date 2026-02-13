import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagePath = path.join(__dirname, 'logo_final.png');

try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const outputPath = path.join(__dirname, 'src', 'utils', 'logoBase64.js');
    const fileContent = `export const logoBase64 = "data:image/png;base64,${base64Image}";`;
    fs.writeFileSync(outputPath, fileContent);
    console.log('Successfully created src/utils/logoBase64.js with new image');
} catch (error) {
    console.error('Error processing image:', error);
}
