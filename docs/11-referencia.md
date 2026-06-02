---
sidebar_position: 11
title: Referencia de la API
---

# Referencia de la API

La referencia completa se genera automáticamente del `openapi.json`.

👉 **[Ver referencia interactiva →](/api-reference)**

## Convenciones

- **Paginación:** parámetros `page` y `page_size`. La respuesta incluye `total`, `page` y `pages`.
- **Fechas:** formato ISO 8601 (`YYYY-MM-DD`).
- **Moneda:** importes en la moneda indicada en `header.currency` (por defecto `EUR`).
- **Filtros:** parámetros de query por estado, fecha, serie, etc.

## Códigos de error HTTP

| Código | Significado |
|---|---|
| 400 | Petición malformada |
| 401 | Sin autenticación |
| 402 | Límite de plan superado |
| 403 | Sin acceso a este recurso |
| 404 | Recurso no encontrado |
| 409 | Conflicto (ej. número duplicado) |
| 422 | Error de validación de dominio |
| 429 | Rate limit superado |
