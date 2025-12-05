import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Pakai env yang sudah ada
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
// MAIN API ROUTE
// ==========================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const maxCalories = parseInt(searchParams.get('maxCalories') || '500')
    const minProtein = parseInt(searchParams.get('minProtein') || '10')
    const limit = parseInt(searchParams.get('limit') || '8')
    const type = searchParams.get('type') || 'high-protein'
    const source = searchParams.get('source') || 'all'

    console.log('🔍 API Request:', { maxCalories, minProtein, limit, type, source })

    let allRecipes: any[] = []

    // ------------------------------------------
    // 1. DATASET RECIPES
    // ------------------------------------------
    if (source === 'dataset' || source === 'all') {
      console.log('📊 Fetching from dataset...')
      
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

      const datasetLimit = source === 'all' ? Math.floor(limit / 2) : limit
      const { data: dataset, error } = await baseQuery.limit(datasetLimit)

      console.log('📦 Dataset result:', { count: dataset?.length, error })

      if (!error && dataset && dataset.length > 0) {
        const slugs = dataset.map(d => d.slug).filter(Boolean)
        const { data: existingImages } = await supabase
          .from('datasetimg')
          .select('slug, image')
          .in('slug', slugs)

        const imageMap = new Map<string, string>()
        existingImages?.forEach(img => {
          if(img.slug) imageMap.set(img.slug, img.image)
        })

        const processedDataset = await Promise.all(dataset.map(async (item) => {
          let imageUrl = item.slug ? imageMap.get(item.slug) : null
          
          if (!imageUrl && item.title_cleaned) {
            const unsplashImg = await fetchUnsplashImage(item.title_cleaned)
            
            if (unsplashImg) {
              imageUrl = unsplashImg
              
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
              }
            }
          }

          console.log(`📷 Dataset [${item.slug}] image:`, imageUrl)

          return {
            id: `dataset-${item.id}`,
            name: item.title_cleaned,
            image: imageUrl || '/images/placeholder-food.jpg',
            slug: item.slug,
            calories: item.kalori,
            proteins: item.protein,
            fat: item.lemak,
            carbohydrate: item.karbo,
            source: 'dataset'
          }
        }))

        allRecipes = [...allRecipes, ...processedDataset]
      }
    }

    // ------------------------------------------
    // 2. USER RECIPES (PAKAI UNSPLASH)
    // ------------------------------------------
    if (source === 'user' || source === 'all') {
      console.log('👥 Fetching from user recipes...')
      
      const userLimit = source === 'all' ? Math.floor(limit / 2) : limit
      
      const { data: userRecipes, error: userError } = await supabase
        .from('resep')
        .select(`
          id, 
          title, 
          description, 
          prep_time, 
          cook_time, 
          servings, 
          difficulty, 
          category,
          status,
          created_at,
          user_id
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(userLimit)

      console.log('📦 User recipes result:', { count: userRecipes?.length, error: userError })

      if (!userError && userRecipes && userRecipes.length > 0) {
        // Get user names
        const userIds = [...new Set(userRecipes.map(r => r.user_id))]
        const { data: users } = await supabase
          .from('users')
          .select('id, name')
          .in('id', userIds)

        const userMap = new Map(users?.map(u => [u.id, u.name]) || [])

        // Cek cache gambar di resepimg
        const recipeIds = userRecipes.map(r => r.id)
        const { data: existingUserImages } = await supabase
          .from('resepimg')
          .select('recipe_id, image')
          .in('recipe_id', recipeIds)

        const userImageMap = new Map<number, string>()
        existingUserImages?.forEach(img => {
          if(img.recipe_id) userImageMap.set(img.recipe_id, img.image)
        })

        // Process dengan Unsplash
        const processedUserRecipes = await Promise.all(userRecipes.map(async (item: any) => {
          let imageUrl = userImageMap.get(item.id)
          
          if (!imageUrl && item.title) {
            const unsplashImg = await fetchUnsplashImage(item.title)
            
            if (unsplashImg) {
              imageUrl = unsplashImg
              
              await supabase.from('resepimg').upsert({
                recipe_id: item.id,
                title: item.title,
                image: unsplashImg
              }, { onConflict: 'recipe_id' })
            }
          }

          console.log(`🖼️ User recipe [${item.id}] image:`, imageUrl)
          
          return {
            id: `user-${item.id}`,
            name: item.title,
            description: item.description,
            image: imageUrl || '/images/placeholder-food.jpg',
            slug: `user-${item.id}`,
            calories: 0,
            proteins: 0,
            fat: 0,
            carbohydrate: 0,
            prep_time: item.prep_time,
            cook_time: item.cook_time,
            servings: item.servings,
            difficulty: item.difficulty,
            category: item.category,
            author: userMap.get(item.user_id) || 'Anonymous',
            created_at: item.created_at,
            source: 'user'
          }
        }))

        allRecipes = [...allRecipes, ...processedUserRecipes]
      }
    }

    // ------------------------------------------
    // 3. SHUFFLE & RETURN
    // ------------------------------------------
    const shuffled = allRecipes.sort(() => Math.random() - 0.5)
    const finalRecipes = shuffled.slice(0, limit)

    console.log('✅ Final result:', { 
      total: finalRecipes.length,
      dataset: finalRecipes.filter(r => r.source === 'dataset').length,
      user: finalRecipes.filter(r => r.source === 'user').length
    })

    return NextResponse.json({ 
      success: true, 
      data: finalRecipes,
      total: finalRecipes.length,
      sources: {
        dataset: finalRecipes.filter(r => r.source === 'dataset').length,
        user: finalRecipes.filter(r => r.source === 'user').length
      }
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
