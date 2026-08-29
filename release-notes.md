# Class BIT v1.2.6

## Fix — todos los días cierran hasta el fondo de la malla

- Antes, los días con 2 clases (lunes y jueves) llegaban hasta el fondo de la malla, pero los días con 1 sola clase larga (martes y miércoles) se quedaban cortos y no llegaban hasta abajo, aunque también terminan a las **21:45**.
- **Corregido**: ahora el **último bloque de cada día se estira hasta la hora en punto que toca su fin real**, así todos los días —lunes, martes, miércoles, jueves y viernes— cierran **hasta el fondo** de la cuadrícula, de forma pareja.
- Sin importar si el día tiene 1 o 2 clases, la malla termina alineada en la misma fila.
- El chip de cada clase sigue mostrando su hora real (ej. 18:45 – 21:45) y su salón.

## Instalación

- Descarga `Class-BIT-Setup-1.2.6.exe` e instala sobre tu versión actual.
- (Opcional) Revisa `release-notes.md` en el repo para el historial de cambios.
