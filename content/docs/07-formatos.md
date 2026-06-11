---
sidebar_position: 7
title: Formatos y exportación
---

# Formatos y exportación

> Contenido pendiente de redactar.

## Facturae

Versiones 3.2 / 3.2.1 / 3.2.2 con firma XAdES. Solo facturas en estado `ISSUED` o `SENT`.

`GET /api/v1.1/issued-invoices/{invoice_id}/export?format=facturae_3_2_2`

## UBL 2.1

EN 16931 / PEPPOL BIS 3.0. Modos de validación: `off` / `warn` / `strict`.

`GET /api/v1.1/issued-invoices/{invoice_id}/export?format=ubl_2_1`

## PDF

Con QR VeriFactu incrustado.

`GET /api/v1.1/issued-invoices/{invoice_id}/pdf`
