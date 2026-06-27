import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { router } from './router'
import { ContentProvider } from './content/ContentProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ContentProvider>
        <RouterProvider router={router} />
      </ContentProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
