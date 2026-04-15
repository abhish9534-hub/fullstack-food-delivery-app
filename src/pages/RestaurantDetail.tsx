import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant, MenuItem } from '@/types';
import { Star, Clock, MapPin, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/components/CartProvider';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, items, updateQuantity } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchRestaurant = async () => {
      const docRef = doc(db, 'restaurants', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setRestaurant({ id: docSnap.id, ...docSnap.data() } as Restaurant);
      } else {
        toast.error('Restaurant not found');
        navigate('/restaurants');
      }
    };

    const q = query(collection(db, 'restaurants', id, 'menuItems'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
      setMenuItems(data);
      setLoading(false);
    });

    fetchRestaurant();
    return () => unsubscribe();
  }, [id, navigate]);

  const categories = Array.from(new Set(menuItems.map(item => item.category)));
  const filteredMenu = selectedCategory 
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  if (loading) return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <Skeleton className="h-80 w-full rounded-[40px]" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
      </div>
    </div>
  );

  if (!restaurant) return null;

  return (
    <div className="pb-20 bg-[#FAFAFA]">
      {/* Header */}
      <section className="relative h-80 md:h-[400px]">
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/90 via-[#1A1A1A]/30 to-transparent" />
        <div className="absolute top-6 left-6">
          <Button 
            variant="secondary" 
            className="rounded-full bg-white/20 backdrop-blur-md border-none text-white hover:bg-white/30 font-bold"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} className="mr-2" /> Back
          </Button>
        </div>
        <div className="absolute bottom-10 left-0 w-full">
          <div className="container mx-auto px-4 lg:px-10 text-white space-y-4">
            <div className="flex flex-wrap gap-2">
              {restaurant.categories.map(cat => (
                <Badge key={cat} className="bg-[#FF523B] border-none text-white font-bold px-3 py-1 rounded-lg">
                  {cat}
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">{restaurant.name}</h1>
            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-bold opacity-90">
              <span className="flex items-center gap-1.5"><Star size={18} className="fill-[#FFC107] text-[#FFC107]" /> {restaurant.rating.toFixed(1)} Rating</span>
              <span className="flex items-center gap-1.5"><Clock size={18} /> {restaurant.deliveryTime} Delivery</span>
              <span className="flex items-center gap-1.5"><MapPin size={18} /> {restaurant.address}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-10 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Menu Section */}
        <div className="lg:col-span-2 space-y-12">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
            <Button 
              variant="outline"
              className={`rounded-xl px-6 font-bold border-2 transition-all ${
                selectedCategory === null ? "bg-[#FFF1EF] border-[#FF523B] text-[#FF523B]" : "bg-white border-transparent text-[#1A1A1A] shadow-sm"
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              Full Menu
            </Button>
            {categories.map(cat => (
              <Button 
                key={cat}
                variant="outline"
                className={`rounded-xl px-6 font-bold border-2 transition-all ${
                  selectedCategory === cat ? "bg-[#FFF1EF] border-[#FF523B] text-[#FF523B]" : "bg-white border-transparent text-[#1A1A1A] shadow-sm"
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="space-y-12">
            {(selectedCategory ? [selectedCategory] : categories).map(category => (
              <div key={category} className="space-y-6">
                <h2 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight border-l-4 border-[#FF523B] pl-4">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {menuItems.filter(item => item.category === category).map(item => {
                    const cartItem = items.find(i => i.menuItemId === item.id);
                    return (
                      <motion.div 
                        key={item.id}
                        layout
                        className="bg-white p-5 rounded-[20px] border border-[#EEEEEE] flex gap-4 hover:shadow-xl transition-all"
                      >
                        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-grow flex flex-col justify-between py-1">
                          <div>
                            <h4 className="font-bold text-[#1A1A1A]">{item.name}</h4>
                            <p className="text-xs text-[#666666] line-clamp-2 mt-1">{item.description}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-extrabold text-[#FF523B]">${item.price.toFixed(2)}</span>
                            {cartItem ? (
                              <div className="flex items-center gap-3 bg-[#FAFAFA] rounded-xl p-1 border border-[#EEEEEE]">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 rounded-lg hover:bg-[#FFF1EF] hover:text-[#FF523B]"
                                  onClick={() => updateQuantity(item.id, -1)}
                                >
                                  <Minus size={14} />
                                </Button>
                                <span className="text-sm font-bold w-4 text-center text-[#1A1A1A]">{cartItem.quantity}</span>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 rounded-lg hover:bg-[#FFF1EF] hover:text-[#FF523B]"
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  <Plus size={14} />
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                className="bg-[#FF523B] hover:bg-[#FF523B]/90 rounded-xl h-9 px-4 font-bold"
                                onClick={() => addItem(item)}
                              >
                                <Plus size={16} className="mr-1" /> Add
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Cart Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24 bg-white rounded-[32px] border border-[#EEEEEE] shadow-xl overflow-hidden">
            <div className="p-6 bg-[#1A1A1A] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#FF523B]" />
                <h3 className="font-bold">Your Order</h3>
              </div>
              <Badge className="bg-[#FF523B] text-white border-none font-bold">{items.length} items</Badge>
            </div>
            
            <div className="p-6 space-y-6">
              {items.length > 0 ? (
                <>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {items.map(item => (
                      <div key={item.menuItemId} className="flex items-center justify-between gap-4">
                        <div className="flex-grow">
                          <p className="text-sm font-bold text-[#1A1A1A]">{item.name}</p>
                          <p className="text-xs font-bold text-[#666666]">${item.price.toFixed(2)} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-7 w-7 rounded-lg border-[#EEEEEE]"
                            onClick={() => updateQuantity(item.menuItemId, -1)}
                          >
                            <Minus size={12} />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-7 w-7 rounded-lg border-[#EEEEEE]"
                            onClick={() => updateQuantity(item.menuItemId, 1)}
                          >
                            <Plus size={12} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-[#EEEEEE] space-y-4">
                    <div className="flex items-center justify-between text-[#666666] text-sm font-bold">
                      <span>Subtotal</span>
                      <span>${items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#666666] text-sm font-bold">
                      <span>Delivery Fee</span>
                      <span className="text-green-600">FREE</span>
                    </div>
                    <div className="flex items-center justify-between text-xl font-extrabold text-[#1A1A1A] pt-2">
                      <span>Total</span>
                      <span>${items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</span>
                    </div>
                    <Button 
                      className="w-full h-14 bg-[#FF523B] hover:bg-[#FF523B]/90 rounded-2xl font-bold text-lg shadow-lg shadow-[#FF523B]/20"
                      onClick={() => navigate('/cart')}
                    >
                      Checkout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-[#FAFAFA] rounded-full flex items-center justify-center mx-auto text-[#666666]/20">
                    <ShoppingBag size={32} />
                  </div>
                  <p className="text-[#666666] text-sm font-bold">Your cart is empty.<br />Add some delicious items!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Bar */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-4 right-4 lg:hidden z-40"
          >
            <Button 
              className="w-full h-16 bg-[#FF523B] hover:bg-[#FF523B]/90 rounded-2xl shadow-2xl flex items-center justify-between px-6"
              onClick={() => navigate('/cart')}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <ShoppingBag size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold opacity-80">{items.length} items</p>
                  <p className="font-extrabold">View Cart</p>
                </div>
              </div>
              <span className="text-xl font-extrabold">${items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
