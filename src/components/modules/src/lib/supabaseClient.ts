/**
 * RoastBook Supabase Client Helper
 * Menggunakan kredensial dari .env.local jika dikonfigurasi
 */

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  isConfigured: Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here'
  ),
};

export interface SupabaseHealth {
  connected: boolean;
  message: string;
}

/**
 * Tes status koneksi ke Supabase REST endpoint
 */
export async function checkSupabaseConnection(): Promise<SupabaseHealth> {
  if (!supabaseConfig.isConfigured) {
    return {
      connected: false,
      message: 'Supabase URL atau Anon Key belum diisi di berkas .env.local',
    };
  }

  try {
    const res = await fetch(`${supabaseConfig.url}/rest/v1/coffee_variants?select=count`, {
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
      },
    });

    if (res.ok) {
      return {
        connected: true,
        message: 'Berhasil terhubung ke Supabase PostgreSQL database!',
      };
    } else {
      return {
        connected: false,
        message: `HTTP ${res.status}: ${res.statusText}. Pastikan tabel sudah dibuat dengan menjalankan schema.sql di Supabase.`,
      };
    }
  } catch (error: any) {
    return {
      connected: false,
      message: `Gagal menghubungi Supabase: ${error?.message || 'Network error'}`,
    };
  }
}
