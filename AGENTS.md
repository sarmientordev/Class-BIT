# AGENTS.md — Reglas para agentes (opencode) en este repositorio

## Regla principal: COMMIT Y PUSH OBLIGATORIOS

**Cada vez que se termine una tarea, SIEMPRE subir los cambios al repositorio:**

1. Verificar qué cambió con `git status` y `git diff`.
2. Hacer `git add` SOLO de los archivos relacionados a la tarea.
3. Commit con mensaje conciso que describa el cambio.
4. **`git push origin main` es obligatorio al final de CADA tarea completada** — no dejar commits locales pendientes.
5. **Actualizar el instalador `.exe`** en la release de GitHub con `npm run dist` y `gh release upload --clobber`. Solo crear una nueva release cuando haya un cambio significativo; para fixes menores, sobrescribir el .exe en la release existente.
6. **Documentar el cambio en la release de GitHub**: después de pushear y subir el .exe, ACTUALIZAR las notas de la release (`gh release edit <tag> --notes-file <archivo>`) para que lo que se acaba de subir quede documentado. No dejar que la release quede desactualizada respecto al último commit.

No importa si el cambio es pequeño: si la tarea terminó, se sube al remoto.

## Regla: CHECKLIST OBLIGATORIA ANTES DE CADA TAREA

**Al recibir cualquier petición (cualquier programa, tarea o cambio), ANTES de ejecutar nada, mostrar al usuario un checklist visible con los pasos que se van a seguir.**

- Formato: lista numerada o con checkboxes `[ ]` / `[✓]` que se actualiza en tiempo real conforme se completa cada paso.
- Actualizar el checklist con `[✓]` al terminar cada paso, y marcar `[ ]` o `[en progreso]` para los pendientes.
- El checklist debe ser visible al inicio de la respuesta, no al final.
- Aplica a todo: código, configuración, diagnósticos, consultas, despliegues... cualquier cosa que el usuario pida.

No ejecutar pasos sin antes mostrar el plan. El checklist es la primera respuesta visible antes de cualquier acción.

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
