# Guía rápida para el operador de OBS

## Configuración inicial (una sola vez)

Una persona con acceso al proyecto `IDC-HUANCAYO-CONTROL` debe agregar en **Vercel → Project Settings → Environment Variables**:

- `MUX_TOKEN_ID`
- `MUX_TOKEN_SECRET`
- `MUX_WEBHOOK_SECRET`
- `ENCRYPTION_KEY` (valor aleatorio de al menos 32 caracteres)
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

En Mux debe registrar el webhook del dominio de control, `https://TU-DOMINIO-CONTROL/api/webhooks/mux`, y copiar su secreto a `MUX_WEBHOOK_SECRET`. Las credenciales permanentes nunca se escriben en OBS ni se muestran en el navegador.

Para la radio se agregan `AZURACAST_BASE_URL`, `AZURACAST_STATION_SHORTCODE` y `AZURACAST_PUBLIC_STREAM_URL`.

## Cada transmisión

1. Entra a `/admin/medios` y verifica que las redes necesarias figuren como **Activas**.
2. Completa “Nueva transmisión con OBS” y marca los destinos de este evento.
3. Pulsa **Crear señal para OBS**.
4. En OBS abre **Ajustes → Emisión**.
5. Selecciona **Servicio: Personalizado**.
6. Copia el servidor RTMPS y la clave que entrega el panel.
7. Controla cámaras, micrófonos y escenas desde OBS.
8. Pulsa **Iniciar transmisión** en OBS.

Mux notificará a la web cuando la señal empiece y termine, y reportará el estado de cada red por separado. El operador no necesita configurar múltiples salidas en OBS ni cambiar manualmente el estado salvo en una contingencia.

## Recomendación de salida

- Resolución: 1920×1080 o 1280×720 si la conexión es limitada.
- Video: H.264, fotogramas clave cada 2 segundos.
- Audio: AAC, 48 kHz.
- Usa conexión por cable y activa grabación local en MKV.

La llave de transmisión se muestra una sola vez. Guárdala en el perfil de OBS y no la envíes por chat.

Las llaves sociales se administran en **Centro de medios → Destinos de multitransmisión**. No se escriben en OBS. Instagram y TikTok pueden entregar llaves temporales; actualízalas antes de crear el evento si la plataforma las renovó.
