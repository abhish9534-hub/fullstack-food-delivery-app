import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant } from '@/types';
import { Link } from 'react-router-dom';
import { Star, Clock, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'motion/react';

export const RestaurantList: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'restaurants'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant));
      setRestaurants(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categories = Array.from(new Set(restaurants.flatMap(r => r.categories)));

  const filtered = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || 
                         r.categories.some(c => c.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !selectedCategory || r.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 bg-[#FAFAFA]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-[#1A1A1A] tracking-tighter">All Restaurants</h1>
          <p className="text-[#666666]">Find your favorite flavors near you</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]" size={18} />
            <Input 
              placeholder="Search restaurants or cuisines..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 bg-white border-[#EEEEEE] rounded-2xl text-sm focus-visible:ring-[#FF523B]"
            />
          </div>
          <Button variant="outline" className="h-12 rounded-2xl gap-2 border-[#EEEEEE] bg-white font-bold text-[#1A1A1A]">
            <Filter size={18} /> Filters
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Badge 
          variant="outline"
          className={`cursor-pointer px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-2 ${
            selectedCategory === null ? "bg-[#FFF1EF] border-[#FF523B] text-[#FF523B]" : "bg-white border-transparent text-[#1A1A1A] shadow-sm"
          }`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Badge>
        {categories.map(cat => (
          <Badge 
            key={cat}
            variant="outline"
            className={`cursor-pointer px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-2 ${
              selectedCategory === cat ? "bg-[#FFF1EF] border-[#FF523B] text-[#FF523B]" : "bg-white border-transparent text-[#1A1A1A] shadow-sm"
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-[4/3] rounded-[20px]" />
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((restaurant, i) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/restaurant/${restaurant.id}`} className="group block bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img 
                    src={restaurant.image} 
                    alt={restaurant.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-4 right-4 bg-[#FFC107] px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-extrabold text-[#1A1A1A] shadow-sm">
                    ★ {restaurant.rating.toFixed(1)}
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#FF523B] transition-colors">{restaurant.name}</h3>
                  <p className="text-sm text-[#666666] line-clamp-1">{restaurant.categories.join(' • ')}</p>
                  <div className="flex items-center gap-4 text-xs font-bold text-[#666666]/60 pt-1">
                    <span className="flex items-center gap-1"><Clock size={12} /> {restaurant.deliveryTime}</span>
                    <span>•</span>
                    <span className="line-clamp-1">{restaurant.address}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 space-y-6 bg-white rounded-[40px] shadow-sm border border-[#EEEEEE]">
          <div className="w-24 h-24 bg-[#FAFAFA] rounded-full flex items-center justify-center mx-auto text-[#666666]/20">
            <Search size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-[#1A1A1A]">No restaurants found</h3>
            <p className="text-[#666666]">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => { setSearch(''); setSelectedCategory(null); }}
            className="rounded-xl border-[#FF523B] text-[#FF523B] hover:bg-[#FFF1EF] font-bold"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};
