import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

// ============================================================================
// 1. GET METHOD: Fetch History (Untuk Menampilkan Data di Frontend + Debugging)
// ============================================================================
export async function GET(req: Request) {
  console.log("\n👀 [API GET HISTORY] =========================================");
  console.log("👀 [API GET HISTORY] User mengakses halaman History...");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Server Config Error" }, { status: 500 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log("❌ [API GET] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // A. Ambil User ID
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .eq("email", session.user.email)
      .single();

    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 });

    console.log("👤 [DEBUG USER] Email:", userData.email);
    console.log("🔑 [DEBUG USER] UUID :", userData.id);

    // B. Fetch History AI (Dataset)
    console.log("📋 [DEBUG DB] Fetching 'history_ai'...");
    const { data: aiData } = await supabaseAdmin
      .from("history_ai")
      .select("*")
      .eq("user_id", userData.id)
      .order("access_time_history", { ascending: false });

    // C. Fetch History Local (Resep App)
    console.log("📋 [DEBUG DB] Fetching 'history' (Local App)...");
    const { data: localData } = await supabaseAdmin
      .from("history")
      .select(`
        id_recipe, 
        created_at, 
        resep:resep ( id, title, image_url, cook_time, servings, difficulty )
      `)
      .eq("id_user", userData.id)
      .order("created_at", { ascending: false });

    // --- LOGGING DATA KE TERMINAL ---
    console.log(`📊 [RESULT] Ditemukan: ${aiData?.length || 0} History AI, ${localData?.length || 0} History Local`);
    
    // D. Siapkan Data untuk Frontend (Gabung & Ambil Detail Dataset)
    let datasetItems: any[] = [];
    if (aiData && aiData.length > 0) {
        const datasetIds = aiData.map((h: any) => h.dataset_resep_id);
        
        // PENTING: Ambil kolom lengkap dari dataset agar Modal bisa tampil!
        // Pastikan nama kolom sesuai DB Anda (steps, ingredients_cleaned, dll)
        const { data: datasets } = await supabaseAdmin
            .from("dataset")
            .select("id, title_cleaned, ingredients_cleaned, image_url, steps, prep_time, cook_time, servings, calories")
            .in("id", datasetIds);
        
        datasetItems = aiData.map((h: any) => {
            const detail = datasets?.find((d: any) => d.id === h.dataset_resep_id);
            return {
                uniqueId: `dataset-${h.dataset_resep_id}-${h.access_time_history}`,
                type: 'dataset',
                id: h.dataset_resep_id,
                title: detail?.title_cleaned || h.title || 'Dataset Item',
                image_url: detail?.image_url || null,
                date: h.access_time_history,
                
                // DATA LENGKAP UNTUK MODAL
                full_detail: detail 
            };
        });
    }

    // Format Data Local
    const localItems = (localData || []).map((item: any) => ({
        uniqueId: `local-${item.id_recipe}-${item.created_at}`,
        type: 'local',
        id: item.id_recipe,
        title: item.resep?.title || 'Resep Tidak Ditemukan',
        image_url: item.resep?.image_url,
        date: item.created_at,
        details: {
            difficulty: item.resep?.difficulty,
            cook_time: item.resep?.cook_time,
            servings: item.resep?.servings
        }
    })).filter((item: any) => item.title !== 'Resep Tidak Ditemukan');

    // Gabung & Sort
    const combined = [...localItems, ...datasetItems].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    console.log("✅ [API GET] Selesai mengirim data.");
    console.log("----------------------------------------------------------\n");

    return NextResponse.json({ data: combined });

  } catch (err: any) {
    console.error("🔥 [API ERROR]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


// ============================================================================
// 2. POST METHOD: Simpan History & Cari Kecocokan Dataset
// ============================================================================
export async function POST(req: Request) {
  console.log("\n🚀 [API POST HISTORY] =========================================");
  console.log("🚀 [API POST HISTORY] Request masuk (User membuka resep)...");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Server Config Error" }, { status: 500 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipeId } = await req.json();

    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // A. Cari User ID
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .eq("email", session.user.email)
      .single();

    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 });

    console.log("👤 [USER INFO] Email:", userData.email);

    // B. Simpan ke tabel 'history' (Resep Aplikasi)
    const { error: mainHistoryError } = await supabaseAdmin
      .from("history")
      .insert({
        id_user: userData.id,
        id_recipe: Number(recipeId),
        created_at: new Date().toISOString()
      });

    if (mainHistoryError) {
      console.error("❌ [Main History] Gagal simpan:", mainHistoryError.message);
    } else {
      console.log("✅ [Main History] Tersimpan di tabel 'history'");
    }

    // C. Cari & Simpan ke 'history_ai' (Dataset)
    // Ambil Nama Resep Aplikasi
    const { data: appRecipe } = await supabaseAdmin
      .from("resep")
      .select("title")
      .eq("id", recipeId)
      .single();

    if (!appRecipe) {
        return NextResponse.json({ message: "Recipe ID not found" });
    }

    const fullTitle = appRecipe.title; 
    console.log(`🔍 [Dataset Search] Mencari: "${fullTitle}"`);

    // Logika Smart Search
    let datasetRecipe = null;

    // 1. Exact Match
    const { data: exact } = await supabaseAdmin
      .from("dataset")
      .select("id, title_cleaned")
      .ilike("title_cleaned", `%${fullTitle}%`)
      .limit(1)
      .single();
    
    if (exact) {
        datasetRecipe = exact;
        console.log("   ✅ Match (Exact):", exact.title_cleaned);
    }
    
    // 2. Fuzzy Match (2 kata pertama)
    if (!datasetRecipe) {
       const words = fullTitle.split(" ");
       if (words.length > 0) {
         const keyword = words.slice(0, Math.min(words.length, 2)).join(" ");
         const { data: fuzzy } = await supabaseAdmin
          .from("dataset")
          .select("id, title_cleaned")
          .ilike("title_cleaned", `%${keyword}%`)
          .limit(1)
          .single();
         if (fuzzy) {
             datasetRecipe = fuzzy;
             console.log("   ✅ Match (Fuzzy):", fuzzy.title_cleaned);
         }
       }
    }

    if (datasetRecipe) {
        // Simpan ke history_ai
        const { error: aiError } = await supabaseAdmin
          .from("history_ai")
          .insert({
              user_id: userData.id,
              dataset_resep_id: datasetRecipe.id,
              title: fullTitle,
              access_time_history: new Date().toISOString()
          });
        
        if (!aiError) {
            console.log(`🎉 [History AI] Tersimpan! Linked ke Dataset ID: ${datasetRecipe.id}`);
        } else {
            console.error("❌ [History AI] Gagal simpan:", aiError.message);
        }
    } else {
        console.log("⚠️ [History AI] Tidak ada kecocokan dataset. Skip.");
    }
    
    console.log("🚀 [API POST HISTORY] Selesai =================================\n");

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("🔥 [API CRASH] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}