import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  console.log("🚀 [API HISTORY] Request masuk...");

  // 1. CEK ENV VARS
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("🔍 [API DEBUG] Cek Environment Variables:");
  console.log("   - URL:", url ? "✅ Ada" : "❌ KOSONG (Cek .env)");
  console.log("   - SERVICE KEY:", serviceKey ? `✅ Ada (Panjang: ${serviceKey.length})` : "❌ KOSONG (Cek .env)");

  if (!url || !serviceKey) {
    console.error("❌ [API ERROR] Konfigurasi Server Belum Lengkap!");
    return NextResponse.json({ error: "Server Config Error: Missing Env Vars" }, { status: 500 });
  }

  // 2. CEK SESSION
  try {
    const session = await getServerSession(authOptions);
    console.log("👤 [API DEBUG] User Email:", session?.user?.email || "Guest/Tidak Login");

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized: Anda belum login" }, { status: 401 });
    }

    const { recipeId } = await req.json();
    console.log("📦 [API DEBUG] ID Resep:", recipeId);

    // 3. KONEKSI SUPABASE ADMIN
    const supabaseAdmin = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 4. CARI USER DI DB
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData) {
      console.error("❌ [API ERROR] User tidak ditemukan di tabel 'users':", userError);
      return NextResponse.json({ error: "User not found in Database" }, { status: 404 });
    }
    console.log("✅ [API DEBUG] User ID ditemukan:", userData.id);

    // 5. SIMPAN HISTORY
    const { error: historyError } = await supabaseAdmin
      .from("history")
      .upsert(
        { 
          id_user: userData.id, 
          id_recipe: Number(recipeId),
          created_at: new Date().toISOString()
        }, 
        { onConflict: 'id_user, id_recipe' }
      );

    if (historyError) {
      console.error("❌ [API ERROR] Gagal simpan ke DB:", historyError);
      return NextResponse.json({ error: "Database Error: " + historyError.message }, { status: 500 });
    }

    console.log("🎉 [API SUCCESS] History berhasil disimpan!");
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("🔥 [API CRASH] Error tidak terduga:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}