import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Web3Provider } from './context/Web3Context'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import DashboardPage from './pages/dashboard/DashboardPage'
import ProductsPage from './pages/dashboard/ProductsPage'
import NewProductPage from './pages/dashboard/NewProductPage'
import CertificatesPage from './pages/dashboard/CertificatesPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import VerifyPage from './pages/VerifyPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import RequireRole from './components/auth/RequireRole'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import UsersPage from './pages/admin/UsersPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Web3Provider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify/:productId" element={<VerifyPage />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/new" element={<NewProductPage />} />
              <Route path="certificates" element={<CertificatesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="admin" element={<RequireRole role="admin"><AdminDashboardPage /></RequireRole>} />
              <Route path="admin/users" element={<RequireRole role="admin"><UsersPage /></RequireRole>} />
              <Route path="admin/products" element={<RequireRole role="admin"><AdminProductsPage /></RequireRole>} />
            </Route>
          </Routes>
        </Web3Provider>
      </AuthProvider>
    </BrowserRouter>
  )
}
