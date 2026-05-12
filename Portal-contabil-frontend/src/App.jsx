import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import CadastroCliente from './pages/CadastroCliente';
import GestaoDocumentos from './pages/GestaoDocumentos';
import GestaoClientes from './pages/GestaoClientes';
import HistoricoDocumentos from './pages/HistoricoDocumentos';

const PrivateRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Se não tem token, manda para o LOGIN (e não para o cadastro)
  if (!token) return <Navigate to="/login" />;

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota raiz agora manda para o Login, que é o padrão de sistemas ERP */}
        <Route path="/" element={<Navigate to="/cadastro" />} />

        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rota do Dashboard (Unificada) */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        {/* Ajuste importante: Se o seu Login navega para 'dashboard-contador', 
            precisamos que essa rota exista ou que o login vá para '/dashboard' */}
        <Route path="/dashboard-contador" element={
          <PrivateRoute allowedRole="CONTADOR">
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/dashboard-cliente" element={
          <PrivateRoute allowedRole="CLIENTE">
            <Dashboard />
          </PrivateRoute>
        } />

        {/* Módulo do Contador */}
        <Route path="/clientes" element={
          <PrivateRoute allowedRole="CONTADOR">
            <Layout title="Meus Clientes">

              <GestaoClientes />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/cadastrar-cliente" element={
          <PrivateRoute allowedRole="CONTADOR">
            <Layout title="Novo Cliente">
              <CadastroCliente />
            </Layout>
          </PrivateRoute>
        } />

        {/* ROTA ÚNICA DE DOCUMENTOS (Corrigida) */}
        <Route path="documentos" element={
          <PrivateRoute>
            <GestaoDocumentos />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />

        // Dentro do seu Routes
        <Route path="/historico-documentos" element={<HistoricoDocumentos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;