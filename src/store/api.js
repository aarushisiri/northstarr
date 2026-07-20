import { supabase } from "../lib/supabaseClient";

/* daily_logs ---------------------------------------------------------- */

export async function fetchDailyLog(userId, dateKey) {
  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("log_date", dateKey)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertDailyLog(userId, dateKey, fields) {
  const { error } = await supabase
    .from("daily_logs")
    .upsert({ user_id: userId, log_date: dateKey, ...fields }, { onConflict: "user_id,log_date" });
  if (error) throw error;
}

/* journal_entries ------------------------------------------------------ */

export async function fetchJournalEntry(userId, dateKey) {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_date", dateKey)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertJournalEntry(userId, dateKey, fields) {
  const { error } = await supabase
    .from("journal_entries")
    .upsert({ user_id: userId, entry_date: dateKey, ...fields }, { onConflict: "user_id,entry_date" });
  if (error) throw error;
}

/* system_progress -------------------------------------------------------- */

export async function fetchSystemProgress(userId) {
  const { data, error } = await supabase.from("system_progress").select("*").eq("user_id", userId);
  if (error) throw error;
  return data;
}

export async function upsertSystemProgress(userId, systemsObj) {
  const rows = Object.entries(systemsObj).map(([system_name, v]) => ({
    user_id: userId,
    system_name,
    weekly: v.weekly ?? 0,
    monthly: v.monthly ?? 0,
    yearly: v.yearly ?? 0,
  }));
  if (!rows.length) return;
  const { error } = await supabase
    .from("system_progress")
    .upsert(rows, { onConflict: "user_id,system_name" });
  if (error) throw error;
}

/* streaks ---------------------------------------------------------------- */

export async function fetchStreaks(userId) {
  const { data, error } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertStreaks(userId, streaks) {
  const { error } = await supabase
    .from("streaks")
    .upsert({ user_id: userId, ...streaks }, { onConflict: "user_id" });
  if (error) throw error;
}

/* plans (append-only import history) -------------------------------------- */

export async function insertPlanRecord(userId, rawText, parsed, notes) {
  const { error } = await supabase.from("plans").insert({
    user_id: userId,
    raw_text: rawText,
    parsed,
    parser_notes: notes ?? [],
  });
  if (error) throw error;
}

/* settings (reserved for future preferences) ------------------------------- */

export async function fetchSetting(userId, key) {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", userId)
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertSetting(userId, key, value) {
  const { error } = await supabase
    .from("settings")
    .upsert({ user_id: userId, key, value }, { onConflict: "user_id,key" });
  if (error) throw error;
}

/* destructive: full wipe for this user across every table ------------------ */

export async function deleteAllUserData(userId) {
  const tables = ["plans", "daily_logs", "journal_entries", "system_progress", "streaks", "settings"];
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("user_id", userId);
    if (error) throw error;
  }
}
