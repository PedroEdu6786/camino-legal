import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks, createRequire } from 'node:module';
import ts from 'typescript';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The Node test runner strips types but does not compile JSX or CSS modules.
const hook = registerHooks({ load(url, context, next) {
  if (url.endsWith('.module.css')) return { shortCircuit: true, format: 'commonjs', source: 'exports.default = {}' };
  if (!url.endsWith('.tsx')) return next(url, context);
  return { shortCircuit: true, format: 'commonjs', source: ts.transpile(readFileSync(fileURLToPath(url), 'utf8'), { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS }) };
} });
const require = createRequire(import.meta.url);
test('calculator table distinguishes observed sessions, no selections and unavailable data', () => {
  try {
    const Table = require('../app/components/dashboard/ServiceInterestTable.tsx').default;
    const render = rows => renderToStaticMarkup(createElement(Table, { rows }));
    const full = render([{ label: 'Registro de marca', sessions: 3 }, { label: 'Consultoría legal', sessions: 2 }]);
    assert.match(full, /<th[^>]*>Sesiones<\/th>/); assert.match(full, /Registro de marca<\/th><td>3<\/td>/); assert.doesNotMatch(full, /<td>5<\/td>/);
    assert.match(render([]), /No se observaron selecciones/);
    assert.match(render(null), /No disponible/); assert.doesNotMatch(render(null), /No se observaron|<td>0/);
  } finally { hook.deregister(); }
});
