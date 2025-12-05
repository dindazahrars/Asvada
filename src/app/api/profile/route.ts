import { NextResponse } from 'next/server';
import { createSupabaseBrowser } from '@/lib/supabase_client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get user profile
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('🔍 GET Profile - Session:', session?.user?.email);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    const supabase = createSupabaseBrowser();

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    console.log('👤 User Data:', userData, userError);

    if (!userData || userError) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    // Get stats
    // 1. Count favorites
    const { count: favoritesCount } = await supabase
      .from('favorite')
      .select('*', { count: 'exact', head: true })
      .eq('id_user', userData.id);

    // 2. Count recipes created (if you have a recipes table)
    // For now, we'll use dummy data or you can add this later
    const recipesCount = 0; // TODO: Implement when you have user recipes

    // 3. Count achievements (parse from achievement column if JSON)
    let achievementsCount = 0;
    if (userData.achievement) {
      try {
        const achievements = JSON.parse(userData.achievement);
        achievementsCount = Array.isArray(achievements) ? achievements.length : 0;
      } catch (e) {
        achievementsCount = 0;
      }
    }

    const profile = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      bio: userData.bio || '',
      createdAt: userData.created_at,
      stats: {
        recipes: recipesCount,
        favorites: favoritesCount || 0,
        achievements: achievementsCount
      }
    };

    console.log('✅ Profile Data:', profile);

    return NextResponse.json({ 
      success: true, 
      data: profile 
    });

  } catch (error) {
    console.error('❌ Error in profile GET:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: String(error)
    }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('🔍 PUT Profile - Session:', session?.user?.email);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { bio, username } = body;

    console.log('📝 Update Data:', { bio, username });

    const supabase = createSupabaseBrowser();

    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!userData || userError) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    // Update profile
    const updateData: any = {};
    if (bio !== undefined) updateData.bio = bio;
    if (username !== undefined) updateData.username = username;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userData.id)
      .select()
      .single();

    console.log('✅ Update Result:', data, error);

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to update profile',
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Profile updated successfully' 
    });

  } catch (error) {
    console.error('❌ Error in profile PUT:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: String(error)
    }, { status: 500 });
  }
}
