# Decisión técnica: radio y multitransmisión

Fecha de revisión: 10 de septiembre de 2026.

## Decisión

Se mantienen dos sistemas independientes:

- **Radio:** AzuraCast en un VPS, con AutoDJ 24/7 y cuentas individuales para locutores.
- **Video:** OBS envía una sola señal a Mux; Mux alimenta la página web y los destinos sociales.

Aitum Multistream se documenta como contingencia gratuita en un segundo perfil de OBS. Restream y un relay propio con SRS no se incorporan por ahora.

## Por qué no se reemplaza Mux

El sistema actual ya usa la señal de Mux para cuatro funciones que Aitum o Restream no reemplazan automáticamente:

1. reproductor propio en `/en-vivo`;
2. grabación y replay;
3. estados automáticos por webhook;
4. seguimiento individual de los destinos sociales.

Aitum es gratuito, pero OBS debe codificar y subir una salida por red. YouTube recomienda calcular la suma de todos los bitrates y conservar entre 1.5 y 2 veces ese valor como margen de subida. Con cuatro salidas de 6 Mbps, la conexión recomendada pasa de una sola subida de 6 Mbps a entre 36 y 48 Mbps estables.

Mux cobra por uso. Como referencia consultada en septiembre de 2026, la entrada live 1080p cuesta US$0.03125 por minuto y el simulcast US$0.02 por minuto y destino; la entrega a espectadores y el almacenamiento se calculan aparte. El panel incluye una calculadora para no asumir que US$20 mensuales cubren cualquier volumen.

## Alternativas evaluadas

| Ruta             | Ventaja                                    | Costo operativo                   | Riesgo principal                                        | Uso decidido                         |
| ---------------- | ------------------------------------------ | --------------------------------- | ------------------------------------------------------- | ------------------------------------ |
| OBS → Mux        | Una subida, web propia, replay y monitoreo | Variable por uso                  | Vigilar minutos y destinos                              | Principal                            |
| OBS + Aitum      | Software gratuito                          | Más CPU y subida local            | Un fallo de internet afecta todas las salidas           | Respaldo                             |
| OBS → Restream   | Operación muy simple                       | Plan mensual externo              | Duplica parte de Mux y puede requerir plan de 5 canales | Reevaluar si el gasto variable crece |
| OBS → SRS/FFmpeg | Control total                              | VPS, desarrollo y guardia técnica | No es un panel de restream listo para usar              | Fase futura                          |

## Operación de radio

AzuraCast resuelve la radio sin depender de OBS:

- AutoDJ reproduce playlists 24/7.
- El equipo sube música desde el navegador de AzuraCast y la asigna a playlists.
- Cada locutor recibe una cuenta DJ individual.
- El locutor conecta BUTT o Mixxx por Icecast; AzuraCast hace el cambio desde AutoDJ y vuelve automáticamente cuando se desconecta.
- El panel IDC muestra la canción, el locutor, los oyentes y los servicios.
- Con la API administrativa configurada, el panel puede saltar una canción o reiniciar la radio.

OBS se reserva para cámaras, audio y escenas del video. Separarlo de la automatización de radio evita que una actualización o caída de OBS silencie la emisora 24/7.

## Cuándo reconsiderar la decisión

Revisar los costos reales después de ocho semanas de transmisiones. Considerar Restream si su plan necesario cuesta menos que Mux y se acepta perder o reconstruir el reproductor/replay. Considerar SRS sólo si existe una persona responsable del VPS, monitoreo, copias, actualizaciones, reintentos FFmpeg y rotación segura de llaves.

## Fuentes primarias

- Mux pricing: <https://www.mux.com/docs/pricing/overview>
- YouTube, transmisión simultánea y ancho de banda: <https://support.google.com/youtube/answer/16404722>
- Aitum Multistream, versiones oficiales: <https://github.com/Aitum/obs-aitum-multistream/releases>
- Restream, planes: <https://restream.io/pricing>
- SRS: <https://github.com/ossrs/srs>
- AzuraCast: <https://www.azuracast.com/docs/>
