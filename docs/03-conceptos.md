---
sidebar_position: 3
title: Conceptos fundamentales
---

# Conceptos fundamentales

> Contenido pendiente de redactar.

## Modelo organizativo

Tenant → empresas → plan por empresa.

## Modelo canónico de factura

`schema_version`: `json_1` / `json_1_1`. Secciones: `meta`, `invoice` (supplier, customer, header, issue_data, taxes_outputs, taxes_withheld, totals, lines, payment_details, legal_literals).

## Dirección

- `issued` — facturas emitidas
- `received` — facturas recibidas

## Estados y ciclo de vida

`DRAFT` → `VALIDATED` → `ISSUED` → `SENT` / `CANCELLED`

Recibidas: `RECEIVED` / `HAS_ERRORS`

## Series y numeración

_Próximamente._

## Idempotencia, paginación y filtros

_Próximamente._
