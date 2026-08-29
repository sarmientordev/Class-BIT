# Class BIT v1.2.1 — Mejoras visuales en la malla semanal y el countdown

## Malla semanal: prioridad a los dias con clase
- En la vista de semana, los dias que tienen clases ocupan mas ancho, mientras que los dias sin clase (por ejemplo sabado y domingo) se ven mas angostos.
- Si agregas una clase a un dia que estaba vacio, esa columna se expande sola al tamaño de los dias con clase (y viceversa).
- Esto aprovecha mejor el espacio: cada horario se adapta a las materias reales de cada persona, sin desperdiciar espacio en dias sin clases.

## Countdown de la proxima clase con paleta de colores
- El contador de la proxima clase cambia de color segun las horas que faltan (verde -> amarillo -> naranja -> rojo), como una bateria que se descarga.
- **Ajuste**: el rojo puro se alcanza a partir de ~2-3 horas restantes, y en la ultima hora el contador entra en rojo profundo para avisar que la clase esta por comenzar.

## Viene desde 1.2.0: tus clases nunca se pierden al actualizar
- **Migracion automatica de datos**: al instalar una version nueva, tu horario se adapta solo al nuevo formato sin borrar nada.
- **Backup automatico** (`schedule-data.bak.json`) y **auto-restauracion**: si el archivo principal se corrompe o una version vieja lo resetea, la app restaura los datos sola y conserva el danado aparte (`.corrupt.json`).

## Compatibilidad
Todas las novedades se adaptan a cada tema (PIXEL, OSCURO, CLARO, CYBER FOREST, SYNTHWAVE CITY y SPIDER-VERSE).

## Como actualizar
Descarga **Class-BIT-Setup-1.2.1.exe**. Tus clases y configuraciones se conservan y se migran automaticamente.
