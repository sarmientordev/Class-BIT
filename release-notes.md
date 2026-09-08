# Class BIT v1.5.0

## Rediseño — El libro es CUADERNO 8-BITS con pasta y volumen horizontal 📖

- El libro de recordatorios abre como un **cuaderno con pasta roja 8-bit** dentro de la mini ventana, **idéntico al concepto `cuaderno-concept.html`**.
- A la vista (libro abierto): **2 hojas de papel crema** (izquierda y derecha) con cantos de hojas apiladas en 3D a cada lado, **espiral central con 9 anillas metalizadas**, **marcapáginas azul** y banda dorada en la tapa.
- Botonera estilo máquina arcade: **◀ VOLVER · 📓 LIBRO DE TAREAS Y PENDIENTES** arriba; abajo **LIMPIAR HECHOS · ◀ · HOJA X/Y · ▶ · LISTO ▶**.
- Renglones de papel con 5 pendientes por hoja (10 por vista): el lleno trae check ○/✓, texto y fecha; el vacío es un recuadro punteado con **recuadro rojo "+"** que rota al pasar el cursor. El formulario de nueva tarea es una **form-box roja** con borde negro y inputs pixel (VT323).
- Paginación en "HOJAS" con volteo 3D y contador **HOJA X/Y** (antes PÁG.). Se corrige además un error que rompía el contador al abrir el libro (`totalPages` no definido → `totalSpreads`).
- Horas de la malla en **amarillo papel** y más grandes para distinguirlas en todos los temas.
- La **versión web** (class-bit-web) se actualizó igual.

## Actualización (junio 2026)

- **Sistema de CORRIDO**: se eliminó el botón "➕ NUEVA TAREA" de la barra superior. Ahora el botón **"➕ NUEVA TAREA" vive dentro del PRIMER SLOT vacío** (estilo grande, rojo sobre fondo crema). Al agregar, las tareas **se corren hacia abajo** y siguen hasta pasar a la siguiente hoja de forma automática (el libro voltea solo cuando la hoja queda llena).
- **Paginador con flechas animadas**: los botones "◀ ANTERIOR"/"SIGUIENTE ▶" se reemplazaron por **flechas pixel ◀ ▶** que brillan en cian al pasar el cursor y "navegan" hacia el lado con el volteo 3D de hoja, manteniendo el contador HOJA X/Y.
- **Fix**: cuando el libro está vacío, el velo "Tu libro está vacío" tapaba el botón + del slot 1 y no dejaba agregar nada. Ahora el botón **"➕ NUEVA TAREA" del primer slot es la puerta de entrada** cuando el libro está vacío (siempre visible y clicable) y el velo informativo ya no bloquea nunca.
- **Botón de agregar más limpio**: el botón "➕ NUEVA TAREA" ahora aparece **solo en el primer slot libre DESPUÉS del último pendiente** (los demás renglones vacíos ya no se dibujan). Se va moviendo hacia abajo conforme se agregan tareas, y al llenar una hoja el libro voltea solo a la siguiente.
- **Corregido el diseño de los 10 slots**: se restauraron los **5 slots por hoja siempre visibles** (10 por libro). Las tareas llenan los renglones sucesivamente desde arriba (sin huecos ni "separados") y el botón "➕ NUEVA TAREA" queda justo debajo de la última tarea, corriéndose hacia abajo al agregar.
- **Corregido pasar de hoja al llenar las 10**: cuando la hoja queda completa, la flecha ▶ ahora permite pasar a la hoja nueva (HOJA 2/2) donde el botón sigue debajo de la última tarea (slot 11) y el corrido continúa hacia la siguiente página.
- La **versión web** (class-bit-web) se actualizó igual (deploy automático en Vercel).

## Instalación

- Descarga `Class-BIT-Setup-1.5.0.exe` e instala sobre tu versión actual.
- (Opcional) Revisa `release-notes.md` en el repo para el historial de cambios.

---

# Class BIT v1.4.0

## Rediseño — Cuaderno como un libro real 📖

- El cuaderno de recordatorios ahora se abre como un **libro de 2 hojas** (vista de cuaderno abierto).
- Cada hoja guarda **5 pendientes** (10 por vista): 5 a la izquierda y 5 a la derecha, apilados de arriba a abajo.
- Si hay **más de 10 pendientes**, aparecen las **flechas ◀ ▶ para pasar de página** con una **animación de volteo de hoja**.
- Indicador de **página actual (PÁG. X/Y)** y número de página en cada hoja; las flechas se desactivan al llegar al inicio/final.
- Cada hoja tiene diseño de cuaderno: encuadernación con argollas al centro, cabecera de página y entradas con línea punteada.
- Mismo flujo en 2 pasos: al abrir ves el libro, y con "➕ AGREGAR ACTIVIDAD" entras al formulario.
- Marcado ✓ / desmarcado ○ / eliminación ✕, "LIMPIAR HECHOS" y guardado automático intactos.
- La **versión web** (class-bit-web) se actualizó igual.

## Instalación

- Descarga `Class-BIT-Setup-1.4.0.exe` e instala sobre tu versión actual.
- (Opcional) Revisa `release-notes.md` en el repo para el historial de cambios.

---

# Class BIT v1.3.0

## Nuevo — Cuaderno de recordatorios 📓

- Nuevo botón **"Cuaderno de recordatorios"** (📓) en el header, junto a notificar/ajustes/agregar clase.
- Abre un **libro** donde puedes anotar tareas, trabajos, exámenes o cualquier pendiente, cada uno con:
  - **Texto** del pendiente.
  - **Tipo**: TAREA 📚, TRABAJO 📄, EXAMEN 📝 o PENDIENTE ⏳.
  - **Fecha** (opcional) para organizar por día.
- Cada recordatorio se muestra en una tarjeta con su tipo y fecha, ordenados por fecha.
- Puedes **marcarlo como hecho** (✓), **desmarcarlo** (○) o **eliminarlo** (✕).
- Botón **"LIMPIAR HECHOS"** para quitar de golpe todos los pendientes ya completados.
- Se **guarda automáticamente** en tus datos (schedule-data.json), como las clases.
- Cierra con la ✕, con "LISTO ▶", pulsando fuera del cuadro o con la tecla **Escape**.
- La **versión web** (class-bit-web) también incluye esta feature: en PC el botón 📓 está en el header y en móvil dentro del menú ☰.

## Instalación

- Descarga `Class-BIT-Setup-1.3.0.exe` e instala sobre tu versión actual.
- (Opcional) Revisa `release-notes.md` en el repo para el historial de cambios.
