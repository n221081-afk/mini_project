// ...existing code...
/**
 * Rename .jsx -> .js and update references across the workspace.
 *
 * Usage:
 *   node scripts/convert-jsx-to-js.js --root . --dry-run
 *   node scripts/convert-jsx-to-js.js --root .           # actually apply
 *
 * Notes:
 * - Commit or backup your repo before running (git commit or copy).
 * - Review --dry-run output before running without --dry-run.
 */
const fs = require('fs').promises;
const path = require('path');

const args = process.argv.slice(2);
const rootArgIndex = args.indexOf('--root');
const root = rootArgIndex !== -1 ? path.resolve(args[rootArgIndex + 1]) : process.cwd();
const dryRun = args.includes('--dry-run');

const IGNORE_DIRS = new Set(['node_modules', '.git']);
const TEXT_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.md', '.mjs', '.cjs']);

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (IGNORE_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walk(full)));
    } else {
      out.push(full);
    }
  }
  return out;
}

function replaceJsxExtsInText(text) {
  // Replace explicit ".jsx" in imports/require/dynamic imports and common references with ".js"
  // Handles: import x from './Foo.jsx'; require('./Foo.jsx'); "Foo.jsx", './Foo.jsx?param'
  // Also replace regex-like /\.jsx$/ -> /\.jsx?$/ to allow .js too in configs.
  let s = text.replace(/(['"`])((?:\.\.\/|\.\/)?[A-Za-z0-9_\/\.-]+)\.jsx(\b|['"`\)\s;:,?\\])/g, (m, q, p, tail) => {
    return `${q}${p}.js${tail}`;
  });

  // Replace occurrences like /\.jsx$/ -> /\.jsx?$/
  s = s.replace(/\\\/\.jsx\\\$\//g, '\\/.jsx?\\/$'); // rarely matched, but keep
  s = s.replace(/\/\\?\.jsx\\?\$\//g, '/.jsx?$/'); // best-effort normalizations

  // Replace simple /\.jsx$/ occurrences
  s = s.replace(/\\\/\.jsx\\\$\//g, '/.jsx?$/');
  s = s.replace(/\/\.jsx\$/g, '/.jsx?');

  // Replace explicit ".jsx" strings in configs/plugin options to ".js"
  s = s.replace(/\.jsx(["'\)\s;,:}])/g, '.js$1');

  return s;
}

async function updateConfigs(filePath, dryRun) {
  // Heuristics for webpack/vite/tsconfig
  const name = path.basename(filePath).toLowerCase();
  let content = await fs.readFile(filePath, 'utf8');
  let updated = content;

  // webpack: make /\.jsx$/ => /\.jsx?$/ and update resolve.extensions arrays
  if (name.includes('webpack') || name.includes('vite') || name === 'rollup.config.js') {
    updated = updated.replace(/\/\\?\.jsx\\?\/\$\?/g, '/.jsx?/');
    updated = updated.replace(/\/\.jsx\$/g, '/.jsx?'); // best effort
    // Replace explicit '.jsx' extension in arrays like extensions: ['.js', '.jsx']
    updated = updated.replace(/(\bextensions\s*:\s*\[)([^\]]+)\]/g, (m, p1, inner) => {
      let parts = inner.split(',').map(s => s.trim().replace(/['"]/g, ''));
      // ensure '.js' present, remove '.jsx' (we will rename files)
      if (!parts.includes('.js')) parts.unshift('.js');
      parts = parts.filter(x => x !== '.jsx');
      const joined = parts.map(x => `'${x}'`).join(', ');
      return `${p1}${joined}]`;
    });
  }

  // tsconfig.json tweaks
  if (path.basename(filePath).toLowerCase() === 'tsconfig.json') {
    try {
      const json = JSON.parse(content);
      let changed = false;
      if (json.compilerOptions) {
        if (json.compilerOptions.allowJs !== true) {
          json.compilerOptions.allowJs = true;
          changed = true;
        }
        // keep existing jsx setting; ensure .js files allowed to contain JSX via "jsx": "react-jsx" etc.
        if (!('jsx' in json.compilerOptions)) {
          // do not force a value; leave alone if not present.
        }
      }
      if (json.include) {
        const inc = JSON.stringify(json.include);
        if (inc.includes('*.jsx') || inc.includes('**/*.jsx')) {
          json.include = json.include.map(i => i.replace(/\.jsx/g, '.js'));
          changed = true;
        }
      }
      if (changed) updated = JSON.stringify(json, null, 2);
    } catch (e) {
      // not a JSON file or parse failed — leave unchanged
    }
  }

  if (updated !== content) {
    console.log(`${dryRun ? '[DRY] Update config' : 'Update config'}: ${filePath}`);
    if (!dryRun) {
      await fs.writeFile(filePath, updated, 'utf8');
    }
  }
}

async function main() {
  console.log(`Scanning ${root} (dryRun=${dryRun})`);
  const all = await walk(root);

  const jsxFiles = all.filter(f => f.endsWith('.jsx'));
  if (jsxFiles.length === 0) {
    console.log('No .jsx files found.');
  } else {
    for (const oldPath of jsxFiles) {
      const newPath = oldPath.replace(/\.jsx$/, '.js');
      console.log(`${dryRun ? '[DRY] Rename' : 'Rename'}: ${oldPath} -> ${newPath}`);
      if (!dryRun) {
        // skip if target exists
        try {
          await fs.access(newPath);
          console.warn(`Target exists, skipping rename: ${newPath}`);
        } catch {
          await fs.rename(oldPath, newPath);
        }
      }
    }
  }

  // Update text references
  const afterWalk = await walk(root);
  for (const file of afterWalk) {
    const ext = path.extname(file).toLowerCase();
    if (!TEXT_EXTS.has(ext)) continue;
    let content;
    try {
      content = await fs.readFile(file, 'utf8');
    } catch {
      continue;
    }
    const updated = replaceJsxExtsInText(content);
    if (updated !== content) {
      console.log(`${dryRun ? '[DRY] Update refs' : 'Update refs'}: ${file}`);
      if (!dryRun) {
        await fs.writeFile(file, updated, 'utf8');
      }
    }
  }

  // Update common config files heuristically
  const candidates = afterWalk.filter(p => {
    const b = path.basename(p).toLowerCase();
    return b === 'webpack.config.js' || b === 'vite.config.js' || b === 'rollup.config.js' || b === 'tsconfig.json' || b === 'babel.config.js' || b === '.babelrc' || b === '.eslintrc.js';
  });
  for (const c of candidates) {
    try {
      await updateConfigs(c, dryRun);
    } catch (err) {
      console.warn('Failed to update config', c, err.message);
    }
  }

  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
// ...existing code...