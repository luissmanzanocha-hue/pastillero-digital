# Pastillero Digital v2

Sistema de gestión de medicamentos para residentes en centros de cuidado.

## Características

- ✅ **Gestión de Residentes** - CRUD completo de residentes
- ✅ **Kardex de Medicamentos** - Sistema dual de dosificación (fracciones y mg)
- ✅ **Inventario Inteligente** - Cálculos automáticos de uso diario y días restantes
- ✅ **Alertas de Stock** - Notificaciones de stock bajo
- ✅ **Diseño Moderno** - Glassmorphism con gradientes vibrantes
- ✅ **Persistencia de Datos** - LocalStorage para guardar información

## Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build
```

## Uso

1. **Agregar Residentes**: Desde la página de Residentes, crea nuevos perfiles
2. **Gestionar Medicamentos**: Accede al Kardex de cada residente para agregar medicamentos
3. **Controlar Inventario**: Monitorea el stock y ajusta cantidades desde el Inventario
4. **Dosificación Flexible**: Elige entre fracciones de pastilla (1/4, 1/2, 3/4, 1) o dosis en mg

## Tecnologías

- React 18
- React Router v6
- Vite
- Lucide React (iconos)
- CSS moderno con variables personalizadas

## Estructura del Proyecto

```
src/
├── components/
│   ├── common/          # Componentes reutilizables
│   ├── layout/          # Layout y navegación
│   ├── residents/       # Componentes de residentes
│   └── kardex/          # Componentes de medicamentos
├── pages/               # Páginas de la aplicación
├── context/             # Context API para estado global
├── utils/               # Utilidades y helpers
└── index.css           # Estilos globales
```

## Licencia

MIT
