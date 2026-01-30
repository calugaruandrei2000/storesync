import esbuild from 'esbuild';
import { readFileSync } from 'fs';

async function buildServer() {
  try {
    console.log('🔨 Building server...');
    
    // Read package.json to get all dependencies
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    const allDependencies = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
      'module', 'url', 'path'  // ✅ Adaugă astea ca external să NU bundle polyfill-urile
    ];
    
    await esbuild.build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: 'dist/server.js',
      external: allDependencies,
      banner: {
        js: `
const { createRequire } = await import('module');
const { fileURLToPath } = await import('url');
const { dirname } = await import('path');

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
`  // ✅ Dinamic imports: evită duplicate + merge pe Node 18+ [web:27][web:33]
      },
      logLevel: 'info',
      minify: false,
    });
    
    console.log('✅ Server build complete!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildServer();
