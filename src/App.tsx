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
import DistributeProductPage from './pages/dashboard/DistributeProductPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import ReceiveProductPage from './pages/dashboard/ReceiveProductPage'
import VerifyPage from './pages/VerifyPage'
import IssueFabricPage from './pages/dashboard/IssueFabricPage'
import ArtisanCompletePage from './pages/dashboard/ArtisanCompletePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
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
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify/:productId" element={<VerifyPage />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/new" element={<NewProductPage />} />
              <Route path="products/issue" element={<IssueFabricPage />} />
              <Route path="products/complete-work" element={<ArtisanCompletePage />} />
              <Route path="products/:id/distribute" element={<DistributeProductPage />} />
              <Route path="receive" element={<ReceiveProductPage />} />
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
