#!/usr/bin/env node
// Descarga el openapi.json de la API, expone solo la fachada publica v1.1
// y guarda el resultado en static/openapi.json.
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const API_BASE = process.env.API_BASE ?? 'http://127.0.0.1:8000';
const PUBLIC_PREFIX = '/api/v1.1';
const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'static', 'openapi.json');

function isPublicV11Path(path) {
  return path === PUBLIC_PREFIX || path.startsWith(`${PUBLIC_PREFIX}/`);
}

function isPublicOperation(operation) {
  return (operation.tags ?? []).some(
    tag => typeof tag === 'string' && tag.startsWith('public:'),
  );
}

function withoutInternalSecurity(operation) {
  if (!operation.security) return operation;

  const security = operation.security
    .map(entry => {
      const copy = { ...entry };
      delete copy.HTTPBearer;
      return copy;
    })
    .filter(entry => Object.keys(entry).length > 0);

  return { ...operation, security };
}

function filterSpec(spec) {
  const filteredPaths = {};

  for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
    if (!isPublicV11Path(path)) continue;

    const filteredMethods = {};
    for (const [method, operation] of Object.entries(pathItem)) {
      if (method === 'parameters') {
        filteredMethods[method] = operation;
        continue;
      }
      if (isPublicOperation(operation)) {
        filteredMethods[method] = withoutInternalSecurity(operation);
      }
    }

    const hasMethods = Object.keys(filteredMethods).some(key => key !== 'parameters');
    if (hasMethods) filteredPaths[path] = filteredMethods;
  }

  const filteredTags = (spec.tags ?? []).filter(
    tag => typeof tag.name === 'string' && tag.name.startsWith('public:'),
  );

  const securitySchemes = { ...((spec.components ?? {}).securitySchemes ?? {}) };
  delete securitySchemes.HTTPBearer;
  const components = { ...(spec.components ?? {}), securitySchemes };

  const security = (spec.security ?? [])
    .map(entry => {
      const copy = { ...entry };
      delete copy.HTTPBearer;
      return copy;
    })
    .filter(entry => Object.keys(entry).length > 0);

  const servers = [
    { url: 'https://api.facturas.app', description: 'Produccion' },
    { url: 'https://sandbox.api.facturas.app', description: 'Sandbox' },
  ];

  return {
    ...spec,
    info: { ...(spec.info ?? {}), title: 'Facturas API v1.1', version: '1.1' },
    servers,
    paths: filteredPaths,
    tags: filteredTags,
    components,
    security,
  };
}

const res = await fetch(`${API_BASE}/openapi.json`);
if (!res.ok) throw new Error(`HTTP ${res.status} al obtener ${API_BASE}/openapi.json`);

const raw = await res.json();
const filtered = filterSpec(raw);

const pathCount = Object.keys(filtered.paths).length;
const rawCount = Object.keys(raw.paths ?? {}).length;
writeFileSync(outPath, JSON.stringify(filtered, null, 2));
console.log(`openapi.json actualizado desde ${API_BASE} -> static/openapi.json`);
console.log(`Paths: ${rawCount} totales -> ${pathCount} publicos v1.1`);
