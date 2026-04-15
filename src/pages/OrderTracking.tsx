import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  Bike, 
  Home, 
  ArrowLeft, 
  MapPin, 
  Phone,
  MessageSquare,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'orders', id), (doc) => {
      if (doc.exists()) {
        setOrder({ id: doc.id, ...doc.data() } as Order);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  if (loading) return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <Skeleton className="h-12 w-1/3" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <Skeleton className="lg:col-span-2 h-[500px] rounded-[40px]" />
        <Skeleton className="h-[500px] rounded-[40px]" />
      </div>
    </div>
  );

  if (!order) return (
    <div className="container mx-auto px-4 py-20 text-center space-y-4">
      <h1 className="text-2xl font-bold">Order not found</h1>
      <Button onClick={() => navigate('/orders')}>Back to My Orders</Button>
    </div>
  );

  const steps = [
    { status: 'pending', label: 'Order Placed', icon: CheckCircle2, desc: 'We have received your order' },
    { status: 'preparing', label: 'Preparing', icon: ChefHat, desc: 'The kitchen is working its magic' },
    { status: 'out-for-delivery', label: 'Out for Delivery', icon: Bike, desc: 'Our rider is on the way' },
    { status: 'delivered', label: 'Delivered', icon: Home, desc: 'Enjoy your delicious meal!' }
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.status);

  return (
    <div className="container mx-auto px-4 py-12 bg-[#FAFAFA]">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/orders')} className="rounded-full hover:bg-[#FFF1EF] hover:text-[#FF523B]">
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1 className="text-4xl font-extrabold text-[#1A1A1A] tracking-tighter">Track Order</h1>
            <p className="text-sm font-bold text-[#666666]">Order #{order.id.slice(-8).toUpperCase()}</p>
          </div>
        </div>
        <Badge className={`px-6 py-2 rounded-xl text-xs font-extrabold tracking-widest border-none shadow-sm ${
          order.status === 'delivered' ? 'bg-green-500 text-white' : 'bg-[#FF523B] text-white animate-pulse'
        }`}>
          {order.status.replace(/-/g, ' ').toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Tracking Progress */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-10 rounded-[40px] border-[#EEEEEE] shadow-sm overflow-hidden relative bg-white">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#FAFAFA]">
              <motion.div 
                className="h-full bg-[#FF523B]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>

            <div className="space-y-12">
              {steps.map((step, i) => {
                const isCompleted = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                
                return (
                  <div key={step.status} className="flex gap-6 relative">
                    {i < steps.length - 1 && (
                      <div className={`absolute left-7 top-14 w-0.5 h-12 ${
                        i < currentStepIndex ? 'bg-[#FF523B]' : 'bg-[#FAFAFA]'
                      }`} />
                    )}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 border-2 ${
                      isCompleted ? 'bg-[#FF523B] text-white border-[#FF523B] shadow-lg shadow-[#FF523B]/30' : 'bg-white text-[#666666]/20 border-[#EEEEEE]'
                    }`}>
                      <step.icon size={28} className={isCurrent ? 'animate-bounce' : ''} />
                    </div>
                    <div className="pt-1">
                      <h3 className={`text-xl font-extrabold tracking-tight ${isCompleted ? 'text-[#1A1A1A]' : 'text-[#666666]/30'}`}>
                        {step.label}
                      </h3>
                      <p className={`text-sm font-bold ${isCompleted ? 'text-[#666666]' : 'text-[#666666]/20'}`}>
                        {step.desc}
                      </p>
                    </div>
                    {isCurrent && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="ml-auto bg-[#FFF1EF] text-[#FF523B] px-4 py-1.5 rounded-xl text-xs font-extrabold tracking-widest self-start"
                      >
                        ACTIVE
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Map/Rider Info Placeholder */}
          <Card className="p-8 rounded-[40px] border-[#EEEEEE] shadow-sm bg-white flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#FAFAFA] border-4 border-white shadow-lg">
              <img src="https://picsum.photos/seed/rider/200" alt="Rider" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-grow text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h4 className="text-xl font-extrabold text-[#1A1A1A]">Alex Johnson</h4>
                <Badge variant="secondary" className="bg-[#FFC107] text-[#1A1A1A] hover:bg-[#FFC107] font-extrabold rounded-lg">
                  ★ 4.9
                </Badge>
              </div>
              <p className="text-[#666666] font-bold">Your delivery partner is on the way with your order.</p>
            </div>
            <div className="flex gap-3">
              <Button size="icon" variant="outline" className="h-14 w-14 rounded-2xl border-[#EEEEEE] bg-[#FAFAFA] hover:bg-[#FFF1EF] hover:text-[#FF523B] hover:border-[#FF523B]">
                <Phone size={24} />
              </Button>
              <Button size="icon" variant="outline" className="h-14 w-14 rounded-2xl border-[#EEEEEE] bg-[#FAFAFA] hover:bg-[#FFF1EF] hover:text-[#FF523B] hover:border-[#FF523B]">
                <MessageSquare size={24} />
              </Button>
            </div>
          </Card>
        </div>

        {/* Order Details Sidebar */}
        <div className="space-y-8">
          <Card className="p-8 rounded-[40px] border-[#EEEEEE] shadow-sm space-y-8 bg-white">
            <h3 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">Order Details</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#FFF1EF] rounded-xl flex items-center justify-center text-[#FF523B] flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#666666]/40 uppercase tracking-widest">Delivery Address</p>
                  <p className="text-sm text-[#1A1A1A] font-bold leading-relaxed">{order.deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#FFF1EF] rounded-xl flex items-center justify-center text-[#FF523B] flex-shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#666666]/40 uppercase tracking-widest">Estimated Delivery</p>
                  <p className="text-sm text-[#1A1A1A] font-bold">25 - 35 mins</p>
                </div>
              </div>
            </div>

            <Separator className="bg-[#EEEEEE]" />

            <div className="space-y-4">
              <p className="text-xs font-extrabold text-[#666666]/40 uppercase tracking-widest">Items</p>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-[#666666] font-bold">
                      <span className="text-[#FF523B]">{item.quantity}x</span> {item.name}
                    </span>
                    <span className="font-extrabold text-[#1A1A1A]">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-[#EEEEEE]" />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#666666] font-bold">Total Amount</span>
                <span className="text-2xl font-extrabold text-[#1A1A1A] tracking-tighter">${order.totalAmount.toFixed(2)}</span>
              </div>
              <p className="text-[10px] font-bold text-[#666666]/40 text-center pt-6 uppercase tracking-widest">
                Paid via Credit Card • {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </Card>

          <div className="bg-[#1A1A1A] rounded-[40px] p-8 text-white space-y-6 shadow-xl">
            <div className="space-y-2">
              <h4 className="text-xl font-extrabold tracking-tight">Need help?</h4>
              <p className="text-sm font-bold text-white/60 leading-relaxed">If you have any issues with your order, our support team is available 24/7.</p>
            </div>
            <Button className="w-full bg-[#FF523B] text-white hover:bg-[#FF523B]/90 rounded-2xl h-14 font-extrabold text-lg shadow-lg shadow-[#FF523B]/20">
              Chat with Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
