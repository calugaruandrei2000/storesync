import esbuild from 'esbuild';
import { readFileSync } from 'fs';

async function buildServer() {
  try {
    console.log('🔨 Building server...');
    
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    const allDependencies = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
      'module', 'url', 'path', 'fs', 'path'  // ✅ Externalize BUILT-IN Node modules
    ];
    
    await esbuild.build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: 'dist/server.js',
      external: allDependencies,  // ✅ NO banner! Esbuild NU adaugă imports duplicate
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
