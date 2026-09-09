# IDC Huancayo Control

Aplicación administrativa independiente para operar el sitio, el aula virtual, la radio y las transmisiones de IDC Huancayo.

El proyecto está separado del sitio público para reducir su superficie de ataque, aislar despliegues y ofrecer una interfaz clara al equipo que opera OBS. No aloja ni procesa el video: OBS envía una sola señal RTMPS a Mux y Mux la distribuye a la web y a los destinos sociales seleccionados.

## Módulos incluidos

- Inicio de sesión exclusivo para cuentas `admin` o `superadmin`.
- Dashboard responsive con estado de Supabase, Mux, webhook y bóveda cifrada.
- Centro de medios con asistente de configuración para OBS.
- Destinos cifrados para YouTube, Facebook, Instagram y TikTok.
- Monitoreo individual de estados de simulcast mediante webhooks de Mux.
- Gestión de radio y parrilla de AzuraCast.
- Gestión heredada de noticias, devocionales, testimonios, cursos, alumnos, certificados y configuración.
- Auditoría de creación de señales, cambios de estado y credenciales rotadas.

## Arquitectura

```text
IDC-HUANCAYO-CONTROL (privado) ──administra──> Supabase
                │                                ▲
                ├──crea señal/destinos──> Mux ──webhooks
                └──supervisa────────────> AzuraCast

OBS ──una salida RTMPS──> Mux ──> idc-huancayo.vercel.app/en-vivo
                              ├─> YouTube
                              ├─> Facebook
                              ├─> Instagram
                              └─> TikTok

IDC-HUANCAYO (público) ──sólo lectura pública──> Supabase / Mux / AzuraCast
```

## Desarrollo local

Requiere Node.js 22 o superior.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Completa `.env.local` con credenciales de desarrollo. Los archivos `.env*` están ignorados excepto `.env.example`.

## Variables de entorno

| Variable                        | Exposición | Propósito                                |
| ------------------------------- | ---------- | ---------------------------------------- |
| `NEXTAUTH_URL`                  | servidor   | URL del despliegue de control            |
| `NEXTAUTH_SECRET`               | servidor   | firma de sesiones administrativas        |
| `NEXT_PUBLIC_MAIN_SITE_URL`     | pública    | enlace al sitio que administra           |
| `NEXT_PUBLIC_SUPABASE_URL`      | pública    | URL del proyecto compartido              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | pública    | cliente Supabase limitado por RLS        |
| `SUPABASE_SERVICE_ROLE_KEY`     | servidor   | operaciones administrativas              |
| `MUX_TOKEN_ID`                  | servidor   | creación de señales Mux                  |
| `MUX_TOKEN_SECRET`              | servidor   | autenticación Mux                        |
| `MUX_WEBHOOK_SECRET`            | servidor   | validación de webhooks Mux               |
| `ENCRYPTION_KEY`                | servidor   | cifrado AES-256-GCM de destinos sociales |
| `AZURACAST_*`                   | servidor   | estado, reproducción y gestión de radio  |

`ENCRYPTION_KEY` debe contener al menos 32 caracteres aleatorios y no debe cambiarse después de guardar destinos, salvo que se vuelvan a cargar todas las credenciales.

## Base de datos

Aplica las migraciones en orden:

1. `supabase/migrations/202609080001_media_platform.sql`
2. `supabase/migrations/202609090002_mux_simulcast.sql`

La segunda migración crea una bóveda de destinos sin políticas de lectura para clientes. Solamente el servidor con `service_role` puede leer los valores cifrados.

## Despliegue en Vercel

1. Importa `zam-ia/IDC-HUANCAYO-CONTROL` como un proyecto nuevo.
2. Configura Node.js 22 y todas las variables anteriores en Production.
3. Despliega y conserva temporalmente el webhook anterior de Mux.
4. Cuando el panel nuevo esté verificado, cambia Mux a `https://TU-DOMINIO-CONTROL/api/webhooks/mux`.
5. Ejecuta una transmisión privada de prueba antes del primer evento público.
6. Convierte la repo a privada cuando finalice la conexión inicial.

## Operación diaria

1. Entra a `/admin/medios`.
2. Actualiza llaves temporales de Instagram o TikTok si la plataforma las renovó.
3. Crea la transmisión y marca los destinos necesarios.
4. Copia en OBS el servidor RTMPS y la clave mostrada una sola vez.
5. Inicia OBS y observa cada destino en `/admin/transmisiones`.
6. Al terminar, detén OBS y confirma que las salidas aparezcan como finalizadas.

## Seguridad

- Nunca se deben subir archivos `.env`, claves de Mux, service roles o stream keys.
- La aplicación no ofrece registro público.
- El inicio de sesión valida contraseña, estado activo y rol administrativo en el servidor.
- Las credenciales sociales se cifran antes de llegar a Supabase y nunca se devuelven al navegador.
- El webhook rechaza mensajes con firma inválida o antigüedad superior a cinco minutos.
- El repositorio puede permanecer público durante la instalación porque sólo contiene nombres de variables vacíos; se recomienda convertirlo en privado antes de iniciar operaciones reales.

Más detalles en [docs/multitransmision-mux.md](docs/multitransmision-mux.md) y [docs/guia-operador-obs.md](docs/guia-operador-obs.md).
