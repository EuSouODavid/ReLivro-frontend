import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.tsx'
import Login from './Login.tsx'
import CadCliente from './CadCliente.tsx'
import Detalhes from './Detalhes.tsx'
import MinhasCompras from './MinhasCompras.tsx'

import Layout from './Layout.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Rotas do lado do cliente. A área do admin (item 8 em diante) ganha
// sua própria árvore de rotas (com outro Layout) na Parte 5.
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
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={rotas} />
  </StrictMode>,
)
