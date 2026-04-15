import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FirebaseProvider } from './components/FirebaseProvider';
import { CartProvider } from './components/CartProvider';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { RestaurantList } from './pages/RestaurantList';
import { RestaurantDetail } from './pages/RestaurantDetail';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { OrderTracking } from './pages/OrderTracking';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';

export default function App() {
  return (
    <FirebaseProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="restaurants" element={<RestaurantList />} />
              <Route path="restaurant/:id" element={<RestaurantDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="orders" element={<Orders />} />
              <Route path="order/:id" element={<OrderTracking />} />
              <Route path="admin" element={<Admin />} />
              <Route path="login" element={<Login />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </FirebaseProvider>
  );
}
