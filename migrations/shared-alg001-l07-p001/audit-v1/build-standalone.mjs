import {build} from 'esbuild';
import fs from 'node:fs';
const O='output/playwright/alg-l07-p001-standalone-v1';fs.mkdirSync(O,{recursive:true});
await build({entryPoints:['migrations/shared-alg001-l07-p001/audit-v1/standalone.tsx'],bundle:true,format:'esm',jsx:'automatic',outfile:O+'/app.js',define:{'process.env.NODE_ENV':'"development"'},logLevel:'warning'});
fs.writeFileSync(O+'/index.html','<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>L7 introduction local candidate</title><link rel="stylesheet" href="/app.css"><style>@font-face{font-family:"HELP Math Nunito Sans";src:url(/nunito.ttf)}@font-face{font-family:"HELP Math Fredoka";src:url(/fredoka.ttf)}html{font-size:20px}body{margin:0;padding:12px}button,select{font:inherit}</style></head><body><div id="app"></div><script type="module" src="/app.js"></script></body></html>');
console.log(O);
