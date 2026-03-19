# TaskDeck (Trello Clone)

TaskDeck es una aplicación de gestión de proyectos al estilo Trello. Permite organizar tareas en tableros, listas y tarjetas de manera interactiva con funcionalidad de arrastrar y soltar (drag and drop).

## 🚀 Stack Tecnológico

- **Framework:** [Next.js](https://nextjs.org/) (Versión 16)
- **Librería UI:** [React](https://react.dev/) (Versión 19)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (Versión 4)
- **Base de Datos & Autenticación:** [Supabase](https://supabase.com/)
- **Drag & Drop:** [dnd-kit](https://dndkit.com/)
- **Mails:** [Resend](https://resend.com/)

## 📦 Dependencias Principales

- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` para la lógica de arrastrar y soltar.
- `@supabase/ssr` y `@supabase/supabase-js` para la gestión de usuarios y base de datos (PostgreSQL).
- `lucide-react` para la iconografía limpia y moderna.
- `clsx` y `tailwind-merge` para la gestión dinámica de clases de Tailwind.

## 💻 Instalación y Uso

1. Clonar el repositorio e ingresar a la carpeta `taskdeck`.
2. Ejecutar `npm install` para instalar las dependencias requeridas.
3. Configurar las variables de entorno en un archivo `.env` o `.env.local` con tus credenciales de Supabase.
4. Ejecutar `npm run dev` para iniciar el servidor de desarrollo local.
