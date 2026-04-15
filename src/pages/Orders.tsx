import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebase } from '@/components/FirebaseProvider';
import { Order } from '@/types';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Clock, ChevronRight, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'motion/react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export const Orders: React.FC = () => {
  const { user } = useFirebase();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // Note: This query might require a composite index in Firestore: customerId (Ascending), createdAt (Descending)
    const q = query(
      collection(db, 'orders'), 
      where('customerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(data);
      setLoading(false);
    }, (error) => {
      console.error('Firestore Error in Orders:', error);
      // Fallback: try without orderBy if index is missing
      if (error.message.includes('index')) {
        const fallbackQ = query(
          collection(db, 'orders'),
          where('customerId', '==', user.uid)
        );
        onSnapshot(fallbackQ, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
          setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          setLoading(false);
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  if (loading) return (
    <div className="container mx-auto px-4 py-12 space-y-8 bg-[#FAFAFA]">
      <Skeleton className="h-12 w-1/3 rounded-2xl" />
      <div className="space-y-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-[32px]" />)}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[80vh] bg-[#FAFAFA]">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-[#1A1A1A] tracking-tighter">My Orders</h1>
          <p className="text-[#666666]">Track and manage your recent orders</p>
        </div>
        <Badge className="bg-[#FFF1EF] text-[#FF523B] border-none px-6 py-2 rounded-xl font-bold">
          {orders.length} total
        </Badge>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card 
                className="p-8 rounded-[32px] border-none shadow-sm hover:shadow-xl transition-all cursor-pointer group bg-white"
                onClick={() => navigate(`/order/${order.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-[#FFF1EF] rounded-[24px] flex items-center justify-center text-[#FF523B] flex-shrink-0 shadow-sm">
                      <ShoppingBag size={32} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-extrabold text-[#1A1A1A] group-hover:text-[#FF523B] transition-colors tracking-tight">
                        {order.restaurantName || 'Restaurant'}
                      </h3>
                      <div className="flex items-center gap-3 text-sm font-bold text-[#666666]">
                        <span>{order.items.length} items</span>
                        <span>•</span>
                        <span className="text-[#1A1A1A]">${order.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-[#666666]/40 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Order #{order.id.slice(-6).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <Badge className={`px-6 py-2 rounded-xl text-xs font-extrabold uppercase tracking-widest border-none ${
                      order.status === 'delivered' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-[#FFF1EF] text-[#FF523B]'
                    }`}>
                      {order.status.replace(/-/g, ' ')}
                    </Badge>
                    <div className="w-12 h-12 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#666666] group-hover:bg-[#FF523B] group-hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 space-y-8 bg-white rounded-[48px] shadow-sm border border-[#EEEEEE]">
          <div className="w-32 h-32 bg-[#FAFAFA] rounded-full flex items-center justify-center mx-auto text-[#666666]/20">
            <ShoppingBag size={64} />
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">No orders yet</h3>
            <p className="text-[#666666] font-bold max-w-xs mx-auto">Hungry? Start exploring restaurants and place your first order!</p>
          </div>
          <Button 
            onClick={() => navigate('/restaurants')} 
            className="bg-[#FF523B] hover:bg-[#FF523B]/90 h-14 px-10 rounded-2xl font-extrabold text-lg shadow-lg shadow-[#FF523B]/20"
          >
            Explore Restaurants
          </Button>
        </div>
      )}
    </div>
  );
};
