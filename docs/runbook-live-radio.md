# Runbook de transmisión y radio

## Entre 60 y 30 minutos antes

- Confirma las credenciales activas en `/admin/medios` antes de crear el evento. Si Instagram o TikTok renovaron la llave, actualízala primero.
- Crea la señal, marca los destinos necesarios y confirma que todos figuren como preparados en `/admin/transmisiones`.
- Prueba cámaras, escenas, audio y la grabación local en MKV.
- Envía señal con el estado público en `rehearsal` y valida Mux más un destino privado.
- Comprueba el stream de radio desde un teléfono externo.

## Diez minutos antes

- Abre `/admin/transmisiones` para monitorear el estado individual de cada salida.
- Confirma audio y video desde una conexión distinta a la cabina.
- Verifica moderadores, enlace social alternativo y conexión de respaldo.

## Durante la transmisión

- No reinicies servicios sin identificar primero el componente que falló.
- Si falla una red social, la web y las demás redes continúan. Lee el estado del destino y reemplaza su llave para el siguiente evento si Mux reporta un error fatal.
- Si cae el enlace principal, usa el preset OBS de contingencia 720p.
- Registra la hora y el impacto de cada incidencia.

## Cierre

- Detén el encoder y espera el webhook `video.live_stream.idle`.
- Confirma el estado finalizado y el replay de Mux.
- Completa título, miniatura, descripción y etiquetas del archivo.
- Conserva la grabación local y revisa métricas y logs.

## Radio

- AutoDJ debe permanecer activo cuando no haya locutor.
- Cada DJ usa una cuenta individual; no se comparte la contraseña de administración.
- Antes de un takeover, valida nivel de audio y metadatos. Al desconectarse el DJ, confirma que AutoDJ retomó la emisión.
- Exporta periódicamente la configuración de AzuraCast y respalda su volumen persistente.
