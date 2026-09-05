# Class BIT v1.5.0

## Rediseño — La ventana ES el libro (pantalla completa 8-bit) 📖

- El libro de recordatorios ahora ocupa **toda la ventana**: al abrirlo, la ventana completa se convierte en el libro (sin caja modal).
- Estética **8-bit / arcade**: cabecera y barra inferior estilo maquinita (títulos pixelados, botones con biseles duros), papel de cuaderno con líneas y encuadernación tipo bizcocho al centro.
- El libro se escala para **llenar la ventana** en vertical, manteniendo las 2 hojas y la paginación ◀ ▶ con volteo.
- Borde fosforescente cyan alrededor del libro y sombras duras pixeladas, acorde a la estética Pixel/Spider.
- Botón **◀ VOLVER** arriba a la izquierda y **🅸AGREGAR (➕)** arriba a la derecha; abajo: "LIMPIAR HECHOS", paginador y "LISTO ▶".
- Flujo en 2 pasos intacto: "+" abre el formulario de nueva actividad a pantalla completa.
- La **versión web** (class-bit-web) se actualizó igual y se ve igual en escritorio y móvil.

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
