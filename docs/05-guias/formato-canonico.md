---
sidebar_position: 4
title: Formato canónico
---

# Formato canónico (`json_1_1`)

El formato canónico es el contrato de integración de la API. Independientemente del origen de una factura (FacturaE, UBL, Excel, JSON), el sistema la convierte internamente a este formato antes de validarla y persistirla.

Si integras directamente vía API, envías `json_1_1` desde el principio.

## Estructura raíz

```json
{
  "schema_version": "json_1_1",
  "meta": { ... },
  "invoice": { ... }
}
```

| Campo | Obligatorio | Descripción |
|---|---|---|
| `schema_version` | Sí | Siempre `"json_1_1"` |
| `meta` | Sí | Contexto de la integración |
| `invoice` | Sí | Contenido fiscal de la factura |

Campos desconocidos a nivel raíz son rechazados (`additionalProperties: false`).

---

## Modos de ingesta

La API publica v1.1 separa los modos de ingesta por recurso:

| Modo | Cuándo usarlo |
|---|---|
| `PUT /api/v1.1/drafts` | Guardar un borrador. No asigna numero ni fecha. |
| `POST /api/v1.1/issued-invoices/{invoice_id}/issue` | Emitir un borrador. El sistema asigna numero y fecha automaticamente. |
| `POST /api/v1.1/issued-invoices/import` | Registrar una factura ya emitida fuera del sistema. |
| `PUT /api/v1.1/received-invoices` | Insertar o actualizar una factura recibida canonica. |

### Diferencias entre modos

| Aspecto | `save` | `issue` | `import` |
|---|---|---|---|
| `header.invoice_number` en el payload | Prohibido | Prohibido | Obligatorio |
| `issue_data.issue_date` en el payload | Prohibido | Prohibido | Obligatorio |
| `header.invoice_series_code` | Obligatorio | Obligatorio | Obligatorio |
| `header.invoice_type_code` | Obligatorio | Obligatorio | Obligatorio |
| Generación de número | No | Sí (automático) | No |
| Validación bloqueante | Solo errores de schema | Total | No bloquea |
| Estado resultante | `VALIDATED` / `HAS_ERRORS` | `ISSUED` | `ISSUED` |
| `draft` | `true` | `false` | `false` |

### `save` — borrador

- Los errores de schema bloquean (no se guarda nada).
- Los errores de negocio no bloquean: la factura se guarda con estado `HAS_ERRORS`.
- Deduplicación por `meta.external_ref` si se proporciona.

### `issue` — emitir

- Cualquier error (schema o negocio) bloquea el proceso.
- El sistema asigna `invoice_number` e `issue_date` (hoy) automáticamente.
- Idempotente por `meta.external_ref`: si ya existe una factura `ISSUED` con esa referencia, la devuelve sin crear una nueva.

### `import` — importar ya emitida

- `invoice_number` e `issue_date` vienen del payload tal cual.
- La validación no bloquea: la factura se guarda aunque tenga errores.
- `issue_date` no puede ser futura.
- Deduplicación por `(company, direction, series, invoice_number)`.

---

## `meta`

| Campo | Obligatorio | Tipo | Descripción |
|---|---|---|---|
| `direction` | Sí | `"issued"` \| `"received"` | Dirección de la factura |
| `source_system` | Sí | string | Sistema de origen (`"api"`, `"erp"`, `"portal"`, ...) |
| `external_ref` | No | string \| null | Referencia externa para deduplicar (máx. 60 caracteres). En `save` activa upsert por `(company, direction, external_ref)`. En `issue` garantiza idempotencia. |
| `batch_id` | No | string \| null | ID lógico del lote |
| `batch_item_id` | No | string \| null | ID del elemento dentro del lote |
| `original_format` | No | string \| null | Formato de origen antes de convertir (`"facturae_3_2_2"`, `"ubl_2_1"`, ...) |
| `original_document_id` | No | string \| null | Referencia al documento original |
| `source_invoice_public_id` | No | string \| null | `public_id` de la factura emitida de la que deriva una recibida |
| `issued_external` | No | boolean \| null | La factura emitida fue generada fuera del sistema |

---

## `invoice`

### Secciones obligatorias

| Sección | Descripción |
|---|---|
| `supplier` | Emisor de la factura |
| `header` | Cabecera (número, serie, tipo documental) |
| `issue_data` | Fechas, divisa, descripción |
| `totals` | Totales económicos |
| `lines` | Líneas de detalle (mínimo 1) |

### Secciones opcionales

| Sección | Descripción |
|---|---|
| `customer` | Receptor de la factura |
| `taxes_outputs` | Resumen de impuestos repercutidos por tipo |
| `taxes_withheld` | Resumen de retenciones por tipo |
| `payment_terms` | Condiciones de pago (texto libre) |
| `payment_details` | Vencimientos y formas de pago |
| `legal_literals` | Textos legales a incluir en la factura |
| `additional_data` | Observaciones y factura relacionada |

---

### `invoice.supplier` y `invoice.customer`

Las partes (emisor y receptor) comparten la misma estructura base.

**Campos directos:**

| Campo | Supplier | Customer | Tipo | Descripción |
|---|---|---|---|---|
| `person_type_code` | Obligatorio | Opcional | `"F"` \| `"J"` \| null | `F` = persona física, `J` = jurídica. Se infiere del NIF si es español y se omite. |
| `tax_id` | Obligatorio | Opcional | string \| null | NIF/CIF u otro identificador fiscal. Validado si el país es `ES`. |
| `name` | Obligatorio | Obligatorio | string (máx. 120) | Razón social o nombre completo |
| `party_country_code` | No | No | string \| null | País principal de la parte (ISO alpha-2) |
| `country_code` | No | No | string \| null | Código de país normalizado por el validador (ISO alpha-2) |
| `telephone` | No | No | string \| null | Teléfono de contacto |
| `electronic_mail` | No | No | string \| null | Correo electrónico |
| `contact_persons` | No | No | string \| null | Nombre de contacto |

**`electronic_address`** (opcional) — dirección electrónica interoperable (PEPPOL, etc.):

| Campo | Obligatorio | Descripción |
|---|---|---|
| `value` | Sí | Identificador electrónico de la parte |
| `scheme_id` | Sí | Código EAS de 4 dígitos (ej. `"0088"` para GLN) |

**`identifiers[]`** (opcional) — identificadores adicionales tipados:

| Campo | Obligatorio | Descripción |
|---|---|---|
| `role` | Sí | `"tax"` \| `"vat"` \| `"legal"` \| `"local"` \| `"other"` |
| `value` | Sí | Valor del identificador |
| `scheme_id` | Sí | Esquema: `"ES:VAT"`, `"ES:NIF"`, `"EU:VAT"`, `"GLN"`, `"DUNS"`, `"VF:SUPPLIER"`, `"VF:CUSTOMER"`, `"LOCAL:ERP"`, `"LOCAL:CRM"`, `"OTHER"` |
| `scheme_name` | No | Nombre legible del esquema |
| `issuer_country_code` | No | País emisor del identificador (ISO alpha-2) |

**`company`** (opcional) — bloque estructurado para persona jurídica:

| Campo | Descripción |
|---|---|
| `legal_name` | Razón social legal |
| `trade_name` | Nombre comercial |
| `address` | Dirección estructurada (ver bloque `address` más abajo) |

**`person`** (opcional) — bloque estructurado para persona física:

| Campo | Descripción |
|---|---|
| `first_name` | Nombre |
| `first_surname` | Primer apellido |
| `second_surname` | Segundo apellido (opcional) |
| `address` | Dirección estructurada |

**Bloque `address`** (dentro de `company` o `person`):

| Campo | Descripción |
|---|---|
| `address` | Línea de dirección principal |
| `address_2` | Segunda línea (portal, piso, etc.) |
| `post_code` | Código postal |
| `town` | Localidad |
| `country_code` | País (ISO alpha-2) |
| `country_subdivision` | Subdivisión territorial (ver más abajo) |

**`country_subdivision`** (dentro de `address`):

| Campo | Descripción |
|---|---|
| `code` | Código de subdivisión (ej. `"ES-M"`, `"ES-CT"`) |
| `name` | Nombre de la subdivisión |
| `subdivision_type` | `"province"` \| `"state"` \| `"region"` \| `"autonomous_community"` \| `"department"` \| `"county"` \| `"other"` |

**`administrative_centres[]`** (solo en `customer`, opcional) — centros administrativos para AAPP o gran empresa:

| Campo | Descripción |
|---|---|
| `centre_code` | Código del centro (obligatorio) |
| `role_type_code` | Rol del centro |
| `centre_description` | Descripción |

---

### `invoice.header`

| Campo | Obligatorio | Descripción |
|---|---|---|
| `invoice_series_code` | Sí | Código de serie. Si no existe, se crea automáticamente. Máx. 60 caracteres. |
| `invoice_type_code` | Sí | Tipo documental: `"01"` factura completa, `"02"` factura simplificada, `"03"` rectificativa por diferencias, `"04"` rectificativa por sustitución, `"05"` rectificativa en sumatorios |
| `invoice_number` | Condicional | Obligatorio en `import`. Prohibido en `save` e `issue`. Máx. 60 caracteres. |
| `is_simplified` | No | Flag derivado de `invoice_type_code` (tipos `02`). Calculado por el sistema. |
| `is_corrective` | No | Flag derivado de `invoice_type_code` (tipos `03`, `04`, `05`). Calculado por el sistema. |
| `references` | No | Referencias documentales de cabecera (ver bloque a continuación) |
| `corrective` | No | Datos de la factura rectificada (ver bloque a continuación) |

**`header.references`** (opcional):

| Campo | Descripción |
|---|---|
| `receiver_transaction_reference` | Número de pedido o referencia del cliente |
| `file_reference` | Número de expediente |
| `receiver_contract_reference` | Referencia al contrato |

**`header.corrective`** (cuando `invoice_type_code` es `03`, `04` o `05`):

| Campo | Descripción |
|---|---|
| `invoice_number` / `invoice_series_code` | Número y serie de la factura rectificada |
| `reason_code` / `reason_description` | Motivo de la rectificación |
| `correction_type` | `"D"` (por diferencias) \| `"S"` (por sustitución) |
| `tax_period.start_date` / `tax_period.end_date` | Periodo declarado de la factura rectificada (`YYYY-MM-DD`) |
| `corrected_taxable_base` / `corrected_tax_amount` | Importes a rectificar |
| `invoice_issue_date` | Fecha de expedición de la factura rectificada |

---

### `invoice.issue_data`

| Campo | Obligatorio | Descripción |
|---|---|---|
| `issue_date` | Condicional | Obligatorio en `import`. Prohibido en `save` e `issue`. Formato `YYYY-MM-DD`. |
| `operation_date` | No | Fecha de operación si distinta a la de emisión (`YYYY-MM-DD`) |
| `receipt_date` | No | Fecha de recepción del documento (`YYYY-MM-DD`) |
| `invoicing_period_start_date` / `invoicing_period_end_date` | No | Periodo de facturación (`YYYY-MM-DD`) |
| `tax_currency_code` | No | Moneda de liquidación del impuesto (ISO 4217). Por defecto `"EUR"`. |
| `tax_country_code` | No | País de liquidación del impuesto (ISO alpha-2 o alpha-3). Por defecto `"ES"`. |
| `is_tai` | No | `true` si la operación está en el TAI (territorio IVA peninsular y Baleares). Se infiere de la provincia. |
| `invoice_description` | No | Descripción general de la factura (máx. 500 caracteres) |
| `tax_group_code` | No | Régimen de impuesto indirecto: `"IVA"`, `"IGIC"`, `"IPSI"` |
| `invoice_currency` | No | Moneda original del documento cuando difiere de `tax_currency_code` (ver bloque a continuación) |

**`issue_data.invoice_currency`** (solo cuando la factura está en divisa distinta al euro):

| Campo | Obligatorio | Descripción |
|---|---|---|
| `invoice_currency_code` | Sí | Moneda del documento original (ISO 4217) |
| `exchange_rate` | Sí | Tipo de cambio (valor > 0) |
| `exchange_rate_date` | Sí | Fecha del tipo de cambio (`YYYY-MM-DD`) |

---

### `invoice.taxes_outputs[]`

Resumen de impuestos repercutidos agrupados por tipo y tipo impositivo. Si se proporciona, debe ser consistente con las líneas.

| Campo | Obligatorio | Descripción |
|---|---|---|
| `tax_rate` | Sí | Tipo impositivo (%). Debe existir en el catálogo. |
| `taxable_base` | Sí | Base imponible |
| `tax_amount` | Sí | Cuota (`taxable_base × tax_rate / 100`) |
| `tax_category_code` | Sí | Categoría fiscal EN 16931 (ver tabla a continuación) |
| `tax_type_code` | No | Código del tipo de impuesto (ej. `"IVA"`, `"IGIC"`). Se infiere del `tax_rate` si se omite. |
| `tax_treatment_code` | No | Código de tratamiento fiscal del catálogo |
| `taxable` | No | `true` si la operación está sujeta |
| `exempt` | No | `true` si la operación está exenta |
| `reverse_charge` | No | `true` = inversión del sujeto pasivo |
| `exemption_reason_code` / `exemption_reason_text` | No | Motivo de exención |
| `tax_regime_key` / `tax_regime_description` | No | Régimen especial (ej. `"IGIC"`) |
| `equivalence_surcharge` / `equivalence_surcharge_amount` | No | Recargo de equivalencia |
| `invoice_currency` | No | Importes del bloque fiscal en la divisa original del documento |

**`tax_category_code`** — categorías EN 16931:

| Código | Significado |
|---|---|
| `S` | Sujeto y no exento (caso general) |
| `Z` | Tipo cero (no exento) |
| `E` | Exento |
| `AE` | Inversión del sujeto pasivo |
| `K` | IVA intracomunitario |
| `G` | Exento (no empresario) |
| `O` | Fuera del ámbito |
| `L` | IGIC (Canarias) |
| `M` | IPSI (Ceuta/Melilla) |

El sistema infiere `tax_category_code` automáticamente en líneas y resúmenes a partir de `reverse_charge`, `exempt`, `taxable` y `tax_regime_key` si no se proporciona.

---

### `invoice.taxes_withheld[]`

| Campo | Obligatorio | Descripción |
|---|---|---|
| `tax_rate` | Sí | Tipo de retención (%) |
| `taxable_base` | Sí | Base de la retención |
| `tax_amount` | Sí | Importe retenido |
| `tax_type_code` | No | Código del tipo de retención (ej. `"IRPF"`) |

---

### `invoice.totals`

| Campo | Obligatorio | Descripción |
|---|---|---|
| `total_gross_amount_before_taxes` | Sí | Base imponible total (bruto − descuentos + recargos generales) |
| `total_tax_outputs` | Sí | Suma de cuotas de impuestos repercutidos |
| `invoice_total` | Sí | Total factura = `total_gross_amount_before_taxes + total_tax_outputs − total_taxes_withheld` |
| `total_gross_amount` | No | Suma bruta de líneas. Calculado automáticamente si se omite. |
| `general_discounts[]` | No | Descuentos generales sobre el total |
| `general_surcharges[]` | No | Recargos generales sobre el total |
| `total_general_discounts` / `total_general_surcharges` | No | Calculados automáticamente si se omiten |
| `total_taxes_withheld` | No | Suma de retenciones. Calculado automáticamente si se omite. |
| `payments_on_account[]` | No | Anticipos previos (requieren `payment_on_account_date` y `payment_on_account_amount`) |
| `total_payments_on_account` | No | Suma de anticipos |
| `reimbursable_expenses[]` | No | Suplidos |
| `total_reimbursable_expenses` | No | Suma de suplidos |
| `total_executable_amount` | No | Importe ejecutable (`invoice_total − anticipos + suplidos`) |
| `rounding_amount` | No | Ajuste de redondeo para absorber diferencias legítimas entre componentes y total |
| `invoice_currency` | No | Importes del total en la divisa original del documento |

---

### `invoice.lines[]`

Mínimo una línea. Cada línea trabaja en modo **sin impuesto incluido** (`unit_price_without_tax`) o **con impuesto incluido** (`unit_price_with_tax`). No se pueden mezclar modos en la misma factura.

| Campo | Obligatorio | Descripción |
|---|---|---|
| `item_description` | Sí | Descripción del concepto |
| `quantity` | Sí | Cantidad |
| `tax_category_code` | Sí | Categoría fiscal EN 16931 (ver tabla en `taxes_outputs`) |
| `unit_price_without_tax` | Condicional | Precio unitario sin impuesto. Obligatorio si no se usa `unit_price_with_tax`. |
| `unit_price_with_tax` | Condicional | Precio unitario con impuesto incluido. Excluye `unit_price_without_tax`. |
| `sequence_number` | No | Número de línea. Se autonumera (1..n) si se omite. |
| `item_type` | No | `"goods"` \| `"service"` |
| `unit_of_measure` | No | Código de unidad de medida (catálogo UN/CEFACT) |
| `total_cost_without_tax` / `gross_amount_without_tax` | No | Calculados automáticamente |
| `total_cost_with_tax` / `gross_amount_with_tax` | No | Calculados automáticamente |
| `discount_rate` / `discount_amount` | No | Descuento de línea. Prohibido en modo con-impuesto. |
| `charge_rate` / `charge_amount` | No | Recargo de línea. Prohibido en modo con-impuesto. |
| `tax_output_code` | No | Código de tipo impositivo. Se infiere del `tax_output_rate` si se omite. |
| `tax_output_rate` | No | Tipo impositivo de la línea (%) |
| `tax_output_base` / `tax_output_amount` | No | Base y cuota. Calculados automáticamente. |
| `tax_withheld_rate` / `tax_withheld_code` / `tax_withheld_base` / `tax_withheld_amount` | No | Retención de la línea |
| `tax_treatment_code` | No | Código de tratamiento fiscal |
| `taxable` | No | `true` si la operación está sujeta |
| `exempt` | No | `true` si la operación está exenta |
| `reverse_charge` | No | Inversión del sujeto pasivo |
| `exemption_reason_code` / `exemption_reason_text` | No | Motivo de exención |
| `tax_regime_key` / `tax_regime_description` | No | Régimen especial |
| `line_item_period_start_date` / `line_item_period_end_date` | No | Periodo del servicio de la línea (`YYYY-MM-DD`) |
| `transaction_date` | No | Fecha de la operación de la línea |
| `article_code` | No | Referencia interna del producto o servicio |
| `additional_line_item_information` | No | Texto adicional |
| `references` | No | Referencias documentales de la línea (ver bloque a continuación) |
| `invoice_currency` | No | Importes de la línea en la divisa original del documento |
| `legal_literals[]` | No | Textos legales específicos de la línea |

**`lines[].references`** (opcional):

| Campo | Descripción |
|---|---|
| `issuer_contract_reference` / `issuer_contract_date` | Contrato del emisor |
| `receiver_contract_reference` | Contrato del receptor |
| `receiver_transaction_reference` | Número de pedido del receptor |
| `file_reference` | Número de expediente |
| `delivery_notes[]` | Albaranes asociados (`number` y `date`) |

---

### `invoice.payment_details[]`

| Campo | Descripción |
|---|---|
| `installment_due_date` | Fecha de vencimiento (`YYYY-MM-DD`) |
| `installment_amount` | Importe del vencimiento |
| `payment_method_code` | Código de forma de pago (dos dígitos, catálogo interno) |
| `payment_method_label` | Etiqueta de la forma de pago |
| `iban_account_to_be_credited` | IBAN de abono |
| `iban_account_to_be_debited` | IBAN de cargo |
| `payment_reconciliation_reference` | Referencia de conciliación |
| `collection_additional_information` | Información adicional de cobro |

---

## Normalizaciones automáticas

| Campo | Normalización |
|---|---|
| `supplier.country_code` / `customer.country_code` / `issue_data.tax_country_code` | ISO alpha-3 → alpha-2. Si se omite, `"ES"`. |
| `supplier.person_type_code` / `customer.person_type_code` | Se infiere del NIF si el país es `ES` y se omite. |
| `issue_data.is_tai` | Siempre inferido desde `province_id` o `country_subdivision` (o `true` si no hay provincia). |
| `lines[].sequence_number` | Se autonumera 1..n si alguna línea lo omite. |
| `lines[].tax_category_code` | Se infiere de `reverse_charge`, `exempt`, `taxable` y `tax_regime_key` si se omite. |
| `taxes_outputs[].tax_type_code` / `lines[].tax_output_code` | Se infiere del tipo impositivo si se omite. |
| `lines[].total_cost` / `gross_amount` / `tax_output_base` / `tax_output_amount` | Calculados automáticamente si se omiten. |
| `totals.total_gross_amount` / `total_general_discounts` / `total_general_surcharges` / `total_taxes_withheld` | Calculados automáticamente si se omiten. |
| `unit_of_measure` | Valores informales como `"uds"`, `"unidades"`, `"ud"` se normalizan al código canónico del catálogo. |

---

## Ejemplo completo

Factura emitida en euros con IVA general (21%), una línea de servicio y pago por transferencia.

```json
{
  "schema_version": "json_1_1",
  "meta": {
    "direction": "issued",
    "source_system": "mi-erp",
    "external_ref": "PEDIDO-2026-001"
  },
  "invoice": {
    "supplier": {
      "person_type_code": "J",
      "tax_id": "B10000008",
      "name": "Empresa Demo S.L.",
      "party_country_code": "ES",
      "electronic_mail": "facturacion@empresa-demo.es",
      "company": {
        "legal_name": "Empresa Demo S.L.",
        "address": {
          "address": "Calle Mayor 1, 3ºA",
          "post_code": "28001",
          "town": "Madrid",
          "country_subdivision": {
            "code": "ES-M",
            "name": "Madrid",
            "subdivision_type": "province"
          },
          "country_code": "ES"
        }
      }
    },
    "customer": {
      "person_type_code": "J",
      "tax_id": "B10000016",
      "name": "Cliente Prueba S.L.",
      "party_country_code": "ES",
      "company": {
        "legal_name": "Cliente Prueba S.L.",
        "address": {
          "address": "Av. Cliente 5",
          "post_code": "08001",
          "town": "Barcelona",
          "country_subdivision": {
            "code": "ES-CT",
            "name": "Catalunya",
            "subdivision_type": "autonomous_community"
          },
          "country_code": "ES"
        }
      }
    },
    "header": {
      "invoice_series_code": "A",
      "invoice_type_code": "01",
      "references": {
        "receiver_transaction_reference": "PED-2026-0001"
      }
    },
    "issue_data": {
      "tax_currency_code": "EUR",
      "tax_country_code": "ES",
      "invoice_description": "Servicios de consultoría noviembre 2026",
      "tax_group_code": "IVA"
    },
    "taxes_outputs": [
      {
        "tax_type_code": "IVA",
        "tax_rate": 21.0,
        "taxable_base": 1000.0,
        "tax_amount": 210.0,
        "tax_category_code": "S",
        "taxable": true,
        "exempt": false,
        "reverse_charge": false
      }
    ],
    "totals": {
      "total_gross_amount": 1000.0,
      "total_gross_amount_before_taxes": 1000.0,
      "total_tax_outputs": 210.0,
      "invoice_total": 1210.0
    },
    "lines": [
      {
        "sequence_number": 1,
        "item_type": "service",
        "item_description": "Consultoría senior — noviembre 2026",
        "quantity": 10.0,
        "unit_of_measure": "HUR",
        "unit_price_without_tax": 100.0,
        "tax_output_rate": 21.0,
        "tax_category_code": "S",
        "taxable": true,
        "exempt": false,
        "reverse_charge": false,
        "article_code": "CONSULT-SENIOR"
      }
    ],
    "payment_terms": "Pago a 30 días fecha factura",
    "payment_details": [
      {
        "installment_due_date": "2027-01-15",
        "installment_amount": 1210.0,
        "payment_method_code": "04",
        "iban_account_to_be_credited": "ES6621000418401234567891"
      }
    ]
  }
}
```

> En modo `issue`, omite `header.invoice_number` e `issue_data.issue_date` — el sistema los asigna. En modo `import`, inclúyelos explícitamente.

---

## Catálogos

### `header.invoice_type_code`

| Código | Nombre | Simplificada | Rectificativa |
|---|---|---|---|
| `01` | Factura ordinaria | No | No |
| `02` | Factura simplificada | Sí | No |
| `03` | Factura rectificativa | No | Sí |
| `04` | Factura rectificativa simplificada | Sí | Sí |
| `05` | Autofactura | No | No |

### Tipos impositivos (`tax_output_rate` / `taxes_outputs[].tax_rate`)

| Código (`tax_type_code`) | Nombre | Tipo (%) | Régimen |
|---|---|---|---|
| `IVA_G` | IVA General | 21 | IVA |
| `IVA_R` | IVA Reducido | 10 | IVA |
| `IVA_SR` | IVA Superreducido | 4 | IVA |
| `IVA_0` | IVA Cero | 0 | IVA |
| `IGIC_0` | IGIC Cero | 0 | IGIC |
| `IGIC_R` | IGIC Reducido | 3 | IGIC |
| `IGIC_G` | IGIC General | 7 | IGIC |
| `IGIC_I` | IGIC Incrementado | 9.5 | IGIC |
| `IGIC_I2` | IGIC Incrementado 2 | 13.5 | IGIC |
| `IGIC_E` | IGIC Especial | 20 | IGIC |
| `IGIC_E2` | IGIC Especial 2 | 35 | IGIC |
| `IRPF_G` | IRPF General | 15 | IRPF |
| `IRPF_R` | IRPF Reducido | 7 | IRPF |

### `tax_category_code` (EN 16931)

| Código | Significado |
|---|---|
| `S` | Sujeto y no exento (caso general) |
| `Z` | Tipo cero |
| `E` | Exento |
| `AE` | Inversión del sujeto pasivo |
| `K` | IVA intracomunitario |
| `G` | Exento (adquirente no empresario) |
| `O` | Fuera del ámbito del impuesto |
| `L` | IGIC (Canarias) |
| `M` | IPSI (Ceuta/Melilla) |

### Formas de pago (`payment_details[].payment_method_code`)

| Código | Descripción |
|---|---|
| `01` | Al contado |
| `02` | Recibo domiciliado |
| `03` | Recibo |
| `04` | Transferencia |
| `05` | Letra aceptada |
| `06` | Crédito documentario |
| `07` | Contrato de adjudicación |
| `08` | Letra de cambio |
| `09` | Pagaré a la orden |
| `10` | Pagaré no a la orden |
| `11` | Cheque |
| `12` | Reposición |
| `13` | Especiales |
| `14` | Compensación |
| `15` | Giro postal |
| `16` | Cheque conformado |
| `17` | Cheque bancario |
| `18` | Contra reembolso |
| `19` | Tarjeta |

### Unidades de medida (`unit_of_measure`)

El campo acepta códigos UN/CEFACT. Los más habituales:

| Código | Descripción |
|---|---|
| `HUR` | Hora |
| `DAY` | Día |
| `MON` | Mes |
| `H87` | Unidad (pieza) |
| `KGM` | Kilogramo |
| `MTR` | Metro |
| `LTR` | Litro |
| `SET` | Conjunto |

Valores informales como `"uds"`, `"unidades"` o `"ud"` se normalizan automáticamente al código canónico del catálogo.

### Esquemas de identificador de parte (`identifiers[].scheme_id`)

| Código | Descripción |
|---|---|
| `ES:VAT` | NIF-IVA español (contexto intracomunitario) |
| `ES:NIF` | NIF español doméstico |
| `EU:VAT` | VAT UE genérico |
| `GLN` | Global Location Number |
| `DUNS` | D-U-N-S Number |
| `VF:SUPPLIER` | Identificador interno de proveedor en la plataforma |
| `VF:CUSTOMER` | Identificador interno de cliente en la plataforma |
| `LOCAL:ERP` | Identificador heredado de ERP externo |
| `LOCAL:CRM` | Identificador heredado de CRM externo |
| `OTHER` | Otros identificadores no normalizados |

### Esquemas de dirección electrónica (`electronic_address.scheme_id`)

| Código | Descripción |
|---|---|
| `0088` | GLN — Global Location Number (EAS) |

---

## Schema JSON

El schema completo en formato JSON Schema Draft-07 está disponible para descarga e integración en herramientas de validación.

[Descargar `invoice_canonical_1_1.schema.json`](/invoice_canonical_1_1.schema.json)

---

## Errores de validación

| Código HTTP | Código de error | Causa |
|---|---|---|
| `422` | `invoice_number_not_allowed` | Se ha enviado `invoice_number` en modo `save` o `issue` |
| `422` | `issue_date_not_allowed` | Se ha enviado `issue_date` en modo `save` o `issue` |
| `422` | `missing_required_fields` | Falta `invoice_series_code`, `invoice_type_code` u otro campo obligatorio |
| `422` | `future_issue_date` | La `issue_date` es futura en modo `import` |
| `422` | `schema_validation_failed` | El payload no cumple el schema JSON del canónico |
| `409` | `invoice_update_not_allowed` | La factura existe en un estado que no permite modificación |
| `409` | `invoice_race_condition` | Conflicto de escritura concurrente |
