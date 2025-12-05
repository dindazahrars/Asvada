import { NextResponse } from 'next/server';
import { createSupabaseBrowser } from '@/lib/supabase_client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Ambil semua favorites user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('🔍 GET Favorites - Session:', session?.user?.email);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    const supabase = createSupabaseBrowser();

    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    console.log('👤 User Data:', userData, userError);

    if (!userData || userError) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    // Get favorites
    const { data: favorites, error: favError } = await supabase
      .from('favorite')
      .select('id, id_recipe, created_at')
      .eq('id_user', userData.id)
      .order('created_at', { ascending: false });

    console.log('❤️ Favorites Data:', favorites, favError);

    if (favError) {
      console.error('Error fetching favorites:', favError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to fetch favorites',
        error: favError.message 
      }, { status: 500 });
    }

    // Get recipe details for each favorite
    const recipeIds = favorites?.map(f => f.id_recipe) || [];
    
    console.log('📋 Recipe IDs:', recipeIds);
    
    if (recipeIds.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [] 
      });
    }

    // Fetch recipes from dataset
    const { data: recipes, error: recipeError } = await supabase
      .from('dataset')
      .select('*')
      .in('id', recipeIds);

    console.log('🍽️ Recipes Data:', recipes, recipeError);

    // Fetch images
    const recipesWithImages = await Promise.all(
      (recipes || []).map(async (recipe) => {
        const { data: imageData } = await supabase
          .from('datasetimg')
          .select('image')
          .eq('slug', recipe.slug)
          .single();

        const favorite = favorites?.find(f => f.id_recipe === recipe.id);

        return {
          id: String(recipe.id), // PENTING: Convert ke string
          favoriteId: favorite?.id,
          name: recipe.title_cleaned,
          image: imageData?.image || '/images/placeholder-food.jpg',
          slug: recipe.slug,
          calories: recipe.kalori || 0,
          proteins: recipe.protein || 0,
          fat: recipe.lemak || 0,
          carbohydrate: recipe.karbo || 0,
          savedAt: favorite?.created_at,
          source: 'dataset'
        };
      })
    );

    console.log('✅ Final Data:', recipesWithImages);

    return NextResponse.json({ 
      success: true, 
      data: recipesWithImages 
    });

  } catch (error) {
    console.error('❌ Error in favorites API:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: String(error)
    }, { status: 500 });
  }
}

// POST - Add to favorites
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('🔍 POST Favorites - Session:', session?.user?.email);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { recipeId } = body;

    console.log('📝 POST Body:', body);

    if (!recipeId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Recipe ID is required' 
      }, { status: 400 });
    }

    const supabase = createSupabaseBrowser();

    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    console.log('👤 User Data:', userData, userError);

    if (!userData || userError) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    // Check if already favorited
    const { data: existing, error: existError } = await supabase
      .from('favorite')
      .select('id')
      .eq('id_user', userData.id)
      .eq('id_recipe', recipeId)
      .maybeSingle(); // Use maybeSingle instead of single

    console.log('🔍 Existing favorite:', existing, existError);

    if (existing) {
      return NextResponse.json({ 
        success: false, 
        message: 'Already in favorites' 
      }, { status: 400 });
    }

    // Add to favorites
    const { data, error } = await supabase
      .from('favorite')
      .insert({
        id_user: userData.id,
        id_recipe: parseInt(recipeId) // Convert to integer
      })
      .select()
      .single();

    console.log('✅ Insert Result:', data, error);

    if (error) {
      console.error('Error adding favorite:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to add favorite',
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Added to favorites' 
    });

  } catch (error) {
    console.error('❌ Error in favorites POST:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: String(error)
    }, { status: 500 });
  }
}

// DELETE - Remove from favorites
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('🔍 DELETE Favorites - Session:', session?.user?.email);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('recipeId');

    console.log('🗑️ DELETE recipeId:', recipeId);

    if (!recipeId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Recipe ID is required' 
      }, { status: 400 });
    }

    const supabase = createSupabaseBrowser();

    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    console.log('👤 User Data:', userData, userError);

    if (!userData || userError) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    // Delete favorite
    const { error } = await supabase
      .from('favorite')
      .delete()
      .eq('id_user', userData.id)
      .eq('id_recipe', parseInt(recipeId)); // Convert to integer

    console.log('✅ Delete Result:', error);

    if (error) {
      console.error('Error deleting favorite:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to remove favorite',
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Removed from favorites' 
    });

  } catch (error) {
    console.error('❌ Error in favorites DELETE:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: String(error)
    }, { status: 500 });
  }
}
