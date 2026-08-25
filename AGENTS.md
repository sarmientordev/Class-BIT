# AGENTS.md — Reglas para agentes (opencode) en este repositorio

## Regla principal: COMMIT Y PUSH OBLIGATORIOS

**Cada vez que se termine una tarea, SIEMPRE subir los cambios al repositorio:**

1. Verificar qué cambió con `git status` y `git diff`.
2. Hacer `git add` SOLO de los archivos relacionados a la tarea.
3. Commit con mensaje conciso que describa el cambio.
4. **`git push origin main` es obligatorio al final de CADA tarea completada** — no dejar commits locales pendientes.

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
2. El `app.asar` fue reempaquetado y desplegado a AMBAS instalaciones:
   - `C:\Users\user\Desktop\Class BIT\resources\app.asar`
   - `C:\Users\user\Desktop\Class-BIT\Class BIT\resources\app.asar`
   - (empaquetar con staging en temp: main.js, preload.js, package.json, holidays.js, assets/, renderer/)
3. La app fue reiniciada con los cambios (cerrar procesos "Class BIT" antes de sobrescribir el asar).
4. Commit + push realizados según la regla principal.

## Estructura del proyecto

- Fuentes del repo: `main.js`, `preload.js`, `holidays.js`, `renderer/`, `assets/`, `package.json`
- Instalación en uso por el usuario: `C:\Users\user\Desktop\Class BIT`
- Datos de la app (NO versionar): `%APPDATA%\class-bit\schedule-data.json`
- Remoto: https://github.com/sarmientordev/Class-BIT (rama `main`)
