# Class BIT v1.2.4

## Ajuste visual — malla semanal más limpia y menos dispersa

- **Malla por horas enteras**: las casillas ya no se dividen en bloques de 15 min; ahora cada fila es **1 hora cerrada** (18:00, 19:00, 20:00…), lo que la hace mucho más compacta y evita que se vea dispersa.
- Se eliminó la "exactitud" de minutos en el posicionamiento: cada clase ocupa un número entero de bloques de hora según su duración.
- Las clases contiguas (como las 2 del lunes) se empalman una tras otra sin superponerse.
- El chip de cada clase sigue mostrando **la hora real** (ej. 18:45 – 20:15) y su salón, solo cambia la cuadrícula base a horas redondeadas.
- Ajuste del alto de fila (40px) para que las tarjetas se lean cómodas sin alargar la malla.

## Instalación

- Descarga `Class-BIT-Setup-1.2.4.exe` e instala sobre tu versión actual.
- (Opcional) Revisa `release-notes.md` en el repo para el historial de cambios.
