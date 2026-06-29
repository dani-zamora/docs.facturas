---
sidebar_position: 8
title: Importación
---

# Importación

Hay dos vías para dar de alta facturas de forma masiva:

- **Excel**: una plantilla `.xlsx` con varias hojas. Pensada para usuarios y migraciones desde otros sistemas. Es el grueso de esta página.
- **JSON canónico / Facturae XML / UBL XML**: ingesta por lote para integraciones técnicas.

Toda factura, venga del formato que venga, se convierte internamente al [formato canónico `json_1_1`](/docs/05-guias/formato-canonico) antes de validarse y persistirse.

---

## Importación por Excel

### Cómo funciona

1. **Descarga la plantilla** desde la aplicación (botón de descarga en la pantalla de importación). Hay una plantilla para **emitidas** y otra para **recibidas**.
2. **Rellena** las hojas (una fila de `Cabecera` = una factura).
3. **Previsualiza**: el sistema parsea el fichero, calcula los totales a partir de las líneas y devuelve, fila a fila, el estado de validación, los errores y un aviso si la factura ya existe.
4. **Importa** las filas válidas seleccionadas.

No se persiste nada hasta confirmar la importación.

### Modos de importación

| Modo | Qué hace | `numero` | `fecha` |
|---|---|---|---|
| **Importar borradores** (`save`) | Crea borradores para revisar y emitir después | Vacío | Vacío |
| **Emitir** (`issue`) | Emite el lote en el momento (all-or-nothing) | Vacío* | Vacío (se usa la del día) |
| **Importar ya emitidas** (`import`) | Registra facturas existentes sin alterar sus datos (históricos/migración) | Obligatorio | Obligatorio |

\* En modo emitir solo se admite número si la serie permite numeración forzada. Las recibidas solo admiten el modo `import` (número y fecha los pone el proveedor).

### Reglas generales

- Campos booleanos: `S` (sí) o vacío / `N` (no).
- Fechas: `AAAA-MM-DD` o `DD/MM/AAAA`.
- Importes: punto `.` o coma `,` como separador decimal.
- Las columnas deben estar **presentes y en el mismo orden** que la plantilla. Si no coinciden, descarga la plantilla actualizada.
- El sistema calcula `taxes_outputs`, `taxes_withheld` y los totales **a partir de las líneas**. No se informan a mano.
- `total_bruto` y `total_factura` son **solo verificación**: una desviación > 0,02 € genera un aviso (no bloquea).

---

### Hojas del fichero

| Hoja | Obligatoria | Contenido |
|---|---|---|
| `Cabecera` | Sí | Una fila por factura: datos de cabecera, parte (cliente/proveedor) y totales de verificación |
| `Lineas` | Sí | Una fila por línea; se vincula a su cabecera por clave de unión |
| `Anticipos` | No | Pagos a cuenta previos |
| `Suplidos` | No | Gastos suplidos incluidos en la factura |
| `Vencimientos` | No | Plazos de pago y método de cobro |
| `LiteralesLegales` | No | Textos legales de la factura |
| `CentrosAdministrativos` | No | Centros DIR3 del cliente para FACe (solo emitidas) |

---

### Cabecera

Columnas principales (emitidas). En **recibidas** las columnas `cliente_*` se sustituyen por `proveedor_*` y no existen `emisor_nif` ni `serie`.

| Columna | Descripción |
|---|---|
| `referencia_externa` | Clave de deduplicación/unión. Recomendable informarla siempre. |
| `serie` / `numero` | Serie y número de la factura. |
| `fecha` | Fecha de emisión. |
| `fecha_operacion` | Fecha de operación si difiere de la de emisión. |
| `periodo_inicio` / `periodo_fin` | Período de facturación. |
| `descripcion` | Descripción general. |
| `grupo_impuesto` | `IVA`, `IGIC` o `IPSI`*. Si se omite, se usa el grupo por defecto de la empresa. |
| `tipo_factura` | Código de tipo `01`–`05` (ver [Tipo de factura](#tipo-de-factura)). Por defecto `01`. |
| `tax_included` | `S` si el precio de las líneas ya incluye el impuesto. |
| `recargo_equivalencia` | `S` si el cliente está en recargo de equivalencia. |
| `cliente_nif` / `cliente_nombre` | Identificación del cliente (`cliente_nombre` obligatorio). |
| `cliente_tipo_persona` | `F` o `J`. Si se omite, se infiere del NIF. |
| `cliente_email` / `cliente_telefono` | Contacto del cliente. |
| `cliente_pais` | ISO 3166-1 alpha-2 (por defecto `ES`). |
| `cliente_direccion` / `cliente_cp` / `cliente_poblacion` / `cliente_provincia` | Dirección del cliente. |
| `total_bruto` / `total_factura` | Totales declarados (solo verificación). |
| `rect_*` | Datos de la factura rectificada (ver [Tipo de factura](#tipo-de-factura)). |
| `dto_global_*` / `recargo_global_*` | Descuentos y recargos a nivel de documento (hasta 2 de cada). |

\* `IPSI` no está soportado de momento.

Exclusivas de **recibidas**: `fecha_recepcion`, `pais_fiscalidad`, `moneda`, `moneda_original`, `tipo_cambio`, `fecha_tipo_cambio` (ver [Moneda extranjera](#moneda-extranjera-solo-recibidas)). En emitidas la moneda es siempre EUR.

---

### Líneas

Una fila = una línea. Obligatorias: `descripcion`, `cantidad`, `precio_sin_iva`.

| Columna | Descripción |
|---|---|
| `referencia_externa` / `serie` / `numero` | Clave de unión con la cabecera. |
| `descripcion` / `cantidad` / `precio_sin_iva` | Concepto, cantidad y precio unitario. |
| `tipo_articulo` | `EB` (bienes) o `PS` (servicios). |
| `unidad_medida` | Código de unidad (admite alias como `uds`, `h`, `kg`…). |
| `codigo_articulo` | Referencia interna. |
| `descuento_porcentaje` / `descuento_importe` | Descuento de línea. |
| `recargo_porcentaje` / `recargo_importe` | Recargo de línea. |
| `tipo_iva` | Tipo impositivo en % (`21`, `10`, `4`, `0`…). |
| `tipo_retencion` | Retención IRPF en % (`15`, `7`…). |
| `exenta` | `S` si está exenta. |
| `causa_exencion_codigo` / `causa_exencion_texto` | Causa de exención. |
| `no_sujeta` | `S` si la operación no está sujeta. |
| `inversion_sujeto_pasivo` | `S` si aplica ISP. |
| `regimen_especial_codigo` / `regimen_especial_texto` | Régimen especial. |
| `periodo_inicio_linea` / `periodo_fin_linea` / `fecha_transaccion` | Fechas de línea. |
| `ref_*_linea`, `albaran_*` | Referencias documentales de línea (pedido, contrato, expediente, albaranes). |

`precio_sin_iva` es la única columna de precio: si la cabecera marca `tax_included=S`, su valor se interpreta como precio **con IVA incluido** y el sistema desglosa base y cuota.

---

### Hojas auxiliares

Todas se vinculan a la cabecera por `referencia_externa` + `serie` + `numero`.

- **Anticipos**: `anticipo_fecha`, `anticipo_importe`.
- **Suplidos**: `suplido_fecha`, `suplido_numero_factura`, `suplido_serie`, `suplido_importe`.
- **Vencimientos**: `vencimiento_fecha`, `vencimiento_importe`, `metodo_pago_codigo`, `iban_credito`, `iban_debito`, `referencia_conciliacion`, `info_adicional_cobro`.
- **LiteralesLegales**: `literal_codigo`, `literal_texto`.
- **CentrosAdministrativos** (solo emitidas): `centro_codigo`, `centro_rol`, `centro_descripcion`.

---

### Tipo de factura

El tipo documental se informa con `tipo_factura`. Los flags simplificada/rectificativa se derivan del código.

| `tipo_factura` | Descripción | Simplificada | Rectificativa |
|---|---|---|---|
| `01` | Ordinaria (por defecto) | No | No |
| `02` | Simplificada (ticket) | Sí | No |
| `03` | Rectificativa | No | Sí |
| `04` | Rectificativa de simplificada | Sí | Sí |
| `05` | Autofactura | No | No |

En tipos rectificativos (`03`/`04`) se informan los datos de la factura rectificada:

| Campo | Descripción |
|---|---|
| `rect_tipo_correccion` | `S` (sustitución) o `D` (por diferencias) |
| `rect_serie` / `rect_numero` / `rect_fecha` | Identificación de la factura original |
| `rect_motivo` | Motivo de la rectificación |
| `rect_periodo_inicio` / `rect_periodo_fin` | Período de liquidación afectado |
| `rect_base_rectificada` / `rect_cuota_rectificada` | Solo en modo `D`: importes corregidos |

> El código de causa (R1–R5) no se informa: se infiere automáticamente en la exportación a Hacienda.

---

### Fiscalidad de líneas

Prioridad de resolución por línea:

1. `no_sujeta=S` → operación no sujeta, sin impuesto.
2. `exenta=S` → exenta, tipo `0` (informa `causa_exencion_codigo`).
3. `inversion_sujeto_pasivo=S` → inversión del sujeto pasivo.
4. En otro caso → se aplica `tipo_iva` (o el tipo general de la empresa).

El código de impuesto (`IVA_G`, `IVA_R`…) se infiere del tipo y del `grupo_impuesto`; no se informa.

**Precio con IVA incluido.** Con `tax_included=S`, el `precio_sin_iva` de todas las líneas se trata como precio con impuesto incluido (típico en tickets/PVP). No se combina con descuentos/recargos de línea.

**Recargo de equivalencia.** Con `recargo_equivalencia=S`, se añade la cuota de recargo a cada tipo de IVA sujeto, con el tipo estándar derivado del % de IVA:

| Tipo IVA | Recargo |
|---|---|
| 21 % | 5,2 % |
| 10 % | 1,4 % |
| 5 % | 0,625 % |
| 4 % | 0,5 % |

La cuota de recargo se suma al total de la factura.

---

### Territorios especiales (IGIC)

Para facturar en IGIC (Canarias) informa `grupo_impuesto=IGIC` en la cabecera (o configúralo como grupo por defecto de la empresa). Los `tipo_iva` de las líneas se interpretan como tipos de IGIC. `IPSI` (Ceuta y Melilla) no está soportado de momento.

### Sector público (FACe)

Para facturar a una Administración Pública, añade los centros administrativos (DIR3) del cliente en la hoja `CentrosAdministrativos`. Roles habituales:

| `centro_rol` | Rol |
|---|---|
| `01` | Oficina contable |
| `02` | Órgano gestor |
| `03` | Unidad tramitadora |
| `04` | Órgano proponente |

### Moneda extranjera (solo recibidas)

Las **emitidas** son siempre en EUR. En **recibidas**, cuando el proveedor factura en otra divisa:

- `moneda_original`: divisa del documento (`USD`, `GBP`…).
- `tipo_cambio`: tipo de cambio respecto al euro.
- `fecha_tipo_cambio`: fecha de referencia.

---

### Identificación y agrupación

Las líneas y hojas auxiliares se unen a su cabecera por `referencia_externa` + `serie` + `numero`:

- Con número: la clave es (`serie`, `numero`).
- Borrador sin número: la clave es `referencia_externa`.
- Si dos cabeceras comparten clave, se rechaza el fichero (duplicado).

> Informa siempre `referencia_externa`: garantiza una unión correcta y sirve de clave de deduplicación al reimportar.

### Errores y avisos

- **Errores bloqueantes**: impiden importar esa fila (p. ej. estructura inválida, NIF del emisor que no coincide con la empresa).
- **Avisos de cuadre**: `total_bruto`/`total_factura` que no cuadran con lo calculado (no bloquean).
- **Ya existe**: la factura ya está registrada; no se reimporta (o se actualiza, según el modo).

---

### Ficheros de ejemplo

Dos libros de ejemplo reproducen el catálogo de casos canónicos v1.1 (nacionales, retenciones, simplificadas, rectificativas, exentas, no sujetas, ISP, intracomunitarias, exportaciones, IGIC, regímenes especiales, recibidas…):

- [facturas_emitidas_ejemplos_v1_1.xlsx](/ejemplos/facturas_emitidas_ejemplos_v1_1.xlsx)
- [facturas_recibidas_ejemplos_v1_1.xlsx](/ejemplos/facturas_recibidas_ejemplos_v1_1.xlsx)

Como sus filas llevan número y fecha, **impórtalos con el modo "Importar ya emitidas"**.

No se incluyen las facturas emitidas en divisa extranjera (las emitidas son siempre en EUR) ni las facturas multi-impuesto (mezcla IVA + IGIC en una misma factura), porque una factura usa un único grupo de impuesto. Algunos casos usan tipos concretos (p. ej. retención IRPF del 19 % en alquileres) que deben existir en el catálogo de tu empresa.

---

## JSON canónico, Facturae XML, UBL XML

Para integraciones técnicas, la ingesta por lote acepta directamente `json_1_1`, Facturae 3.2.x y UBL 2.1. Cada documento se normaliza al [formato canónico](/docs/05-guias/formato-canonico) y se valida con las mismas reglas que el Excel.

## Manejo de errores de lote

- Duplicados por serie/número o por `external_ref`.
- Avisos de cuadre de totales (`totals_check_warnings`).
- En modo emitir el lote es *all-or-nothing*: si una factura falla, no se emite ninguna.
