import "server-only";

export type AzuraCastServiceStatus = {
  configured: boolean;
  reachable: boolean;
  backendRunning: boolean | null;
  frontendRunning: boolean | null;
  message: string;
};

function getAdminConfiguration() {
  return {
    baseUrl: process.env.AZURACAST_BASE_URL?.replace(/\/$/, "") || "",
    stationId: process.env.AZURACAST_STATION_ID?.trim() || "",
    apiKey: process.env.AZURACAST_API_KEY?.trim() || "",
  };
}

export function isAzuraCastControlConfigured() {
  const configuration = getAdminConfiguration();
  return Boolean(
    configuration.baseUrl && configuration.stationId && configuration.apiKey,
  );
}

export async function getAzuraCastServiceStatus(): Promise<AzuraCastServiceStatus> {
  const configuration = getAdminConfiguration();
  if (
    !configuration.baseUrl ||
    !configuration.stationId ||
    !configuration.apiKey
  ) {
    return {
      configured: false,
      reachable: false,
      backendRunning: null,
      frontendRunning: null,
      message:
        "Añade la URL, el ID numérico de la estación y una API key para habilitar controles.",
    };
  }

  try {
    const response = await fetch(
      `${configuration.baseUrl}/api/station/${encodeURIComponent(configuration.stationId)}/status`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${configuration.apiKey}`,
        },
        signal: AbortSignal.timeout(1800),
      },
    );

    if (!response.ok) {
      return {
        configured: true,
        reachable: false,
        backendRunning: null,
        frontendRunning: null,
        message:
          response.status === 401 || response.status === 403
            ? "AzuraCast rechazó la API key o sus permisos."
            : `AzuraCast respondió con estado ${response.status}.`,
      };
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const backendRunning =
      payload.backendRunning === true || payload.backend_running === true;
    const frontendRunning =
      payload.frontendRunning === true || payload.frontend_running === true;

    return {
      configured: true,
      reachable: true,
      backendRunning,
      frontendRunning,
      message:
        backendRunning && frontendRunning
          ? "AutoDJ y servidor de escucha operativos."
          : "AzuraCast responde, pero uno de sus servicios está detenido.",
    };
  } catch {
    return {
      configured: true,
      reachable: false,
      backendRunning: null,
      frontendRunning: null,
      message: "No se pudo consultar AzuraCast en este momento.",
    };
  }
}

export async function runAzuraCastAction(action: "skip" | "restart") {
  const configuration = getAdminConfiguration();
  if (
    !configuration.baseUrl ||
    !configuration.stationId ||
    !configuration.apiKey
  ) {
    return {
      ok: false,
      message: "El control de AzuraCast no está configurado.",
    };
  }

  const endpoint =
    action === "skip"
      ? `/api/station/${encodeURIComponent(configuration.stationId)}/backend/skip`
      : `/api/station/${encodeURIComponent(configuration.stationId)}/restart`;

  try {
    const response = await fetch(`${configuration.baseUrl}${endpoint}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${configuration.apiKey}`,
      },
      signal: AbortSignal.timeout(8000),
    });
    return response.ok
      ? {
          ok: true,
          message:
            action === "skip"
              ? "Canción saltada. AzuraCast continuará con la siguiente pista."
              : "Reinicio solicitado. La radio puede tardar unos segundos en volver.",
        }
      : {
          ok: false,
          message:
            response.status === 401 || response.status === 403
              ? "La API key no tiene permiso para controlar la emisión."
              : `AzuraCast rechazó la operación (estado ${response.status}).`,
        };
  } catch {
    return {
      ok: false,
      message: "No se pudo contactar AzuraCast. No se realizó ningún cambio.",
    };
  }
}
