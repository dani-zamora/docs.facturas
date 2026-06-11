---
sidebar_position: 1
title: Borradores
---

# Borradores

> Contenido pendiente de redactar.

Crear, validar, editar y emitir borradores de factura.

## Crear un borrador

`PUT /api/v1.1/drafts`

## Validar

`POST /api/v1.1/drafts/validate` o `POST /api/v1.1/drafts/{invoice_id}/validate`

## Emitir

`POST /api/v1.1/issued-invoices/{invoice_id}/issue`

## Eliminar

Solo borradores en estado `DRAFT`.
