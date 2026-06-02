#!/usr/bin/env node
// Descarga el openapi.json de la API y lo guarda en static/openapi.json
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const API_BASE = process.env.API_BASE ?? 'http://127.0.0.1:8000';
const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'static', 'openapi.json');

const res = await fetch(`${API_BASE}/openapi.json`);
if (!res.ok) throw new Error(`HTTP ${res.status} al obtener ${API_BASE}/openapi.json`);

const json = await res.json();
writeFileSync(outPath, JSON.stringify(json, null, 2));
console.log(`openapi.json actualizado desde ${API_BASE} → static/openapi.json`);
