import { Routes, Route } from 'react-router-dom'
import { AdminLayout } from './AdminLayout'
import { AdminLogin } from './Login'
import { AdminDashboard } from './Dashboard'
import { AdminSiteContent } from './SiteContentEditor'
import { AdminMedia } from './MediaManager'
import { AdminCovers } from './Covers'
import { AdminPackages } from './Packages'
import { AdminTracking } from './Tracking'

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="site-content" element={<AdminSiteContent />} />
        <Route path="covers" element={<AdminCovers />} />
        <Route path="packages" element={<AdminPackages />} />
        <Route path="media" element={<AdminMedia />} />
        <Route path="tracking" element={<AdminTracking />} />
      </Route>
    </Routes>
  )
}
