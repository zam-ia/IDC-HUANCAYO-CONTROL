# Despliegue de medios

## Aplicación de control

1. Copia `.env.example` a `.env.local` y completa solo valores del entorno.
2. Aplica, en orden, `supabase/migrations/202609080001_media_platform.sql` y `supabase/migrations/202609090002_mux_simulcast.sql`.
3. Configura en Mux el webhook `https://TU_DOMINIO_CONTROL/api/webhooks/mux` y usa el mismo `MUX_WEBHOOK_SECRET` en el proyecto Vercel de control.
4. Agrega `ENCRYPTION_KEY` en Vercel con un valor aleatorio de al menos 32 caracteres. No cambies este valor después de guardar destinos o dejarán de poder descifrarse.
5. Configura cada red desde `/admin/medios` del proyecto de control; las URLs y claves se guardan cifradas en Supabase.
6. Configura `AZURACAST_BASE_URL`, `AZURACAST_STATION_SHORTCODE` y `AZURACAST_PUBLIC_STREAM_URL`.
7. Ejecuta `npm run lint` y `npm run build` antes de promover a producción.

## Relay SRS (contingencia opcional)

La operación normal no necesita VPS, SRS ni FFmpeg: OBS envía una señal a Mux y Mux hace el simulcast. Si en el futuro se requiere un relay independiente:

1. Provisiona un VPS con IP estable, Docker, TLS y firewall.
2. Copia `infra/relay`, ejecuta `docker compose up -d` y verifica el health check.
3. Expón 1935/RTMP solo a las IP necesarias. Mantén 1985 privado.
4. Implementa workers FFmpeg por destino desde un controlador autenticado. Un worker fallido no debe detener los demás.
5. Guarda URLs y stream keys en un secret manager del VPS, nunca en Git ni en variables `NEXT_PUBLIC_*`.

## AzuraCast

Instala AzuraCast siguiendo su instalador oficial en un VPS con volumen persistente. Crea cuentas DJ individuales, playlists por franja y una rotación AutoDJ. Publica únicamente el mount de escucha y la API pública de Now Playing. Mantén la API administrativa y los backups fuera del cliente web.
