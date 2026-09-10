"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAzuraCastAction } from "@/lib/azuracast";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";
import { isAdminRole } from "@/lib/roles";

const actionSchema = z.enum(["skip", "restart"]);

export type RadioControlState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function controlRadioServiceAction(
  _previousState: RadioControlState,
  formData: FormData,
): Promise<RadioControlState> {
  const session = await getServerSession(authOptions);
  if (!isAdminRole(session?.user?.role) || !session?.user?.id) {
    return { status: "error", message: "No tienes permiso de administrador." };
  }

  const parsed = actionSchema.safeParse(formData.get("action"));
  if (!parsed.success) {
    return {
      status: "error",
      message: "La operación solicitada no es válida.",
    };
  }

  const result = await runAzuraCastAction(parsed.data);
  if (!result.ok) return { status: "error", message: result.message };

  try {
    const db = getSupabaseAdmin();
    await db.from("audit_logs").insert({
      actor_user_id: session.user.id,
      action: `radio.azuracast_${parsed.data}`,
      entity: "radio_station",
      metadata_json: { source: "control_panel" },
    });
  } catch {
    // La operación ya fue ejecutada; el registro de auditoría es secundario.
  }

  revalidatePath("/admin/radio");
  revalidatePath("/admin/medios");
  return { status: "success", message: result.message };
}
