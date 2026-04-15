import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebase';

const SAMPLE_RESTAURANTS = [
  {
    name: "The Gourmet Kitchen",
    description: "Authentic Italian flavors with a modern twist. Best pasta in town!",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2070",
    rating: 4.8,
    deliveryTime: "20-30 min",
    categories: ["Italian", "Pasta", "Pizza"],
    address: "123 Foodie Lane, Downtown",
    ownerId: "system"
  },
  {
    name: "Burger Haven",
    description: "Juicy burgers, crispy fries, and thick milkshakes.",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=2070",
    rating: 4.5,
    deliveryTime: "15-25 min",
    categories: ["Burgers", "Fast Food", "American"],
    address: "456 Grill St, Midtown",
    ownerId: "system"
  },
  {
    name: "Sushi Zen",
    description: "Fresh sushi and traditional Japanese cuisine.",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=2070",
    rating: 4.9,
    deliveryTime: "30-45 min",
    categories: ["Japanese", "Sushi", "Seafood"],
    address: "789 Sakura Way, Eastside",
    ownerId: "system"
  }
];

const SAMPLE_MENU_ITEMS = [
  {
    name: "Truffle Mushroom Pasta",
    description: "Creamy pasta with wild mushrooms and truffle oil.",
    price: 18.99,
    image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=1994",
    category: "Main Course",
    isAvailable: true
  },
  {
    name: "Margherita Pizza",
    description: "Classic pizza with fresh mozzarella, basil, and tomato sauce.",
    price: 14.50,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&q=80&w=2070",
    category: "Pizza",
    isAvailable: true
  },
  {
    name: "Classic Cheeseburger",
    description: "Beef patty, cheddar cheese, lettuce, tomato, and our secret sauce.",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=1899",
    category: "Burgers",
    isAvailable: true
  }
];

export const bootstrapData = async () => {
  const restSnap = await getDocs(collection(db, 'restaurants'));
  if (restSnap.empty) {
    console.log('Bootstrapping sample data...');
    for (const rest of SAMPLE_RESTAURANTS) {
      const docRef = await addDoc(collection(db, 'restaurants'), rest);
      for (const item of SAMPLE_MENU_ITEMS) {
        await addDoc(collection(db, 'restaurants', docRef.id, 'menuItems'), {
          ...item,
          restaurantId: docRef.id
        });
      }
    }
    console.log('Bootstrap complete!');
  }
};
