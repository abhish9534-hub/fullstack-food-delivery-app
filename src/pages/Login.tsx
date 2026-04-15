import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast.success('Successfully signed in!');
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
      toast.error('Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#FAFAFA]">
      <Card className="max-w-md w-full p-12 rounded-[48px] border-none shadow-2xl space-y-10 text-center bg-white">
        <div className="w-24 h-24 bg-[#FF523B] rounded-[32px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-[#FF523B]/30">
          <UtensilsCrossed size={48} />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold text-[#1A1A1A] tracking-tighter">Welcome to BiteDash</h1>
          <p className="text-[#666666] font-bold">Sign in to start ordering delicious food</p>
        </div>
        <div className="space-y-6 pt-4">
          <Button 
            onClick={handleGoogleLogin} 
            className="w-full h-16 bg-white border-2 border-[#EEEEEE] text-[#1A1A1A] hover:bg-[#FAFAFA] hover:border-[#FF523B]/20 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-4 transition-all shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            Continue with Google
          </Button>
          <p className="text-xs font-bold text-[#666666]/40 uppercase tracking-widest leading-relaxed">
            By continuing, you agree to our <br/> Terms of Service and Privacy Policy.
          </p>
        </div>
      </Card>
    </div>
  );
};
