# Instalación y conexión de AzuraCast

Esta guía deja listo el procedimiento, pero la instalación real requiere un VPS y un dominio. Vercel no puede alojar AzuraCast porque la radio necesita procesos persistentes, almacenamiento y puertos de emisión.

## 1. Servidor que se debe contratar

Para una emisora inicial, usar un VPS nuevo de 64 bits capaz de ejecutar Docker. AzuraCast exige como mínimo 2 GB de RAM y 20 GB de disco; su referencia recomendada es 4 CPU, 4 GB de RAM y 40 GB o más de disco. Conviene reservar espacio adicional según la biblioteca musical y las grabaciones.

El servidor debe tener:

- IP pública fija;
- acceso SSH con `root` o `sudo`;
- sistema Linux limpio compatible con la versión vigente de AzuraCast;
- copias de seguridad del volumen persistente;
- dominio como `radio.idchuancayo.org` apuntando a la IP.

Antes de comprar, revisar los requisitos oficiales: <https://www.azuracast.com/docs/getting-started/requirements/>

## 2. Instalación oficial

Conectarse por SSH al VPS y ejecutar el instalador Docker recomendado por AzuraCast:

```bash
mkdir -p /var/azuracast
cd /var/azuracast
curl -fsSL https://raw.githubusercontent.com/AzuraCast/AzuraCast/main/docker.sh > docker.sh
chmod a+x docker.sh
./docker.sh install
```

Seguir el asistente, abrir el dominio en el navegador y crear la cuenta superadministradora. No copiar contraseñas ni resultados del instalador a GitHub.

Fuente oficial: <https://www.azuracast.com/docs/getting-started/installation/docker/>

## 3. Estación recomendada

Crear una estación llamada **IDC Radio Huancayo** con:

- AutoDJ habilitado;
- mount principal MP3 de 128 kbps y 44.1 o 48 kHz;
- streamers habilitados;
- grabación de locutores sólo si existe consentimiento y espacio suficiente;
- HTTPS válido;
- zona horaria `America/Lima`.

Crear al menos estas playlists:

1. `Rotación general`: música para cubrir toda la programación.
2. `Identidad IDC`: cuñas, identificadores y separadores cada cierta cantidad de canciones.
3. `Devocionales`: bloques con horario específico.
4. `Respaldo seguro`: pistas aprobadas que puedan sonar si otra lista queda vacía.

Una pista debe estar asignada a por lo menos una playlist para que AutoDJ pueda reproducirla. Gestión oficial de medios: <https://www.azuracast.com/docs/user-guide/media-management/>

## 4. Locutores

Crear una cuenta Streamer/DJ por persona; nunca compartir la cuenta administradora. El locutor obtiene en AzuraCast servidor, puerto, mount, usuario y contraseña.

Para radio se recomienda BUTT o Mixxx con conexión Icecast. OBS continúa dedicado al video. Al conectarse el locutor, Liquidsoap toma su audio; al desconectarse, AutoDJ vuelve automáticamente.

Guías oficiales:

- <https://www.azuracast.com/docs/user-guide/streamers-and-djs/>
- <https://www.azuracast.com/docs/user-guide/streaming-software/>

## 5. Conexión con el panel IDC

Desde el usuario de AzuraCast que administrará la estación, crear una API key en **My API Keys**. Debe tener sólo permisos de ver y administrar la emisión de esta estación.

Agregar en los dos proyectos Vercel públicos que consumen la radio:

```dotenv
AZURACAST_BASE_URL=https://radio.idchuancayo.org
AZURACAST_STATION_SHORTCODE=idc_radio_huancayo
AZURACAST_PUBLIC_STREAM_URL=https://radio.idchuancayo.org/listen/idc_radio_huancayo/radio.mp3
RADIO_STATION_NAME=IDC Radio Huancayo
```

Agregar únicamente en `IDC-HUANCAYO-CONTROL`:

```dotenv
AZURACAST_STATION_ID=1
AZURACAST_API_KEY=valor_secreto_generado_en_azuracast
```

`AZURACAST_API_KEY` es una variable de servidor. No debe llevar el prefijo `NEXT_PUBLIC_`, escribirse en documentación real, compartirse por chat ni guardarse en Git.

El ID numérico aparece en las URLs y en la API de AzuraCast. Confirmarlo en la instalación; no asumir que siempre será `1`.

## 6. Prueba de aceptación

1. AutoDJ aparece funcionando en `/admin/radio`.
2. La URL pública reproduce audio en Wi-Fi y datos móviles.
3. La canción y el artista cambian en la web en menos de 30 segundos.
4. Un DJ de prueba toma la señal y el panel muestra su nombre.
5. Al desconectar el DJ, AutoDJ regresa sin intervención.
6. `Saltar canción` cambia de pista.
7. Se verifica una copia de seguridad restaurable.

El botón **Reiniciar radio** se usa sólo si un servicio está detenido: desconecta brevemente a los oyentes.
