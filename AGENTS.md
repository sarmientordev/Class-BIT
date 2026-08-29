# AGENTS.md — Reglas para agentes (opencode) en este repositorio

## Regla principal: COMMIT Y PUSH OBLIGATORIOS

**Cada vez que se termine una tarea, SIEMPRE subir los cambios al repositorio:**

1. Verificar qué cambió con `git status` y `git diff`.
2. Hacer `git add` SOLO de los archivos relacionados a la tarea.
3. Commit con mensaje conciso que describa el cambio.
4. **`git push origin main` es obligatorio al final de CADA tarea completada** — no dejar commits locales pendientes.
5. **Actualizar el instalador `.exe`** en la release de GitHub con `npm run dist` y `gh release upload --clobber`. Solo crear una nueva release cuando haya un cambio significativo; para fixes menores, sobrescribir el .exe en la release existente.
6. **Documentar el cambio en la release de GitHub**: después de pushear y subir el .exe, ACTUALIZAR las notas de la release (`gh release edit <tag> --notes-file <archivo>`) para que lo que se acaba de subir quede documentado. No dejar que la release quede desactualizada respecto al último commit.

## Regla: BACKUP DE VERSIONES EN RELEASES

**Siempre conservar 2 releases: la actual + la anterior (backup).**

- Al lanzar una versión nueva N, eliminar la versión **N-2** (la "anterior de la anterior") para dejar la N-1 como backup.
- Ejemplo: si se publica la **1.0.5**, eliminar la **1.0.3**; quedan **1.0.4** (backup) y **1.0.5** (actual).
- La release **v1.0.0** se conserva SIEMPRE por nostalgia (no aplica la regla de backup).

## Regla: VERSIONADO SEMÁNTICO AUTOMÁTICO

**El agente asigna el número de versión según el tipo de cambio (SemVer `MAJOR.MINOR.PATCH`):**

- **PATCH (X.Y.Z → X.Y.Z+1)**: fixes y ajustes pequeños (visuales, bugs, CSS). Ej: `1.0.3` → `1.0.4`.
- **MINOR (X.Y.Z → X.(Y+1).0)**: feature nueva que no rompe lo anterior. Ej: `1.0.3` → `1.1.0`.
- **MAJOR (X.Y.Z → (X+1).0.0)**: cambio que rompe compatibilidad o rediseño total. Ej: `2.0.0`.
- **Nunca usar 4 partes** (`1.0.3.1` no es válido) ni abreviar (`1.2` = `1.2.0`, escribir los 3 números siempre).
- Se nombra automáticamente: al terminar cada tarea, decidir patch/minor/major, actualizar `package.json`, y documentar en las release notes.

No importa si el cambio es pequeño: si la tarea terminó, se sube al remoto.

## Regla: CHECKLIST OBLIGATORIA ANTES DE CADA TAREA

**Al recibir cualquier petición (cualquier programa, tarea o cambio), ANTES de ejecutar nada, mostrar al usuario un checklist visible con los pasos que se van a seguir.**

- Formato: lista numerada o con checkboxes `[ ]` / `[✓]` que se actualiza en tiempo real conforme se completa cada paso.
- Actualizar el checklist con `[✓]` al terminar cada paso, y marcar `[ ]` o `[en progreso]` para los pendientes.
- El checklist debe ser visible al inicio de la respuesta, no al final.
- Aplica a todo: código, configuración, diagnósticos, consultas, despliegues... cualquier cosa que el usuario pida.

No ejecutar pasos sin antes mostrar el plan. El checklist es la primera respuesta visible antes de cualquier acción.

## Regla: BARRA DE PROGRESO DE PORCENTAJE

**Al ejecutar cualquier tarea, mostrar (junto al checklist) una barra de progreso de porcentaje de 0 a 100% que se vaya llenando visualmente conforme se completa cada paso.**

- Formato: barra de texto tipo `[████▓░░░░░░] 40%` que muestre de un vistazo cuánto falta para terminar.
- Actualizar la barra con el nuevo porcentaje al completar CADA paso del checklist, para que se vea cargar mientras se trabaja.
- Complementa el checklist obligatorio: el checklist define los pasos (qué se hará) y la barra muestra el avance porcentual (cuánto llevo / cuánto falta).
- Se usa en toda tarea, por pequeña que sea. La barra debe ser visible desde el inicio.

## Definición de "tarea terminada"

En este proyecto una tarea NO está terminada hasta que:

1. Los archivos fuente están editados (`renderer/style.css`, `renderer/index.html`, `renderer/renderer.js`, etc.).
2. La app fue reiniciada con los cambios.
3. Commit + push realizados según la regla principal.

## Regla: USUARIO LIMPIO PARA OTROS INSTALADORES

**El repo NO debe contener datos personales del usuario (Rafael) ni configuraciones específicas.**

- NO commitear `schedule-data.json` (datos de clases del usuario).
- NO commitear archivos de `%APPDATA%\class-bit\` (notified.json, Preferences, etc.).
- El `app.asar` en el repo debe ser una versión "limpia" sin datos personales.
- Si el usuario clona el repo e instala, debe empezar con una app vacía (sin clases predefinidas).
- Los datos personales del usuario quedan SOLO en `%APPDATA%\class-bit\schedule-data.json` (fuera del repo).

## Estructura del proyecto

- Fuentes del repo: `main.js`, `preload.js`, `holidays.js`, `renderer/`, `assets/`, `package.json`
- Instalación en uso por el usuario: `C:\Users\user\Desktop\Class BIT`
- Datos de la app (NO versionar): `%APPDATA%\class-bit\schedule-data.json`
- Remoto: https://github.com/sarmientordev/Class-BIT (rama `main`)
