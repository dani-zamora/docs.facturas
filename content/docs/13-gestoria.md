---
sidebar_position: 13
title: Integración para gestorías y software vendors
---

# Integración para gestorías y software vendors

> Contenido pendiente de redactar.

## Modelo multi-empresa

Un tenant gestiona N empresas. En v1.1 puedes consultar las empresas accesibles con `GET /api/v1.1/companies`.

## Aprovisionamiento automático

Alta de empresas en cartera vía API, con pricing estándar o pactado por tenant.

## Cobro centralizado

El tenant recibe una única factura por todas sus empresas.

## Claves por empresa/integración

Patrón recomendado: una API key por empresa gestionada para aislamiento y auditoría.
