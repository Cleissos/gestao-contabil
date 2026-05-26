import React, { useState, useEffect } from 'react'; // Adicionado useState e useEffect
import { Grid, Paper, Typography, Box, Card, CardContent, Button, CardActionArea } from '@mui/material';
import { AssignmentLate, CloudDone, PeopleAlt, InsertChart } from '@mui/icons-material';
import Layout from '../components/Layout.jsx';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Certifique-se de importar sua instância do Axios

const StatCard = ({ title, value, icon, color, onClick }) => (
  <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
    <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
        <Box sx={{ 
          backgroundColor: `${color}15`, 
          borderRadius: '50%', p: 2, mr: 2, 
          display: 'flex', alignItems: 'center' 
        }}>
          {React.cloneElement(icon, { sx: { color: color, fontSize: 30 } })}
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary">{title}</Typography>
          <Typography variant="h5" fontWeight="bold">{value}</Typography>
        </Box>
      </CardContent>
    </CardActionArea>
  </Card>
);

export default function Dashboard() {
  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  
  // ESTADO PARA O NOME DINÂMICO
  const [nomeUsuario, setNomeUsuario] = useState('Carregando...');

  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        // Chamada para o endpoint que criamos no Backend
        const response = await api.get('/auth/me'); 
        setNomeUsuario(response.data.nome);
        
        // Opcional: Atualizar o localStorage para outros componentes usarem
        localStorage.setItem('nome', response.data.nome);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setNomeUsuario("Usuário");
      }
    };

    carregarPerfil();
  }, []);

  const handleGerarGuiaDAS = () => {
    window.open("https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao", "_blank");
  };

  return (
    <Layout title="Início">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#1a237e">
          Olá, {nomeUsuario}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {role === 'CONTADOR' 
            ? 'Acompanhe a saúde contábil dos seus clientes hoje.' 
            : 'Confira suas obrigações e documentos recentes.'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {role === 'CONTADOR' ? (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Clientes Registrados" 
                value="15" 
                icon={<PeopleAlt />} 
                color="#1a237e" 
                onClick={() => navigate('/clientes')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Pendências" 
                value="4" 
                icon={<AssignmentLate />} 
                color="#d32f2f" 
                onClick={() => navigate('/pendencias')} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Hist. Documentos" 
                value="12" 
                icon={<CloudDone />} 
                color="#2e7d32" 
                onClick={() => navigate('/historico-documentos')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Taxa de Entrega" 
                value="88%" 
                icon={<InsertChart />} 
                color="#ed6c02" 
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={6}>
              <StatCard 
                title="Minhas Pendências" 
                value="2" 
                icon={<AssignmentLate />} 
                color="#d32f2f" 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatCard 
                title="Arquivos Enviados" 
                value="45" 
                icon={<CloudDone />} 
                color="#1a237e" 
                onClick={() => navigate('/meus-documentos')}
              />
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <Paper sx={{ p: 4, mt: 2, borderRadius: 3, textAlign: 'center', backgroundColor: '#fff', border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" gutterBottom color="#1a237e" fontWeight="bold">O que você deseja fazer agora?</Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              {role === 'CONTADOR' ? (
                <>
                  <Button 
                    variant="contained" 
                    size="large" 
                    sx={{ bgcolor: '#1a237e', px: 4 }} 
                    onClick={() => navigate('/cadastrar-cliente')}
                  >
                    Cadastrar Cliente
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large" 
                    sx={{ color: '#1a237e', borderColor: '#1a237e', px: 4 }} 
                    onClick={handleGerarGuiaDAS}
                  >
                    Gerar Guia DAS
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="contained" size="large" sx={{ bgcolor: '#1a237e' }} onClick={() => navigate('/gestao-documentos')}>
                    Enviar Documento
                  </Button>
                  <Button variant="outlined" size="large">Ver Prazos</Button>
                </>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}