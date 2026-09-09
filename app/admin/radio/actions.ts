"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";
import { isAdminRole } from "@/lib/roles";

const programSchema = z.object({
  name: z.string().trim().min(3).max(140),
  host: z.string().trim().max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  weekday: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function createRadioProgramAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!isAdminRole(session?.user?.role) || !session.user.id)
    throw new Error("No autorizado");

  const parsed = programSchema.parse({
    name: formData.get("name"),
    host: formData.get("host") || undefined,
    description: formData.get("description") || undefined,
    weekday: formData.get("weekday"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });
  if (parsed.endTime <= parsed.startTime)
    throw new Error("La hora final debe ser posterior a la hora inicial");

  const db = getSupabaseAdmin();
  const { data: program, error: programError } = await db
    .from("radio_programs")
    .insert({
      name: parsed.name,
      host: parsed.host || null,
      description: parsed.description || null,
      active: true,
    })
    .select("id")
    .single();
  if (programError) throw new Error(programError.message);

  const { error: scheduleError } = await db.from("radio_schedule").insert({
    program_id: program.id,
    weekday: parsed.weekday,
    start_time: parsed.startTime,
    end_time: parsed.endTime,
    priority: 0,
    active: true,
  });
  if (scheduleError) throw new Error(scheduleError.message);

  await db.from("audit_logs").insert({
    actor_user_id: session.user.id,
    action: "radio_program.created",
    entity: "radio_programs",
    entity_id: program.id,
    metadata_json: { name: parsed.name, weekday: parsed.weekday },
  });
  revalidatePath("/admin/radio");
}
