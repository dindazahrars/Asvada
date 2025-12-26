import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Pastikan kamu punya ENV ini di Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Pakai Service Role agar bisa upload tanpa login user

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 1. Validasi Tipe & Ukuran
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size > 5MB' }, { status: 400 });
    }

    // 2. Setup Supabase Admin
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Convert ke Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Buat Nama Unik
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '-');
    const fileName = `${timestamp}-${cleanName}`;

    // 5. Upload ke Supabase Storage (Bucket 'recipes')
    const { data, error } = await supabase.storage
      .from('recipes') // Pastikan nama bucket di Supabase adalah 'recipes'
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) throw error;

    // 6. Dapatkan Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('recipes')
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      success: true,
      url: publicUrl, // URL ini yang akan disimpan ke database
      filename: fileName 
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload' },
      { status: 500 }
    );
  }
}
