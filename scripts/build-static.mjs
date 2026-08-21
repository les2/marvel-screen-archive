import { build } from 'esbuild';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const output = resolve(root, 'dist/angular/browser');
rmSync(output, { recursive:true, force:true }); mkdirSync(output, { recursive:true });
await build({ entryPoints:[resolve(root,'out-tsc/app/main.js')], outfile:resolve(output,'main.js'), bundle:true, minify:true, format:'esm', target:'es2022', legalComments:'none' });
const cssInput = readFileSync(resolve(root,'src/styles.css'),'utf8');
const css = await postcss([tailwindcss()]).process(cssInput,{from:resolve(root,'src/styles.css'),to:resolve(output,'styles.css')});
writeFileSync(resolve(output,'styles.css'),css.css);
cpSync(resolve(root,'public'),output,{recursive:true});
let html = readFileSync(resolve(root,'src/index.html'),'utf8');
html = html.replace('</head>','  <link rel="stylesheet" href="styles.css">\n</head>').replace('</body>','<script type="module" src="main.js"></script></body>');
writeFileSync(resolve(output,'index.html'),html);
