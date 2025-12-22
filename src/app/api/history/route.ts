import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

// ============================================================================
// 1. GET METHOD (Untuk menampilkan list history - Tidak Berubah)
// ============================================================================
export async function GET(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return NextResponse.json({ error: "Config Error" }, { status: 500 });

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseAdmin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    // Ambil User ID
    const { data: userData } = await supabaseAdmin.from("users").select("id").eq("email", session.user.email).single();
    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Fetch dari history_ai
    const { data: aiData } = await supabaseAdmin
      .from("history_ai")
      .select("*")
      .eq("user_id", userData.id)
      .order("access_time_history", { ascending: false });

    // Mapping Data
    const items = aiData?.map((h: any) => ({
        uniqueId: `ai-${h.dataset_resep_id}-${h.access_time_history}`,
        type: 'dataset', // Dianggap dataset agar memicu Modal
        id: h.dataset_resep_id,
        title: h.title,
        image_url: h.image_url,
        date: h.access_time_history,
        full_detail: {
            title_cleaned: h.title,
            image_url: h.image_url,
            ingredients_cleaned: h.bahan,
            steps: h.cara_memasak
        }
    })) || [];

    return NextResponse.json({ data: items });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ============================================================================
// 2. POST METHOD: HYBRID (Direct Save & Local Lookup)
// ============================================================================
export async function POST(req: Request) {
  console.log("\n🚀 [API POST HISTORY] Request masuk...");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return NextResponse.json({ error: "Config Error" }, { status: 500 });

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // TERIMA BODY (Bisa berisi data lengkap ATAU hanya recipeId)
    const body = await req.json();

    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. Ambil User ID
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 });


    // ========================================================================
    // SKENARIO A: DIRECT SAVE (Dari Card Recipe AI/Model)
    // Frontend mengirimkan flag 'save_mode: direct_save' dan data lengkap
    // ========================================================================
    if (body.save_mode === 'direct_save') {
        console.log(`📥 [JALUR 1: DIRECT] Menyimpan data kiriman frontend: "${body.title}"`);

        const { error } = await supabaseAdmin
            .from("history_ai")
            .insert({
                user_id: userData.id,
                dataset_resep_id: Number(body.dataset_resep_id) || 0,
                title: body.title,
                access_time_history: new Date().toISOString(),
                // Simpan data mentah dari Frontend
                image_url: body.image_url,
                bahan: body.bahan,
                cara_memasak: body.cara_memasak
            });

        if (error) {
            console.error("❌ Gagal Direct Save:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log("✅ Berhasil Direct Save.");
        return NextResponse.json({ success: true });
    }


    // ========================================================================
    // SKENARIO B: LOCAL LOOKUP (Dari Halaman Detail Resep Aplikasi)
    // Frontend hanya mengirimkan 'recipeId'. Backend cari di tabel 'resep'.
    // ========================================================================
    if (body.recipeId) {
        console.log(`🔍 [JALUR 2: LOCAL LOOKUP] Mencari ID ${body.recipeId} di tabel 'resep'...`);

        // 1. Ambil data dari tabel 'resep'
        const { data: appRecipe } = await supabaseAdmin
            .from("resep")
            .select("*")
            .eq("id", body.recipeId)
            .single();

        if (!appRecipe) {
            console.warn("⚠️ ID Resep tidak ditemukan di database lokal.");
            return NextResponse.json({ message: "Recipe not found" });
        }

        console.log(`   Ditemukan: "${appRecipe.title}"`);

        // 2. Konversi Array ke String (Snapshot)
        // Tabel resep pakai JSONB/Array, history_ai pakai Text
        let bahanStr = "";
        if (Array.isArray(appRecipe.ingredients)) {
            bahanStr = appRecipe.ingredients.join(', ');
        } else if (typeof appRecipe.ingredients === 'string') {
            bahanStr = appRecipe.ingredients;
        }

        let stepsStr = "";
        if (Array.isArray(appRecipe.steps)) {
            stepsStr = appRecipe.steps.join('\n');
        } else if (typeof appRecipe.steps === 'string') {
            stepsStr = appRecipe.steps;
        }

        // 3. Simpan ke history_ai
        const { error: aiError } = await supabaseAdmin
            .from("history_ai")
            .insert({
                user_id: userData.id,
                dataset_resep_id: appRecipe.id, // Gunakan ID resep lokal
                title: appRecipe.title,
                access_time_history: new Date().toISOString(),
                // Data Snapshot
                image_url: appRecipe.image_url,
                bahan: bahanStr,
                cara_memasak: stepsStr
            });

        if (aiError) {
            console.error("❌ Gagal simpan snapshot lokal:", aiError.message);
            return NextResponse.json({ error: aiError.message }, { status: 500 });
        }

        // (Opsional) Simpan ke tabel 'history' lama untuk statistik view count resep
        await supabaseAdmin.from("history").insert({
            id_user: userData.id,
            id_recipe: Number(body.recipeId),
            created_at: new Date().toISOString()
        });

        console.log("✅ Berhasil simpan Snapshot Lokal.");
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid Request Body" }, { status: 400 });

  } catch (err: any) {
    console.error("🔥 Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}