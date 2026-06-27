import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { NotFound } from './pages/NotFound'

// The entire admin section is its own lazy chunk, never in the public bundle.
const AdminApp = lazy(() => import('./admin/AdminApp'))

const RouteFallback = () => <div className="min-h-screen bg-pearl-white" />

export const router = createBrowserRouter([
  {
    path: '/admin/*',
    element: (
      <Suspense fallback={<RouteFallback />}>
        <AdminApp />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'politica-de-privacidade', element: <PrivacyPolicy /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
