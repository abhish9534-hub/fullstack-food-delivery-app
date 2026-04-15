import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, MapPin, ArrowRight, Star, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export const Home: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'restaurants'), limit(4));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant));
      setRestaurants(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-16 pb-20 bg-[#FAFAFA]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#1A1A1A] leading-tight tracking-tighter">
              What's on your <br />
              <span className="text-[#FF523B]">mind</span>?
            </h1>
            <p className="text-xl text-[#666666] max-w-lg">
              Discover the best restaurants in your area and get your favorite meals delivered straight to your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md">
              <div className="relative flex-grow">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]" size={20} />
                <Input 
                  placeholder="Enter your delivery address" 
                  className="pl-12 h-14 bg-white border-[#EEEEEE] text-[#1A1A1A] rounded-2xl text-lg shadow-sm focus-visible:ring-[#FF523B]"
                />
              </div>
              <Button className="h-14 px-8 bg-[#FF523B] hover:bg-[#FF523B]/90 text-white rounded-2xl text-lg font-bold shadow-lg shadow-[#FF523B]/20">
                Find Food
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000" 
              alt="Delicious Food" 
              className="w-full h-[500px] object-cover rounded-[40px] shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-[#FFF1EF] rounded-2xl flex items-center justify-center text-[#FF523B]">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-[#666666]">Fastest Delivery</p>
                <p className="text-lg font-bold text-[#1A1A1A]">25-35 mins</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {[
            { icon: "🍔", label: "Burgers", active: true },
            { icon: "🍕", label: "Pizza" },
            { icon: "🍣", label: "Sushi" },
            { icon: "🍜", label: "Ramen" },
            { icon: "🍰", label: "Desserts" },
            { icon: "🥗", label: "Salads" },
            { icon: "🌮", label: "Tacos" }
          ].map((cat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className={`flex-shrink-0 w-28 p-4 rounded-[20px] text-center shadow-sm border-2 transition-all cursor-pointer ${
                cat.active ? 'bg-[#FFF1EF] border-[#FF523B]' : 'bg-white border-transparent'
              }`}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">{cat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Restaurants Preview */}
      <section className="container mx-auto px-4 space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Popular Restaurants</h2>
            <p className="text-[#666666]">Explore the most popular spots in town</p>
          </div>
          <Link to="/restaurants">
            <Button variant="ghost" className="text-[#FF523B] hover:text-[#FF523B] hover:bg-[#FFF1EF] gap-2 font-bold">
              View All <ArrowRight size={18} />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] rounded-[20px]" />
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
              </div>
            ))
          ) : restaurants.length > 0 ? (
            restaurants.map((restaurant, i) => (
              <motion.div 
                key={restaurant.id} 
                whileHover={{ y: -10 }}
                className="group cursor-pointer bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-xl transition-all"
              >
                <Link to={`/restaurant/${restaurant.id}`}>
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img 
                      src={restaurant.image} 
                      alt={restaurant.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-[#FFC107] px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-extrabold text-[#1A1A1A] shadow-sm">
                      ★ {restaurant.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <h4 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#FF523B] transition-colors">{restaurant.name}</h4>
                    <p className="text-sm text-[#666666] line-clamp-1">{restaurant.categories.join(' • ')}</p>
                    <div className="flex items-center gap-4 text-xs font-bold text-[#666666]/60">
                      <span className="flex items-center gap-1"><Clock size={12} /> {restaurant.deliveryTime}</span>
                      <span>•</span>
                      <span>Free Delivery</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-[32px] border border-[#EEEEEE]">
              <p className="text-[#666666] font-bold">No restaurants available yet.</p>
              <Link to="/restaurants">
                <Button variant="link" className="text-[#FF523B] font-bold">Browse All</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="bg-[#FF523B] rounded-[40px] p-12 md:p-20 text-center text-white space-y-8 relative overflow-hidden shadow-2xl shadow-[#FF523B]/30">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
          
          <h2 className="text-4xl md:text-5xl font-extrabold relative z-10 tracking-tighter">Ready to order?</h2>
          <p className="text-xl text-white/80 max-w-xl mx-auto relative z-10">
            Join thousands of happy customers and get your favorite food delivered today.
          </p>
          <div className="relative z-10">
            <Link to="/restaurants">
              <Button className="bg-white text-[#FF523B] hover:bg-white/90 h-14 px-10 rounded-2xl text-lg font-bold shadow-xl">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
