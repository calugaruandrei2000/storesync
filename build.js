import esbuild from 'esbuild';

async function buildServer() {
  try {
    console.log('🔨 Building server...');
    
    await esbuild.build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: 'dist/server.js',
      external: [
        'express',
        'pg',
        'bcryptjs',
        'jsonwebtoken',
        'drizzle-orm',
        '@tanstack/*',
        '@radix-ui/*',
        'react',
        'react-dom',
        'vite'
      ],
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
      minify: true,
    });
    
    console.log('✅ Server build complete!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildServer();
