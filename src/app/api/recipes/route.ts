import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const maxCalories = parseInt(searchParams.get('maxCalories') || '500')
    const minProtein = parseInt(searchParams.get('minProtein') || '10')
    const limit = parseInt(searchParams.get('limit') || '8')
    const type = searchParams.get('type') || 'high-protein'
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

    if (error) {
        console.error("Supabase Error:", error)
        return NextResponse.json({ success: false, error: error.message, data: [] })
    }
    
    if (!dataset || dataset.length === 0) {
        return NextResponse.json({ success: true, data: [] })
    }

    const slugs = dataset.map(d => d.slug).filter(Boolean)
    
    const { data: existingImages } = await supabase
      .from('datasetimg')
      .select('slug, image')
      .in('slug', slugs)

    const imageMap = new Map<string, string>()
    existingImages?.forEach(img => {
        if(img.slug) imageMap.set(img.slug, img.image)
    })
    const finalData = await Promise.all(dataset.map(async (item) => {
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
        } else {
           imageUrl = '/images/placeholder-food.jpg' 
        }
      }

      if (!imageUrl) imageUrl = '/images/placeholder-food.jpg'

      return {
        id: item.id,
        name: item.title_cleaned,
        slug: item.slug,
        image: imageUrl,
        calories: Number(item.kalori) || 0,
        proteins: Number(item.protein) || 0,
        fat: Number(item.lemak) || 0,
        carbohydrate: Number(item.karbo) || 0,
      }
    }))

    return NextResponse.json({
      success: true,
      data: finalData
    })

  } catch (error: any) {
    console.error('API Handler Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal Server Error',
      data: []
    })
  }
}
