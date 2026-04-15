import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, UtensilsCrossed, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/components/FirebaseProvider';
import { useCart } from '@/components/CartProvider';
import { auth } from '@/lib/firebase';
import { signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin } = useFirebase();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4 lg:px-10 h-20 flex items-center justify-between gap-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tighter text-[#FF523B]">BiteDash</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]" size={18} />
          <input 
            type="text" 
            placeholder="Search for burgers, sushi, or favorite restaurant..."
            className="w-full bg-[#F3F3F3] py-2.5 pl-12 pr-4 rounded-full text-sm text-[#1A1A1A] placeholder:text-[#666666] focus:outline-none focus:ring-2 focus:ring-[#FF523B]/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2 bg-[#FFF1EF] px-3 py-1.5 rounded-xl text-[#FF523B] text-sm font-bold">
            <MapPin size={16} />
            <span>Downtown, NY</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-bold text-[#1A1A1A]">
            <Link to="/restaurants" className="hover:text-[#FF523B] transition-colors">Restaurants</Link>
            <Link to="/orders" className="hover:text-[#FF523B] transition-colors">My Orders</Link>
            {isAdmin && <Link to="/admin" className="text-[#FF523B]">Admin</Link>}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative p-2 text-[#1A1A1A] hover:text-[#FF523B] transition-colors">
              <ShoppingCart size={24} />
              {items.length > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-[#FF523B] text-white border-none">
                  {items.length}
                </Badge>
              )}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-10 w-10 border-2 border-[#FFF1EF]">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                      <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-2xl p-2" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-[#666666]">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/orders')} className="rounded-xl">
                    My Orders
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded-xl">
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-xl">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleLogin} className="bg-[#FF523B] hover:bg-[#FF523B]/90 text-white rounded-full px-8 font-bold">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
