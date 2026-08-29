# Class BIT v1.2.0 — Tus clases nunca se pierden al actualizar

## Migracion automatica de datos
- Al instalar una version nueva, tu horario se **adapta solo** a la nueva version: la app detecta el formato antiguo y lo migra sin borrar nada.
- Adios al susto de abrir la app y ver las clases vacias despues de actualizar el .exe.

## Backup automatico
- Antes de cada cambio, la app guarda una copia de seguridad de tu horario (`schedule-data.bak.json`).
- Si el archivo principal se corrompe o una version vieja lo resetea, la app **restaura automaticamente** desde el backup y conserva el archivo danado aparte (`.corrupt.json`) por si acaso.

## Como funcionan las 3 capas de proteccion
1. **Migracion**: formato viejo a nuevo automatico.
2. **Backup**: copia de seguridad antes de cada guardado.
3. **Auto-restauracion**: datos recuperados solos si algo falla.

Tus clases, temas y ajustes quedan seguros en todas las versiones.

## Countdown de la proxima clase con paleta de colores
- El contador de la proxima clase cambia de color segun las horas que faltan (verde -> amarillo -> naranja -> rojo), como una bateria que se descarga.
- **Ajuste**: el rojo puro se alcanza a partir de ~2-3 horas restantes, y en la ultima hora el contador entra en rojo profundo para avisar que la clase esta por comenzar.

## Malla semanal: prioridad a los dias con clase
- En la vista de semana, los dias que tienen clases ocupan mas ancho, mientras que los dias sin clase (por ejemplo sabado y domingo) se ven mas angostos.
- Si agregas una clase a un dia que estaba vacio, esa columna se expande sola al tamaño de los dias con clase (y viceversa).
- Esto aprovecha mejor el espacio: cada horario se adapta a las materias reales de cada persona, sin desperdiciar espacio en dias sin clases.

## Compatibilidad
Todas las novedades se adaptan a cada tema (PIXEL, OSCURO, CLARO, CYBER FOREST, SYNTHWAVE CITY y SPIDER-VERSE).

## Como actualizar
Descarga **Class-BIT-Setup-1.2.0.exe**. Tus clases y configuraciones se conservan y se migran automaticamente.
