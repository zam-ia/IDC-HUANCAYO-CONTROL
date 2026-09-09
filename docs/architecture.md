# Arquitectura del centro de control

IDC Huancayo utiliza dos aplicaciones independientes. `IDC-HUANCAYO` sirve el sitio y el aula; `IDC-HUANCAYO-CONTROL` concentra la autenticación administrativa, las mutaciones, Mux, los webhooks y la operación de radio. Ambas comparten Supabase como fuente de datos.

La señal de producción sale una sola vez desde OBS directamente a Mux mediante RTMPS. Mux entrega el video HLS al sitio público y distribuye la misma señal a cada destino social habilitado. Sus webhooks llegan al proyecto de control y actualizan en Supabase tanto el estado general como el estado individual de YouTube, Facebook, Instagram y TikTok.

La radio funciona como un subsistema separado. AzuraCast se despliega en un VPS, mantiene AutoDJ e Icecast y permite la entrada de locutores. La aplicación consume únicamente su API pública de Now Playing y la URL pública del mount. El reproductor de audio vive en el layout raíz para continuar sonando durante la navegación.

```text
OBS/vMix ──una señal RTMPS──> Mux ──> Web /en-vivo
                              ├─────> YouTube
                              ├─────> Facebook
                              ├─────> Instagram
                              └─────> TikTok

Cabina/DJ ───────────> AzuraCast ───> Web /radio + player persistente

Mux/AzuraCast ───────> IDC Control APIs ─> Supabase estado agenda logs

IDC sitio/aula ──────> Supabase/Mux/AzuraCast (lectura pública)
```

## Límites de despliegue

- Vercel aloja dos proyectos Next.js separados, no el video ni AzuraCast. Mux recibe y distribuye la señal de video.
- `MUX_TOKEN_SECRET`, stream keys, credenciales sociales y `AZURACAST_API_KEY` son secretos de servidor.
- `social_stream_destinations` guarda la URL y la clave cifradas con AES-256-GCM. Su RLS no concede acceso a clientes; sólo el servidor con service role puede leerla.
- `live_destinations` guarda referencias y estados operativos, nunca el valor de una stream key.
- `ENCRYPTION_KEY` permanece únicamente en Vercel y debe tener al menos 32 caracteres aleatorios.
- El relay SRS de `infra/relay` queda como contingencia opcional, no forma parte del camino principal.

## Componentes implementados

- El sitio público conserva `/en-vivo`, `/radio`, el aula y el contenido institucional.
- `/admin/transmisiones` y `/admin/radio` con autorización en servidor y audit log.
- `/api/webhooks/mux` vive en el centro de control y valida cada firma.
- Configuración guiada y cifrada de destinos sociales desde `/admin/medios`.
- Webhooks de Mux para estados `preparado`, `conectando`, `en vivo`, `error` y `finalizado` por destino.
- Migraciones Supabase con RLS para eventos, destinos, medios, radio, secretos cifrados y auditoría.
