"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
export async function updateSalonContact(form:FormData) {
 await requireAdmin();
 const id=form.get("id"); const status=form.get("status");
 const valid=["new","contacted","qualified","converted","archived"];
 if(typeof id!=="string" || !/^[0-9a-f-]{36}$/i.test(id) || typeof status!=="string" || !valid.includes(status)) throw new Error("Invalid contact update");
 const note=String(form.get("internalNote")??"").trim().slice(0,2000);
 const {error}=await createAdminClient().from("salon_contacts").update({status,internal_note:note||null,updated_at:new Date().toISOString()}).eq("id",id);
 if(error) throw new Error(error.message);
 revalidatePath("/admin/salon");
}
