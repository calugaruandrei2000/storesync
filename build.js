import esbuild from 'esbuild';
import { readFileSync } from 'fs';

async function buildServer() {
  try {
    console.log('🔨 Building server...');
    
    // Read package.json to get all dependencies
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    const allDependencies = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {})
    ];
    
    await esbuild.build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: 'dist/server.js',
      // External: ALL dependencies to avoid bundling issues
      external: allDependencies,
      banner: {
        js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
`
      },
      logLevel: 'info',
      minify: false, // Don't minify to make debugging easier
    });
    
    console.log('✅ Server build complete!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildServer();