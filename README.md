# 🎮 Class BIT

Horario universitario estilo **pixel art** para PC (Electron), con notificaciones de clases y festivos de Colombia.

## ✨ Características

- 📅 Horario semanal (Lunes a Sábado)
- 🏫 Agrega, edita y elimina clases con salón, profesor y colores
- ⏰ Notificaciones automáticas 1 hora antes de cada clase
- 🎉 Avisos de festivos en Colombia
- 🎨 3 temas visuales pixel art
- 💾 Datos guardados localmente

## 🚀 Instalación (para usuarios)

1. Descarga el instalador **Class-BIT-Setup-1.0.0.exe** desde [Releases](../../releases)
2. Ejecútalo e instala
3. Listo: se crea acceso directo en el escritorio y en el menú inicio

## 🛠 Desarrollo

Requiere [Node.js](https://nodejs.org) (v18+).

```bash
npm install
npm start
```

Para generar el instalador de Windows:

```bash
npm run dist
```

El instalador queda en la carpeta `dist/`.

## 📂 Estructura

```
main.js      → Proceso principal de Electron (ventana, bandeja, notificaciones)
preload.js   → Puente seguro con el renderer
renderer/    → Interfaz HTML/CSS/JS
holidays.js  → Festivos de Colombia
assets/      → Iconos
```

## 📄 Licencia

MIT