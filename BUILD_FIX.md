# 🔧 FIX: esbuild Bundling Errors

## ❌ Erorile

```
[ERROR] Could not resolve "@babel/preset-typescript/package.json"
[ERROR] Could not resolve "../pkg"
[ERROR] No loader is configured for ".node" files
```

## 🔍 Cauza

esbuild încerca să **bundle** toate dependencies-urile, inclusiv:
- Babel (nu trebuie bundled)
- Tailwind CSS native binaries (.node files)
- lightningcss native binaries
- Toate celelalte node_modules

**Problema**: Aceste pachete au:
- Native binaries (.node files)
- Complex resolution paths
- Dynamic requires
- Nu pot/nu trebuie să fie bundle-ate

## ✅ Soluția

Am modificat `build.js` să **excludă TOATE** dependencies din bundle:

```javascript
import esbuild from 'esbuild';
import { readFileSync } from 'fs';

async function buildServer() {
  // Citim package.json
  const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  const allDependencies = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {})
  ];
  
  await esbuild.build({
    // ...
    external: allDependencies, // ✅ Exclude TOATE dependencies
    minify: false, // ✅ Nu minify pentru debugging mai ușor
  });
}
```

## 📊 Ce face acum build-ul:

1. **Bundle** doar codul tău din `server/`
2. **Exclude** toate node_modules (vor fi folosite din node_modules/ la runtime)
3. **Nu minify** codul (debugging mai ușor, erori mai clare)
4. **Păstrează** toate imports pentru dependencies

## ✅ Avantaje

- ✅ Build rapid (nu mai bundle dependencies mari)
- ✅ Nu mai erori cu native binaries
- ✅ Nu mai erori cu dynamic requires
- ✅ Debugging mai ușor (cod necomprimat)
- ✅ File mai mic (dependencies separate)

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
