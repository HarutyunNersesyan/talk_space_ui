
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from '../pages/login/LoginPage';
import SignUp from '../pages/login/SignUpPage';
import Dashboard from '../pages/basic/Dashboard';
import SalesOrders from '../pages/basic/Orders';
import AbandonedOrders from '../pages/basic/AbandonedOrders';
import ShippingReport from '../pages/basic/ShippingReport';
import Products from '../pages/basic/Products';
import CreateProduct from '../pages/basic/products/createproducts/CreateProduct';
import Categories from '../pages/basic/Categories';
import CreateCategory from '../pages/basic/CreateCategory';
import Attributes from '../pages/basic/Attributes';
import Promotions from '../pages/basic/Promotions';
import CreatePromotion from '../pages/basic/CreatePromotion';
import Customers from '../pages/basic/Customers';
import CreateCustomer from '../pages/basic/CreateCustomer';
import Pages from '../pages/basic/Pages';
import CreatePage from '../pages/basic/CreatePage';
import Settings from '../pages/basic/settings/Settings';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from "./PublicRoute";

const RoutesConfig: React.FC = () => (
    <Routes>
        <Route path="/login" element={<PublicRoute element={<Login />} />} />
        <Route path="/signUp" element={<PublicRoute element={<SignUp />} />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/sales/orders" element={<ProtectedRoute element={<SalesOrders />} />} />
        <Route path="/sales/abandoned-orders" element={<ProtectedRoute element={<AbandonedOrders />} />} />
        <Route path="/reports/shipping" element={<ProtectedRoute element={<ShippingReport />} />} />
        <Route path="/catalog/products" element={<ProtectedRoute element={<Products />} />} />
        <Route path="/catalog/create-product" element={<ProtectedRoute element={<CreateProduct />} />} />
        <Route path="/catalog/categories" element={<ProtectedRoute element={<Categories />} />} />
        <Route path="/catalog/create-category" element={<ProtectedRoute element={<CreateCategory />} />} />
        <Route path="/catalog/attributes" element={<ProtectedRoute element={<Attributes />} />} />
        <Route path="/promotions" element={<ProtectedRoute element={<Promotions />} />} />
        <Route path="/promotions/create" element={<ProtectedRoute element={<CreatePromotion />} />} />
        <Route path="/customers" element={<ProtectedRoute element={<Customers />} />} />
        <Route path="/customers/create" element={<ProtectedRoute element={<CreateCustomer />} />} />
        <Route path="/content/" element={<ProtectedRoute element={< Pages/>} />} />
        <Route path="/content/create-page" element={<ProtectedRoute element={<CreatePage />} />} />
        <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
);

export default RoutesConfig;