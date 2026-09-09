# Multitransmisión: OBS → Mux → web y redes sociales

## Resultado operativo

OBS mantiene una sola salida. El operador controla cámaras, audio, transiciones y escenas, y envía la mezcla final a Mux mediante RTMPS. Al crear la señal desde `/admin/medios`, el sistema registra en Mux los destinos elegidos. No se requieren plugins de multistream, varias instancias de OBS ni un VPS intermedio.

Mux reproduce la señal en `/en-vivo` y puede enviarla simultáneamente a YouTube, Facebook, Instagram y TikTok. Mux admite hasta seis destinos de simulcast por live stream.

## Configuración inicial del sistema

1. Aplica las dos migraciones de medios en Supabase.
2. En Vercel configura `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `MUX_WEBHOOK_SECRET` y `ENCRYPTION_KEY`.
3. En Mux configura el webhook del proyecto separado: `https://TU-DOMINIO-CONTROL/api/webhooks/mux`.
4. Entra como administrador a `/admin/medios`.
5. En cada tarjeta social pega la URL RTMP/RTMPS y la clave entregadas por la plataforma, marca **Incluir por defecto** y guarda.

El sistema cifra cada URL y clave con AES-256-GCM antes de guardarla. El navegador sólo recibe si un destino está configurado, activo y cuándo se actualizó. No recibe el valor cifrado ni el valor original.

## Dónde obtener los datos

### YouTube

En YouTube Studio abre **Crear → Emitir en directo**. Dentro de la configuración del stream copia la URL del servidor y la clave. La primera habilitación de emisiones puede requerir espera. Una clave reutilizable evita cambiarla en cada evento, pero debe tratarse como contraseña.

Guía oficial: <https://support.google.com/youtube/answer/2907883>

### Facebook

Abre Live Producer, elige **Software de streaming** y copia la URL del servidor y la clave. Si Facebook ofrece una clave persistente y la cuenta la tiene habilitada, úsala para simplificar la operación. Confirma siempre el público y el título dentro de Facebook antes de salir al aire.

### Instagram

Desde Instagram en escritorio abre **Crear → Video en vivo** y obtén la URL y la clave. La disponibilidad y duración de la clave dependen de la cuenta. Si Instagram genera una clave nueva, actualízala en el panel antes de crear la señal de Mux.

### TikTok

La cuenta debe tener acceso a LIVE y a transmisión mediante software. En el Centro LIVE copia el servidor y la clave. El acceso depende de la cuenta y la región; si TikTok no muestra estos datos, Mux no puede habilitarlos por su cuenta.

Información oficial de acceso: <https://www.tiktok.com/live/studio/help/article/Before-you-go-LIVE/Apply-for-LIVE-access?lang=es>

## Cada evento

1. Abre previamente los paneles de YouTube, Facebook, Instagram y TikTok, completa título, privacidad y audiencia, y obtiene llaves nuevas donde corresponda.
2. Actualiza en `/admin/medios` cualquier llave que haya cambiado.
3. Completa **Nueva transmisión con OBS** y desmarca únicamente las redes que no participarán.
4. Crea la señal. El panel muestra el servidor RTMPS de Mux y una clave de OBS una sola vez.
5. En OBS usa **Servicio: Personalizado**, pega esos dos valores e inicia la transmisión de prueba.
6. Observa `/admin/transmisiones`: cada salida cambia entre Preparado, Conectando, En vivo, Error y Finalizado.
7. Verifica audio y video desde otro dispositivo antes de comenzar el programa.
8. Al terminar, detén OBS y espera a que el panel muestre Finalizado.

## Qué ocurre si una red falla

Cada destino es independiente. Un error de TikTok no debe detener YouTube, Facebook, Instagram ni `/en-vivo`. El webhook registra el destino afectado y si Mux lo clasificó como normal o fatal. Un error fatal suele requerir revisar la URL, renovar la llave o confirmar que la cuenta tenga permiso de emisión.

## Costos y límites

Mux factura el video en vivo por uso y añade el consumo de simulcast de cada destino; no debe asumirse que un pago mensual fijo vuelve ilimitadas las emisiones. Revisa duración, calidad y cantidad de destinos en la calculadora oficial antes de eventos largos: <https://www.mux.com/pricing>

## Seguridad

- Nunca publiques llaves en GitHub, WhatsApp, capturas ni variables `NEXT_PUBLIC_*`.
- No cambies `ENCRYPTION_KEY` sin volver a cargar todas las credenciales sociales.
- Rota inmediatamente una llave que se haya compartido por error.
- La clave de OBS que crea Mux se muestra una sola vez y debe guardarse únicamente en el perfil seguro de OBS.
- Usa una transmisión de prueba privada antes del primer evento real.
