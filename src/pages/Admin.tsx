import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, doc, updateDoc, deleteDoc, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant, MenuItem, Order } from '@/types';
import { bootstrapData } from '@/lib/bootstrap';
import { 
  Plus, 
  Store, 
  Utensils, 
  ClipboardList, 
  Trash2, 
  Edit2, 
  Search, 
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Bike,
  ChefHat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from 'sonner';
import { useFirebase } from '@/components/FirebaseProvider';

export const Admin: React.FC = () => {
  const { user, isAdmin } = useFirebase();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    description: '',
    image: '',
    categories: '',
    address: '',
    deliveryTime: '25-35 min'
  });

  const [newMenuItem, setNewMenuItem] = useState({
    restaurantId: '',
    name: '',
    description: '',
    price: '',
    image: '',
    category: ''
  });

  useEffect(() => {
    if (!isAdmin) return;

    const qRest = query(collection(db, 'restaurants'));
    const unsubRest = onSnapshot(qRest, (snap) => {
      setRestaurants(snap.docs.map(d => ({ id: d.id, ...d.data() } as Restaurant)));
    });

    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    });

    return () => { unsubRest(); unsubOrders(); };
  }, [isAdmin]);

  const handleAddRestaurant = async () => {
    try {
      await addDoc(collection(db, 'restaurants'), {
        ...newRestaurant,
        categories: newRestaurant.categories.split(',').map(c => c.trim()),
        rating: 4.5,
        ownerId: user?.uid
      });
      toast.success('Restaurant added!');
      setNewRestaurant({ name: '', description: '', image: '', categories: '', address: '', deliveryTime: '25-35 min' });
    } catch (e) {
      toast.error('Failed to add restaurant');
    }
  };

  const handleAddMenuItem = async () => {
    try {
      if (!newMenuItem.restaurantId) return toast.error('Select a restaurant');
      await addDoc(collection(db, 'restaurants', newMenuItem.restaurantId, 'menuItems'), {
        ...newMenuItem,
        price: parseFloat(newMenuItem.price),
        isAvailable: true
      });
      toast.success('Menu item added!');
      setNewMenuItem({ restaurantId: '', name: '', description: '', price: '', image: '', category: '' });
    } catch (e) {
      toast.error('Failed to add menu item');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: new Date().toISOString() });
      toast.success(`Order status updated to ${status}`);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleSeedData = async () => {
    try {
      await bootstrapData();
      toast.success('Sample data seeded successfully!');
    } catch (e) {
      toast.error('Failed to seed data');
    }
  };

  if (!isAdmin) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
      <p>You do not have permission to view this page.</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 bg-[#FAFAFA]">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-extrabold text-[#1A1A1A] tracking-tighter">Admin Dashboard</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleSeedData} className="rounded-xl border-[#EEEEEE] bg-white hover:bg-[#FAFAFA] font-bold">
            Seed Sample Data
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#FF523B] hover:bg-[#FF523B]/90 rounded-2xl h-12 px-6 font-extrabold shadow-lg shadow-[#FF523B]/20 gap-2">
                <Plus size={18} /> Add Restaurant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold tracking-tight">Add New Restaurant</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="font-bold text-[#1A1A1A]">Name</Label>
                  <Input id="name" className="rounded-xl border-[#EEEEEE] bg-[#FAFAFA] h-12 font-bold" value={newRestaurant.name} onChange={e => setNewRestaurant({...newRestaurant, name: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="desc" className="font-bold text-[#1A1A1A]">Description</Label>
                  <Textarea id="desc" className="rounded-xl border-[#EEEEEE] bg-[#FAFAFA] min-h-[100px] font-bold" value={newRestaurant.description} onChange={e => setNewRestaurant({...newRestaurant, description: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="img" className="font-bold text-[#1A1A1A]">Image URL</Label>
                  <Input id="img" className="rounded-xl border-[#EEEEEE] bg-[#FAFAFA] h-12 font-bold" value={newRestaurant.image} onChange={e => setNewRestaurant({...newRestaurant, image: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cats" className="font-bold text-[#1A1A1A]">Categories (comma separated)</Label>
                  <Input id="cats" className="rounded-xl border-[#EEEEEE] bg-[#FAFAFA] h-12 font-bold" value={newRestaurant.categories} onChange={e => setNewRestaurant({...newRestaurant, categories: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="addr" className="font-bold text-[#1A1A1A]">Address</Label>
                  <Input id="addr" className="rounded-xl border-[#EEEEEE] bg-[#FAFAFA] h-12 font-bold" value={newRestaurant.address} onChange={e => setNewRestaurant({...newRestaurant, address: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddRestaurant} className="bg-[#FF523B] hover:bg-[#FF523B]/90 w-full rounded-2xl h-14 font-extrabold text-lg shadow-lg shadow-[#FF523B]/20">Save Restaurant</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-2xl h-12 px-6 font-extrabold border-[#EEEEEE] bg-white hover:bg-[#FAFAFA] gap-2">
                <Plus size={18} /> Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold tracking-tight">Add Menu Item</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                  <Label className="font-bold text-[#1A1A1A]">Restaurant</Label>
                  <Select onValueChange={val => setNewMenuItem({...newMenuItem, restaurantId: val})}>
                    <SelectTrigger className="rounded-xl border-[#EEEEEE] bg-[#FAFAFA] h-12 font-bold">
                      <SelectValue placeholder="Select a restaurant" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[#EEEEEE]">
                      {restaurants.map(r => <SelectItem key={r.id} value={r.id} className="font-bold">{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-[#1A1A1A]">Item Name</Label>
                  <Input className="rounded-xl border-[#EEEEEE] bg-[#FAFAFA] h-12 font-bold" value={newMenuItem.name} onChange={e => setNewMenuItem({...newMenuItem, name: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-[#1A1A1A]">Price ($)</Label>
                  <Input type="number" className="rounded-xl border-[#EEEEEE] bg-[#FAFAFA] h-12 font-bold" value={newMenuItem.price} onChange={e => setNewMenuItem({...newMenuItem, price: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-[#1A1A1A]">Category</Label>
                  <Input className="rounded-xl border-[#EEEEEE] bg-[#FAFAFA] h-12 font-bold" value={newMenuItem.category} onChange={e => setNewMenuItem({...newMenuItem, category: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-[#1A1A1A]">Image URL</Label>
                  <Input className="rounded-xl border-[#EEEEEE] bg-[#FAFAFA] h-12 font-bold" value={newMenuItem.image} onChange={e => setNewMenuItem({...newMenuItem, image: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-[#1A1A1A]">Description</Label>
                  <Textarea className="rounded-xl border-[#EEEEEE] bg-[#FAFAFA] min-h-[100px] font-bold" value={newMenuItem.description} onChange={e => setNewMenuItem({...newMenuItem, description: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddMenuItem} className="bg-[#FF523B] hover:bg-[#FF523B]/90 w-full rounded-2xl h-14 font-extrabold text-lg shadow-lg shadow-[#FF523B]/20">Save Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="orders" className="space-y-8">
        <TabsList className="bg-white p-1.5 rounded-2xl border border-[#EEEEEE] shadow-sm h-16">
          <TabsTrigger value="orders" className="rounded-xl px-10 font-extrabold data-[state=active]:bg-[#FF523B] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#FF523B]/20 transition-all">
            <ClipboardList size={18} className="mr-2" /> Orders
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="rounded-xl px-10 font-extrabold data-[state=active]:bg-[#FF523B] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#FF523B]/20 transition-all">
            <Store size={18} className="mr-2" /> Restaurants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          {orders.map(order => (
            <Card key={order.id} className="p-8 rounded-[32px] border-[#EEEEEE] shadow-sm bg-white">
              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div className="space-y-6 flex-grow">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#FAFAFA] rounded-2xl flex items-center justify-center text-[#FF523B] border border-[#EEEEEE]">
                      <ClipboardList size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">Order #{order.id.slice(-6).toUpperCase()}</h4>
                      <p className="text-sm font-bold text-[#666666]">{order.restaurantName} • {order.items.length} items • <span className="text-[#1A1A1A] font-extrabold">${order.totalAmount.toFixed(2)}</span></p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, i) => (
                      <Badge key={i} variant="outline" className="bg-[#FAFAFA] border-[#EEEEEE] text-[#1A1A1A] font-bold px-3 py-1 rounded-lg">{item.quantity}x {item.name}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-4 min-w-[240px]">
                  <Label className="text-xs font-extrabold text-[#666666]/40 uppercase tracking-widest">Update Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { s: 'pending', icon: Clock },
                      { s: 'preparing', icon: ChefHat },
                      { s: 'out-for-delivery', icon: Bike },
                      { s: 'delivered', icon: CheckCircle2 }
                    ].map(status => (
                      <Button
                        key={status.s}
                        size="sm"
                        variant={order.status === status.s ? "default" : "outline"}
                        className={`rounded-xl h-10 px-4 font-bold transition-all ${
                          order.status === status.s 
                          ? 'bg-[#FF523B] text-white shadow-md shadow-[#FF523B]/20' 
                          : 'border-[#EEEEEE] hover:bg-[#FFF1EF] hover:text-[#FF523B] hover:border-[#FF523B]'
                        }`}
                        onClick={() => updateOrderStatus(order.id, status.s)}
                      >
                        <status.icon size={14} className="mr-1.5" /> {status.s.split('-')[0]}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="restaurants" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map(rest => (
            <Card key={rest.id} className="overflow-hidden rounded-[40px] border-[#EEEEEE] shadow-sm group bg-white">
              <div className="h-48 relative">
                <img src={rest.image} alt={rest.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                  <Button size="icon" variant="secondary" className="rounded-2xl h-12 w-12 shadow-lg"><Edit2 size={20} /></Button>
                  <Button size="icon" variant="destructive" className="rounded-2xl h-12 w-12 shadow-lg" onClick={() => deleteDoc(doc(db, 'restaurants', rest.id))}><Trash2 size={20} /></Button>
                </div>
              </div>
              <div className="p-8 space-y-3">
                <h4 className="font-extrabold text-xl text-[#1A1A1A] tracking-tight">{rest.name}</h4>
                <p className="text-sm font-bold text-[#666666] line-clamp-2 leading-relaxed">{rest.description}</p>
                <div className="flex flex-wrap gap-2 pt-4">
                  {rest.categories.map(c => <Badge key={c} variant="secondary" className="bg-[#FFF1EF] text-[#FF523B] hover:bg-[#FFF1EF] text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md">{c}</Badge>)}
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
