import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'src');
const outputFile = path.join(__dirname, 'index.html');

function buildSite() {
    try {
        console.log('🚀 Building website...');
        
        // Read base template
        const baseTemplate = fs.readFileSync(path.join(srcDir, 'base.html'), 'utf8');
        
        // Get all partial files
        const partialsDir = path.join(srcDir, 'partials');
        const partialFiles = fs.readdirSync(partialsDir).filter(file => file.endsWith('.html'));
        
        let assembledHTML = baseTemplate;
        
        // Replace each partial placeholder with actual content
        partialFiles.forEach(file => {
            const componentName = path.basename(file, '.html');
            const placeholder = `<!-- ${componentName.toUpperCase()} -->`;
            const content = fs.readFileSync(path.join(partialsDir, file), 'utf8');
            
            assembledHTML = assembledHTML.replace(placeholder, content);
        });
        
        // Write final index.html
        fs.writeFileSync(outputFile, assembledHTML);
        console.log('✅ Build completed: index.html');
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
    }
}

// Watch mode for development
if (process.argv.includes('--watch')) {
    console.log('👀 Watching for changes...');
    const chokidar = await import('chokidar');
    chokidar.watch([path.join(srcDir, '**/*.html')]).on('change', () => {
        console.log('🔄 Changes detected, rebuilding...');
        buildSite();
    });
} else {
    buildSite();
}