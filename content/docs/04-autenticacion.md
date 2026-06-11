---
sidebar_position: 4
title: Autenticación y seguridad
---

# Autenticación y seguridad

> Contenido pendiente de redactar.

## API keys

Alta, rotación y revocación desde el panel. Header: `X-API-Key`. Formato: `ak_<kid>:<secret>`. Hash HMAC-SHA256 en servidor.

## Rate limiting

Ventana de 60 s. Límite según plan. Cabeceras de respuesta: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`. Código en exceso: `429`.

## IP allowlist

Restricción por IP por clave.

## Multi-tenancy

Aislamiento por empresa (`company_public_id` en la ruta). Acceso a empresa ajena devuelve `403`.

## Buenas prácticas

- No exponer la clave en el código fuente.
- Una clave por integración/entorno.
- Rotar periódicamente.
