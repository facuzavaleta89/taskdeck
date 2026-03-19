# Guía de Despliegue - TaskDeck

¡Tu proyecto **TaskDeck** ya es *production-ready*! No necesitás modificar ninguna línea de código ya que todas las redirecciones utilizan `window.location.origin` y cabeceras dinámicas.

A continuación, los únicos **3 pasos manuales** que debés seguir para su despliegue en Vercel y Supabase.

## 1. Variables de Entorno en el Hosting (Vercel)
Cuando crees el proyecto en tu hosting conectando tu repositorio de GitHub, configurá las siguientes variables de entorno (las mismas de tu `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL` (La URL de tu base de datos)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (La clave pública)

*(Recordá NO subir tu archivo `.env.local` a GitHub. Vercel tiene un apartado específico de Settings > Environment Variables donde tenés que pegarlas).*

## 2. Configurar la URL en Supabase Authentication
Supabase necesita conocer el dominio "real" de la app para permitir la generación de tokens seguros de OAuth (Google) y enviar correos de invitación.

1. Entrá a tu **Supabase Dashboard** > Entrá a tu proyecto > **Authentication** > **URL Configuration**.
2. **Site URL:** Cambiá el actual `http://localhost:3000` por el dominio real que te asigne Vercel (ej: `https://taskdeck.vercel.app`).
3. **Redirect URLs:** Agregá una url en la *allowlist* con este formato exacto: `https://tu-dominio.vercel.app/auth/callback` (adicionalmente podés agregar un comodín genérico como `https://tu-dominio.vercel.app/*`). De esta forma Supabase no va a rebotar los inicios de sesión.

## 3. Configurar tu Consola de Google OAuth (Google Cloud)
Como integraste el botón "Continuar con Google", es necesario autorizar tu nuevo dominio de producción en la consola de Google.

1. Entrá a tu **Google Cloud Console** > **APIs & Services** > **Credentials**.
2. Entrá a las credenciales OAuth 2.0 Client ID que creaste para Supabase.
3. En la sección **Orígenes de JavaScript autorizados** (*Authorized JavaScript origins*), agregá tu nuevo dominio de Vercel: `https://tu-dominio.vercel.app`.
4. *(Nota: No deberías necesitar cambiar las "URL de redireccionamiento autorizadas" ya que esas siempre apuntarán a la URL de tu proyecto de Supabase, el cual se encarga del redireccionamiento final)*.

> **¡Y listo!** 🚀
> Asegurate de probar que tu build compila correctamente en local corriendo `npm run build` antes de tu *commit* final. ¡Muchos éxitos con el proyecto!
