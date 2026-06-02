#!/usr/bin/env node
// Descarga el openapi.json de la API, filtra tags internos y guarda en static/openapi.json
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const API_BASE = process.env.API_BASE ?? 'http://127.0.0.1:8000';
const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'static', 'openapi.json');

// Únicos tags que aparecen en la referencia pública
const ALLOWED_TAGS = new Set([
  'invoices',
  'invoices-batch',
  'invoices-bulk-issue',
  'invoices-bulk-send',
  'invoices-send',
  'Invoices FacturaE',
  'Invoices UBL',
  'Invoices PDF',
  'Invoice Documents',
  'Invoice Events',
  'invoice-series',
  'sii',
  'verifactu',
  'companies',
]);

// Tags de companies que se exponen (solo lectura — no CRUD completo)
const COMPANIES_ALLOWED_OPERATION_IDS = null; // null = todos los de companies por ahora

function filterSpec(spec) {
  // 1. Filtrar paths: solo los que tengan al menos una operación con tag permitido
  const filteredPaths = {};
  for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
    const filteredMethods = {};
    for (const [method, operation] of Object.entries(pathItem)) {
      if (method === 'parameters') { filteredMethods[method] = operation; continue; }
      const tags = operation.tags ?? [];
      // Para companies: solo lectura
      if (tags.includes('companies')) {
        if (method !== 'get') continue;
      }
      // Para invoice-series: solo lectura
      if (tags.includes('invoice-series')) {
        if (method !== 'get') continue;
      }
      if (tags.some(t => ALLOWED_TAGS.has(t))) {
        filteredMethods[method] = operation;
      }
    }
    // Solo incluir el path si quedó algún método real
    const hasMethods = Object.keys(filteredMethods).some(k => k !== 'parameters');
    if (hasMethods) filteredPaths[path] = filteredMethods;
  }

  // 2. Filtrar la lista de tags del spec raíz
  const filteredTags = (spec.tags ?? []).filter(t => ALLOWED_TAGS.has(t.name));

  // 3. Eliminar HTTPBearer de securitySchemes
  const securitySchemes = { ...((spec.components ?? {}).securitySchemes ?? {}) };
  delete securitySchemes.HTTPBearer;
  const components = { ...(spec.components ?? {}), securitySchemes };

  // 4. Eliminar HTTPBearer de security de cada operación
  for (const pathItem of Object.values(filteredPaths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (method === 'parameters' || !operation.security) continue;
      operation.security = operation.security
        .map(s => { const c = { ...s }; delete c.HTTPBearer; return c; })
        .filter(s => Object.keys(s).length > 0);
    }
  }

  // 5. Eliminar HTTPBearer del security global si existe
  const globalSecurity = (spec.security ?? [])
    .map(s => { const c = { ...s }; delete c.HTTPBearer; return c; })
    .filter(s => Object.keys(s).length > 0);

  const servers = [
    { url: 'https://api.facturas.app', description: 'Producción' },
    { url: 'https://sandbox.api.facturas.app', description: 'Sandbox' },
  ];

  return { ...spec, servers, paths: filteredPaths, tags: filteredTags, components, security: globalSecurity };
}

const res = await fetch(`${API_BASE}/openapi.json`);
if (!res.ok) throw new Error(`HTTP ${res.status} al obtener ${API_BASE}/openapi.json`);

const raw = await res.json();
const filtered = filterSpec(raw);

const pathCount = Object.keys(filtered.paths).length;
const rawCount = Object.keys(raw.paths ?? {}).length;
writeFileSync(outPath, JSON.stringify(filtered, null, 2));
console.log(`openapi.json actualizado desde ${API_BASE} → static/openapi.json`);
console.log(`Paths: ${rawCount} totales → ${pathCount} públicos`);
