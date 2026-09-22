import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.tsx'
import Login from './Login.tsx'
import CadCliente from './CadCliente.tsx'
import Detalhes from './Detalhes.tsx'
import MinhasCompras from './MinhasCompras.tsx'
import AdminLayout from './admin/AdminLayout.tsx'
import AdminDashboard from './admin/AdminDashboard.tsx'
import AdminVendas from './admin/AdminVendas.tsx'
import AdminPropostas from './admin/AdminPropostas.tsx'

import Layout from './Layout.tsx'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

// Rotas do lado do cliente + a área do admin (item 8 em diante), com sua
// própria árvore de rotas e layout. Login do admin e o CRUD de livros /
// compras (itens 9-11) entram junto de 'dashboard' na Parte 5.
const rotas = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: 'login', element: <Login /> },
      { path: 'cadastro', element: <CadCliente /> },
      { path: 'detalhes/:livroId', element: <Detalhes /> },
      { path: 'minhas-compras', element: <MinhasCompras /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={rotas} />
  </StrictMode>,
)