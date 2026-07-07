"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { apartmentComplexes } from "./mock";
import type { ApartmentComplex } from "./types";

export async function listApartmentComplexes(): Promise<ApartmentComplex[]> {
  if (!isSupabaseConfigured()) return apartmentComplexes;

  const supabase = await createClient();
  const { data } = await supabase.from("apartment_complexes").select("id, name, address, region");
  return (data ?? []).map((c) => ({ id: c.id, name: c.name, address: c.address, region: c.region }));
}
