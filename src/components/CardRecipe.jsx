import { motion } from 'framer-motion';
import Image from 'next/image';

export default function CardRecipe({ data }) {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };
    
    return(
        <motion.article
            variants={itemVariants}
            whileHover={{ y: -8 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer group relative z-0"
            >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <Image
                src={data.image_url}
                alt={data.Title}
                fill
                className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                />
                
                <div className="absolute bottom-3 left-3 z-10">
                <span className="px-3 py-1 bg-[#FE9412] text-white text-xs font-semibold rounded-full">
                    {data['Total Steps']} Tahapan
                </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-[#FE9412] transition-colors">
                    {data.Title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    Total Bahan: {data['Total Ingredients']}
                </p>

                {/* Rating & Author */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-gray-900">
                            ❤️{data.Loves}
                        </span>
                    </div>
                </div>
            </div>
        </motion.article>

    )
}