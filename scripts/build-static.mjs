import { build } from 'esbuild';
import { transformAsync } from '@babel/core';
import angularLinkerPlugin from '@angular/compiler-cli/linker/babel';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const output = resolve(root, 'dist/angular/browser');
rmSync(output, { recursive:true, force:true }); mkdirSync(output, { recursive:true });
let linkedAngularFiles = 0;
const angularLinker = {
  name:'angular-linker',
  setup(esbuild) {
    esbuild.onLoad({filter:/\.m?js$/}, async ({path}) => {
      if (!path.includes('/node_modules/@angular/')) return null;
      const source = readFileSync(path,'utf8');
      if (!source.includes('ɵɵngDeclare')) return null;
      linkedAngularFiles += 1;
      const linked = await transformAsync(source, {
        filename:path,
        babelrc:false,
        configFile:false,
        compact:false,
        sourceMaps:false,
        plugins:[[angularLinkerPlugin,{linkerJitMode:false}]]
      });
      return {contents:linked?.code ?? source,loader:'js'};
    });
  }
};
const mainPath = resolve(output,'main.js');
await build({ entryPoints:[resolve(root,'out-tsc/app/main.js')], outfile:mainPath, bundle:true, minify:true, format:'esm', target:'es2022', legalComments:'none', plugins:[angularLinker] });
if (linkedAngularFiles === 0 || readFileSync(mainPath,'utf8').includes('ɵɵngDeclare')) throw new Error('Angular linker did not fully process the production bundle.');
const mainHash = createHash('sha256').update(readFileSync(mainPath)).digest('hex').slice(0,12);
const mainFile = `main-${mainHash}.js`;
renameSync(mainPath,resolve(output,mainFile));
const cssInput = readFileSync(resolve(root,'src/styles.css'),'utf8');
const css = await postcss([tailwindcss()]).process(cssInput,{from:resolve(root,'src/styles.css'),to:resolve(output,'styles.css')});
const stylesHash = createHash('sha256').update(css.css).digest('hex').slice(0,12);
const stylesFile = `styles-${stylesHash}.css`;
writeFileSync(resolve(output,stylesFile),css.css);
cpSync(resolve(root,'public'),output,{recursive:true});
let html = readFileSync(resolve(root,'src/index.html'),'utf8');
html = html.replace('</head>',`  <link rel="stylesheet" href="/${stylesFile}">\n</head>`).replace('</body>',`<script type="module" src="/${mainFile}"></script></body>`);
writeFileSync(resolve(output,'index.html'),html);
const swPath = resolve(output,'sw.js');
const sw = readFileSync(swPath,'utf8').replace('__MAIN_ASSET__',`/${mainFile}`).replace('__STYLE_ASSET__',`/${stylesFile}`);
writeFileSync(swPath,sw);
