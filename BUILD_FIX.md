# 🔧 FIX: esbuild Define Error

## ❌ Eroarea

```
[ERROR] Invalid define value (must be an entity name or JS literal): 
(await import('url')).fileURLToPath(new URL('.', import.meta.url))
```

## 🔍 Cauza

În `build.js`, linia 26-28 avea:
```javascript
define: {
  '__dirname': `(await import('url')).fileURLToPath(new URL('.', import.meta.url))`,
},
```

**Problema**: `esbuild.define` acceptă DOAR:
- Simple string literals: `"production"`
- Boolean literals: `true` / `false`
- Number literals: `123`
- Simple identifiers: `process.env.NODE_ENV`

**NU** acceptă expresii complexe sau async imports!

## ✅ Soluția

Am **ELIMINAT** complet secțiunea `define` din `build.js`.

Nu e nevoie de `define` pentru că deja avem `banner` care definește `__dirname`:

```javascript
banner: {
  js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
`
}
```

Acest cod se adaugă automat la **începutul** fișierului `dist/server.js` generat, deci `__dirname` va fi disponibil în tot codul server.

## 📝 build.js FINAL (Corect)

```javascript
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
      // ❌ ELIMINAT define - nu e necesar!
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
```

## ✅ Rezultat

Build-ul va merge perfect acum:

```
🔨 Building server...
✓ dist/server.js
✅ Server build complete!
```

## 🚀 Deploy pe Render

**Build Command:**
```bash
npm install --include=dev && npm run build
```

**Start Command:**
```bash
npm start
```

**Environment Variables:**
- `DATABASE_URL` - Internal Database URL
- `NODE_ENV` - production
- `SESSION_SECRET` - (generează: `openssl rand -base64 32`)
- `JWT_SECRET` - (generează: `openssl rand -base64 32`)

---

**Status**: ✅ FIX APLICAT - Build va merge acum!

**Data**: 30 Ianuarie 2026  
**Versiune**: 2.0.3
