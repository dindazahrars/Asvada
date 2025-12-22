'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import ModalRecipeDetail from './ReceipeDetailPublicPage'; 
import { useSession } from 'next-auth/react';

export default function CardRecipe({ data }) {
    const { data: session } = useSession();
    const [show, setShow] = useState(false);

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const handleCardClick = async () => {
        // 1. Langsung buka modal agar UI responsif
        setShow(true);

        // 2. Kirim DATA LENGKAP ke API History (Direct Save)
        if (session?.user) {
            try {
                // Siapkan data yang akan disimpan langsung
                const payload = {
                    save_mode: 'direct_save', // Flag khusus untuk backend
                    
                    // ID (Gunakan RecipeId atau id atau 0)
                    dataset_resep_id: data.RecipeId || data.id || Math.floor(Math.random() * 100000), 
                    
                    title: data.Title,
                    image_url: data.image_url,
                    
                    // Pastikan format string
                    bahan: Array.isArray(data['Ingredients Cleaned']) 
                           ? data['Ingredients Cleaned'].join(', ') 
                           : data['Ingredients Cleaned'] || '',
                           
                    cara_memasak: Array.isArray(data.Steps) 
                           ? data.Steps.join('\n') 
                           : data.Steps || ''
                };

                // Kirim
                await fetch('/api/history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload) 
                });
                
                console.log("📝 Direct history save triggered for:", data.Title);
            } catch (error) {
                console.error("❌ Failed to record history:", error);
            }
        }
    };

    return (
        <>
            <motion.article
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer group relative z-0"
                onClick={handleCardClick}
            >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                    <Image
                        src={data.image_url || '/logo.png'} 
                        alt={data.Title || 'Recipe Image'}
                        fill
                        className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                        unoptimized={true}
                    />
                    <div className="absolute bottom-3 left-3 z-10">
                        <span className="px-3 py-1 bg-[#FE9412] text-white text-xs font-semibold rounded-full">
                            {data['Total Steps'] || 0} Tahapan
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-[#FE9412] transition-colors">
                        {data.Title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        Total Bahan: {data['Total Ingredients'] || 0}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-gray-900">
                                ❤️ {data.Loves || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.article>
            
            {show && (
                <ModalRecipeDetail 
                    onClose={() => setShow(false)} 
                    open={show} 
                    recipe={data} 
                />
            )}
        </>
    );
}