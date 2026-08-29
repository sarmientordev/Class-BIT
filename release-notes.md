# Class BIT v1.2.5

## Fix — cierre de la malla semanal coherente

- Todas tus clases terminan a las **21:45**, pero la malla por horas cerradas mostraba cierres **inconsistentes**: los días de una sola clase llegaban a las **21:00** y los días de dos clases se estiraban **hasta las 22:00**.
- **Corregido**: ahora cualquier clase usa el mismo criterio de cierre (hasta la hora en punto que toca su fin), así **todos los días terminan a las 21:00** de forma uniforme.
- El horario se ve ordenado: lunes, martes, miércoles, jueves y viernes cierran a la misma hora, sin estirones raros.
- El chip de cada clase sigue mostrando su hora real (ej. 18:45 – 21:45) y su salón.

## Instalación

- Descarga `Class-BIT-Setup-1.2.5.exe` e instala sobre tu versión actual.
- (Opcional) Revisa `release-notes.md` en el repo para el historial de cambios.
