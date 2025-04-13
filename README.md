# Inventario Lina Uribe

Sistema de gestión de inventario para productos de maquillaje y servicios relacionados.

## Requisitos Previos

- Node.js (v14 o superior)
- npm (v6 o superior)

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/inventario-lina-uribe.git
cd inventario-lina-uribe
```

2. Instala las dependencias:
```bash
npm run install-all
```

## Uso

Para iniciar el proyecto en modo desarrollo:
```bash
npm run dev
```

El cliente estará disponible en `http://localhost:5173`
El servidor estará disponible en `http://localhost:5000`

## Estructura del Proyecto

```
inventario-lina-uribe/
├── client/               # Frontend React + TypeScript
├── server/              # Backend Express + TypeScript
├── package.json         # Scripts y dependencias principales
└── README.md           # Este archivo
```

## Scripts Disponibles

- `npm run dev`: Inicia tanto el cliente como el servidor en modo desarrollo
- `npm run client`: Inicia solo el cliente
- `npm run server`: Inicia solo el servidor
- `npm run build`: Construye tanto el cliente como el servidor
- `npm run install-all`: Instala todas las dependencias

## Tecnologías Utilizadas

- Frontend: React, TypeScript, Vite, TailwindCSS
- Backend: Node.js, Express, TypeScript
- Base de Datos: Archivo JSON (en memoria)