import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/components/CartProvider';
import { useFirebase } from '@/components/FirebaseProvider';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, MapPin, ArrowLeft, CheckCircle2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export const Cart: React.FC = () => {
  const { items, updateQuantity, clearCart, total, restaurantId } = useCart();
  const { user, profile } = useFirebase();
  const navigate = useNavigate();
  const [address, setAddress] = useState(profile?.address || '');
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      return;
    }
    if (!address) {
      toast.error('Please provide a delivery address');
      return;
    }

    setIsPlacing(true);
    try {
      const orderData = {
        customerId: user.uid,
        restaurantId: restaurantId,
        restaurantName: 'The Gourmet Kitchen', // In a real app, fetch this
        items: items.map(i => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        })),
        totalAmount: total,
        status: 'pending',
        deliveryAddress: address,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderComplete(docRef.id);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Order failed', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-8 bg-[#FAFAFA]">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-[#1A1A1A] tracking-tighter">Order Placed!</h1>
          <p className="text-[#666666] max-w-md mx-auto font-bold">
            Your order has been received and is being prepared. You can track its status in real-time.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate(`/order/${orderComplete}`)} className="bg-[#FF523B] hover:bg-[#FF523B]/90 h-14 px-10 rounded-2xl font-bold text-lg shadow-lg shadow-[#FF523B]/20">
            Track Order
          </Button>
          <Button variant="outline" onClick={() => navigate('/')} className="h-14 px-10 rounded-2xl font-bold text-lg border-[#EEEEEE] bg-white">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-8 bg-[#FAFAFA]">
        <div className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center mx-auto text-[#666666]/20 shadow-sm border border-[#EEEEEE]">
          <ShoppingBag size={64} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tighter">Your cart is empty</h1>
          <p className="text-[#666666] font-bold">Looks like you haven't added anything yet.</p>
        </div>
        <Button onClick={() => navigate('/restaurants')} className="bg-[#FF523B] hover:bg-[#FF523B]/90 h-14 px-10 rounded-2xl font-bold text-lg shadow-lg shadow-[#FF523B]/20">
          Browse Restaurants
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-[#FAFAFA]">
      <div className="flex items-center gap-4 mb-12">
        <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full hover:bg-[#FFF1EF] hover:text-[#FF523B]">
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-4xl font-extrabold text-[#1A1A1A] tracking-tighter">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Items List */}
          <Card className="p-8 rounded-[32px] border-[#EEEEEE] shadow-sm bg-white">
            <h3 className="text-xl font-extrabold mb-8 flex items-center gap-2 text-[#1A1A1A]">
              <ShoppingBag size={20} className="text-[#FF523B]" /> Review Items
            </h3>
            <div className="space-y-8">
              <AnimatePresence mode="popLayout">
                {items.map(item => (
                  <motion.div 
                    key={item.menuItemId}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-6"
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-[#EEEEEE]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-[#1A1A1A]">{item.name}</h4>
                      <p className="text-sm font-bold text-[#666666]">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-4 bg-[#FAFAFA] rounded-xl p-1 border border-[#EEEEEE]">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-lg hover:bg-[#FFF1EF] hover:text-[#FF523B]"
                        onClick={() => updateQuantity(item.menuItemId, -1)}
                      >
                        <Minus size={14} />
                      </Button>
                      <span className="text-sm font-bold w-4 text-center text-[#1A1A1A]">{item.quantity}</span>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-lg hover:bg-[#FFF1EF] hover:text-[#FF523B]"
                        onClick={() => updateQuantity(item.menuItemId, 1)}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="font-extrabold text-[#1A1A1A]">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <Separator className="my-8 bg-[#EEEEEE]" />
            <div className="flex justify-between items-center">
              <Button variant="ghost" onClick={clearCart} className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2 font-bold rounded-xl">
                <Trash2 size={18} /> Clear Cart
              </Button>
              <div className="text-right">
                <p className="text-sm font-bold text-[#666666]">Subtotal</p>
                <p className="text-3xl font-extrabold text-[#1A1A1A] tracking-tighter">${total.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          {/* Delivery Details */}
          <Card className="p-8 rounded-[32px] border-[#EEEEEE] shadow-sm bg-white">
            <h3 className="text-xl font-extrabold mb-8 flex items-center gap-2 text-[#1A1A1A]">
              <MapPin size={20} className="text-[#FF523B]" /> Delivery Address
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-[#666666]" size={20} />
                <textarea 
                  placeholder="Enter your full delivery address..." 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-32 pl-12 pr-4 py-4 bg-[#FAFAFA] border-[#EEEEEE] rounded-[20px] text-[#1A1A1A] font-bold placeholder:text-[#666666]/50 focus:ring-2 focus:ring-[#FF523B]/20 focus:border-[#FF523B] transition-all outline-none resize-none"
                />
              </div>
              <p className="text-xs font-bold text-[#666666]/60">
                Please ensure your address is accurate to avoid delivery delays.
              </p>
            </div>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-8">
          <Card className="p-8 rounded-[32px] border-[#EEEEEE] shadow-xl bg-[#1A1A1A] text-white">
            <h3 className="text-xl font-extrabold mb-8 tracking-tight">Order Summary</h3>
            <div className="space-y-5">
              <div className="flex justify-between text-white/60 font-bold">
                <span>Items Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/60 font-bold">
                <span>Delivery Fee</span>
                <span className="text-green-400">FREE</span>
              </div>
              <div className="flex justify-between text-white/60 font-bold">
                <span>Taxes & Charges</span>
                <span>${(total * 0.05).toFixed(2)}</span>
              </div>
              <Separator className="bg-white/10 my-4" />
              <div className="flex justify-between text-3xl font-extrabold tracking-tighter">
                <span>Total</span>
                <span>${(total * 1.05).toFixed(2)}</span>
              </div>
            </div>
            <Button 
              className="w-full h-16 bg-[#FF523B] hover:bg-[#FF523B]/90 rounded-2xl font-extrabold text-lg mt-10 shadow-2xl shadow-[#FF523B]/40 disabled:opacity-50"
              disabled={isPlacing || !address}
              onClick={handlePlaceOrder}
            >
              {isPlacing ? 'Processing...' : 'Place Order'}
            </Button>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest">
              <CreditCard size={14} /> Secure Checkout
            </div>
          </Card>

          <div className="p-6 bg-[#FFF1EF] rounded-[24px] border border-[#FF523B]/10 space-y-3">
            <h4 className="font-extrabold text-[#FF523B] flex items-center gap-2">
              <Star size={16} className="fill-[#FF523B]" /> BiteDash Pro
            </h4>
            <p className="text-sm font-bold text-[#FF523B]/80 leading-relaxed">
              You're saving $4.99 on delivery fees with your BiteDash Pro trial!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
