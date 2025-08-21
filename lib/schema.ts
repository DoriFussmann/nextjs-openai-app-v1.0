export function parseSchema(schemaText: string) {
  try { return JSON.parse(schemaText); } catch { return {}; }
}

export function allowedKeyMap(schema: any) {
  const set = new Set<string>();
  for (const sec of schema?.sections || []) {
    set.add(sec.key);
    for (const f of sec.fields || []) set.add(`${sec.key}.${String(f.key).replace(/\[\]|\{\}/g,"")}`);
  }
  return set;
}

export function filterUpdatesToSchema(updates: any, schema: any) {
  const allowed = allowedKeyMap(schema);
  const out: any = {};
  for (const [sec, obj] of Object.entries(updates || {})) {
    if (!allowed.has(sec)) continue;
    out[sec] = {};
    if (obj && typeof obj === "object") {
      for (const [k, v] of Object.entries(obj as any)) {
        const path = `${sec}.${k}`;
        if (allowed.has(path)) out[sec][k] = v;
      }
    }
  }
  return out;
}

export function deepMerge(a: any, b: any) {
  if (Array.isArray(a) || Array.isArray(b) || typeof a !== "object" || typeof b !== "object") return b ?? a;
  const out: any = { ...a };
  for (const k of Object.keys(b || {})) out[k] = deepMerge(a?.[k], (b as any)[k]);
  return out;
}

export function coveragePct(schema: any, state: any) {
  const paths: string[] = [];
  for (const sec of schema?.sections || []) {
    for (const f of sec.fields || []) paths.push(`${sec.key}.${String(f.key).replace(/\[\]|\{\}/g,"")}`);
  }
  const filled = paths.filter((p) => {
    const v = p.split(".").reduce((o, k) => (o ? o[k] : undefined), state);
    if (Array.isArray(v)) return v.length > 0;
    if (v && typeof v === "object") return Object.keys(v).length > 0;
    return v !== undefined && v !== null && String(v).trim() !== "";
  }).length;
  return Math.round((filled / Math.max(paths.length, 1)) * 100);
}
