import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// ==========================================
// HELPER: FETCH UNSPLASH
// ==========================================
async function fetchUnsplashImage(query: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) return null

  try {
    const searchQuery = `${query} food meal`
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
    
    const res = await fetch(url)
    const data = await res.json()

    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular
    }
  } catch (err) {
    console.error("Unsplash API Error:", err)
  }
  return null
}

// ==========================================
// MAIN API ROUTE - DATASET ONLY
// ==========================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const maxCalories = parseInt(searchParams.get('maxCalories') || '500')
    const minProtein = parseInt(searchParams.get('minProtein') || '10')
    const limit = parseInt(searchParams.get('limit') || '8')
    const type = searchParams.get('type') || 'high-protein'

    console.log('🔍 API Request:', { maxCalories, minProtein, limit, type })

    // ------------------------------------------
    // 1. AMBIL DATA DARI DATASET
    // ------------------------------------------
    let baseQuery = supabase
      .from('dataset')
      .select('id, title_cleaned, kalori, protein, lemak, karbo, slug')

    if (type === 'high-protein') {
      baseQuery = baseQuery.gte('protein', minProtein).order('protein', { ascending: false })
    } else if (type === 'low-calorie') {
      baseQuery = baseQuery.lte('kalori', maxCalories).order('kalori', { ascending: true })
    } else if (type === 'balanced') {
      baseQuery = baseQuery.lte('kalori', maxCalories).gte('protein', minProtein).order('protein', { ascending: false })
    }

    const { data: dataset, error } = await baseQuery.limit(limit)

    console.log('📦 Dataset result:', { count: dataset?.length, error })

    if (error) {
      console.error("❌ Supabase Error:", error)
      return NextResponse.json({ 
        success: false, 
        error: error.message, 
        data: [] 
      })
    }

    if (!dataset || dataset.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [],
        total: 0
      })
    }

    // ------------------------------------------
    // 2. AMBIL GAMBAR DARI datasetimg BERDASARKAN SLUG
    // ------------------------------------------
    const slugs = dataset.map(d => d.slug).filter(Boolean)
    
    console.log('🔍 Looking for images with slugs:', slugs)

    const { data: existingImages } = await supabase
      .from('datasetimg')
      .select('slug, image')
      .in('slug', slugs)

    console.log('🖼️ Found images:', existingImages?.length)

    // Buat Map untuk lookup cepat
    const imageMap = new Map<string, string>()
    existingImages?.forEach(img => {
      if (img.slug && img.image) {
        imageMap.set(img.slug, img.image)
        console.log(`✅ Mapped image for slug: ${img.slug}`)
      }
    })

    // ------------------------------------------
    // 3. PROSES DATA & FETCH UNSPLASH JIKA PERLU
    // ------------------------------------------
    const finalData = await Promise.all(dataset.map(async (item) => {
      // Cek apakah ada gambar di datasetimg
      let imageUrl = item.slug ? imageMap.get(item.slug) : null
      
      console.log(`🔎 Recipe [${item.slug}]:`, {
        hasSlug: !!item.slug,
        imageFromDB: imageUrl,
        willFetchUnsplash: !imageUrl
      })

      // Jika tidak ada gambar di DB, fetch dari Unsplash
      if (!imageUrl && item.title_cleaned) {
        console.log(`📸 Fetching Unsplash for: ${item.title_cleaned}`)
        
        const unsplashImg = await fetchUnsplashImage(item.title_cleaned)
        
        if (unsplashImg) {
          imageUrl = unsplashImg
          console.log(`✅ Got Unsplash image: ${unsplashImg.substring(0, 50)}...`)
          
          // Save ke database untuk cache
          if (item.slug) {
            await supabase.from('datasetimg').upsert({
              slug: item.slug,
              name: item.title_cleaned,
              image: unsplashImg,
              calories: item.kalori,
              proteins: item.protein,
              fat: item.lemak,
              carbohydrate: item.karbo
            }, { onConflict: 'slug' })
            
            console.log(`💾 Saved image to DB for slug: ${item.slug}`)
          }
        } else {
          console.warn(`⚠️ Unsplash returned no results for: ${item.title_cleaned}`)
        }
      }

      // Fallback ke placeholder jika semua gagal
      if (!imageUrl) {
        imageUrl = '/images/placeholder-food.jpg'
        console.log(`🖼️ Using placeholder for: ${item.title_cleaned}`)
      }

      return {
        id: `dataset-${item.id}`,
        name: item.title_cleaned,
        image: imageUrl,
        slug: item.slug,
        calories: item.kalori,
        proteins: item.protein,
        fat: item.lemak,
        carbohydrate: item.karbo,
        source: 'dataset'
      }
    }))

    console.log('✅ Final result:', { 
      total: finalData.length,
      withImages: finalData.filter(r => r.image !== '/images/placeholder-food.jpg').length,
      withPlaceholder: finalData.filter(r => r.image === '/images/placeholder-food.jpg').length
    })

    return NextResponse.json({ 
      success: true, 
      data: finalData,
      total: finalData.length
    })

  } catch (err: any) {
    console.error("❌ API Error:", err)
    return NextResponse.json({ 
      success: false, 
      error: err.message,
      data: [] 
    }, { status: 500 })
  }
}
