// lib/recipeData.ts
export interface Recipe {
  id: number;
  title: string;
  image: string;
  cookTime: string;
  servings: number;
  calories: number;
  isFavorite: boolean;
  category: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  description?: string;
}

export const recipesData: Recipe[] = [
  {
    id: 1,
    title: 'Nasi Padang Rendang Rendah Kalori',
    image: '/images/recipes/rendang.jpg',
    cookTime: '45 min',
    servings: 4,
    calories: 350,
    isFavorite: false,
    category: 'Makanan Utama',
    difficulty: 'Sedang',
    description: 'Rendang daging sapi dengan bumbu rempah khas Padang yang kaya rasa',
  },
  {
    id: 2,
    title: 'Sate Ayam Bumbu Kacang Sehat',
    image: '/images/recipes/sate.jpg',
    cookTime: '30 min',
    servings: 3,
    calories: 280,
    isFavorite: true,
    category: 'Makanan Utama',
    difficulty: 'Mudah',
    description: 'Sate ayam dengan bumbu kacang yang lezat dan bergizi',
  },
  {
    id: 3,
    title: 'Gado-Gado Sayur Segar',
    image: '/images/recipes/gado.jpg',
    cookTime: '25 min',
    servings: 2,
    calories: 220,
    isFavorite: false,
    category: 'Salad',
    difficulty: 'Mudah',
    description: 'Salad sayuran segar dengan bumbu kacang khas Indonesia',
  },
  {
    id: 4,
    title: 'Soto Ayam Kuah Bening',
    image: '/images/recipes/soto.jpg',
    cookTime: '40 min',
    servings: 4,
    calories: 300,
    isFavorite: false,
    category: 'Sup',
    difficulty: 'Sedang',
    description: 'Soto ayam dengan kuah bening yang segar dan hangat',
  },
  {
    id: 5,
    title: 'Nasi Goreng Kampung Spesial',
    image: '/images/recipes/nasgor.jpg',
    cookTime: '20 min',
    servings: 2,
    calories: 380,
    isFavorite: true,
    category: 'Makanan Utama',
    difficulty: 'Mudah',
    description: 'Nasi goreng dengan bumbu sederhana namun menggugah selera',
  },
  {
    id: 6,
    title: 'Pecel Lele Sambal Terasi',
    image: '/images/recipes/pecel-lele.jpg',
    cookTime: '35 min',
    servings: 3,
    calories: 320,
    isFavorite: false,
    category: 'Makanan Utama',
    difficulty: 'Sedang',
    description: 'Ikan lele goreng dengan sambal terasi yang pedas mantap',
  },
  {
    id: 7,
    title: 'Ayam Geprek Crispy',
    image: '/images/recipes/ayam-geprek.jpg',
    cookTime: '30 min',
    servings: 2,
    calories: 400,
    isFavorite: false,
    category: 'Makanan Utama',
    difficulty: 'Mudah',
    description: 'Ayam goreng crispy dengan sambal geprek yang pedas',
  },
  {
    id: 8,
    title: 'Bakso Sapi Kuah Segar',
    image: '/images/recipes/bakso.jpg',
    cookTime: '50 min',
    servings: 4,
    calories: 340,
    isFavorite: true,
    category: 'Sup',
    difficulty: 'Sulit',
    description: 'Bakso sapi kenyal dengan kuah kaldu yang gurih',
  },
];

// Function untuk get random recipes
export const getRandomRecipes = (count: number = 4): Recipe[] => {
  const shuffled = [...recipesData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Function untuk get recipe by id
export const getRecipeById = (id: number): Recipe | undefined => {
  return recipesData.find(recipe => recipe.id === id);
};

// Function untuk get favorite recipes
export const getFavoriteRecipes = (): Recipe[] => {
  return recipesData.filter(recipe => recipe.isFavorite);
};
