#!/usr/bin/env node
/**
 * Lấy Supabase URL + API keys qua Management API.
 *
 * Cách 1: Tạo file .env.supabase (không commit) với:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx
 *   PROJECT_REF=your-ref
 * Rồi chạy: npm run supabase:keys
 *
 * Cách 2: Chạy với env: SUPABASE_ACCESS_TOKEN=sbp_xxx PROJECT_REF=ref npm run supabase:keys
 * Project ref: click vào project trên dashboard → URL có dạng .../project/<ref>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
    return env;
  } catch {
    return {};
  }
}

const envFile = loadEnvFile(path.join(process.cwd(), '.env.supabase'));
const token = process.env.SUPABASE_ACCESS_TOKEN || envFile.SUPABASE_ACCESS_TOKEN;
const ref = process.env.PROJECT_REF || envFile.PROJECT_REF || process.argv[2];

if (!token) {
  console.error('Thiếu SUPABASE_ACCESS_TOKEN. Tạo tại: https://supabase.com/dashboard/account/tokens');
  console.error('Chạy: SUPABASE_ACCESS_TOKEN=sbp_xxx PROJECT_REF=ref node scripts/get-supabase-keys.mjs');
  process.exit(1);
}

if (!ref) {
  console.error('Thiếu PROJECT_REF. Lấy ref: npm run supabase:keys -- --list');
  console.error('Hoặc: Dashboard → click "vm-pharmacy" → URL có dạng .../project/<ref>');
  process.exit(1);
}

const base = 'https://api.supabase.com/v1';

async function listProjects() {
  const res = await fetch(`${base}/projects`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    console.error('Lỗi:', res.status, await res.text());
    process.exit(1);
  }
  const data = await res.json();
  const projects = Array.isArray(data) ? data : data.projects || data.data || [];
  console.log('Projects (dùng ref làm PROJECT_REF):');
  for (const p of projects) console.log('  ', p.ref || p.id, '-', p.name || '');
  return;
}

async function main() {
  if (ref === '--list') return listProjects();

  const res = await fetch(`${base}/projects/${ref}/api-keys?reveal=true`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const t = await res.text();
    console.error('Lỗi API:', res.status, t);
    if (res.status === 401) console.error('Token sai hoặc hết hạn. Tạo token mới: https://supabase.com/dashboard/account/tokens');
    process.exit(1);
  }

  const keys = await res.json();
  const anon = keys.find((k) => (k.name || '').toLowerCase().includes('anon') || k.type === 'anon');
  const serviceRole = keys.find((k) => (k.name || '').toLowerCase().includes('service') || k.type === 'service_role');

  const url = `https://${ref}.supabase.co`;

  console.log('# Thêm vào .env hoặc Vercel Environment Variables:\n');
  console.log(`NEXT_PUBLIC_SUPABASE_URL=${url}`);
  if (anon?.api_key) console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon.api_key}`);
  else console.log('# NEXT_PUBLIC_SUPABASE_ANON_KEY=<không tìm thấy anon key>');
  if (serviceRole?.api_key) console.log(`SUPABASE_SERVICE_ROLE_KEY=${serviceRole.api_key}`);
  else console.log('# SUPABASE_SERVICE_ROLE_KEY=<không tìm thấy service_role key>');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
