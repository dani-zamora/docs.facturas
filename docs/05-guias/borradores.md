---
sidebar_position: 1
title: Borradores
---

# Borradores

> Contenido pendiente de redactar.

Crear, validar, editar y emitir borradores de factura.

## Crear un borrador

`POST /api/v1/companies/{id}/invoices/canonical?action=save`

## Validar

`POST /api/v1/companies/{id}/invoices/canonical?action=validate` o `/validate`

## Emitir

`action=issue` / `/issue`

## Eliminar

Solo borradores en estado `DRAFT`.
