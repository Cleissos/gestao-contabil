import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Tooltip,
    TextField, InputAdornment, Chip, Button
} from '@mui/material';
import { Edit, Visibility, Person, Search, Add, Chat } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // Para o vínculo com documentos
import Layout from '../components/Layout.jsx';
import api from '../services/api';

export default function GestaoClientes() {
    const [clientes, setClientes] = useState([]);
    const [busca, setBusca] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        carregarClientes();
    }, []);

    const carregarClientes = async () => {
        try {
            const response = await api.get('/clientes');
            setClientes(response.data);
        } catch (error) {
            console.error("Erro ao carregar clientes", error);
        }
    };

    // Filtro Lógico: Filtra os clientes conforme o que é digitado
    const clientesFiltrados = clientes.filter(c =>
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.cpfCnpj.includes(busca)
    );

    return (
        <Layout title="Gestão de Clientes">
            <Box sx={{ p: 3 }}>

                {/* Cabeçalho da Lista */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                        Lista de Clientes Ativos
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/cadastrar-cliente')} // Ajuste a rota se necessário
                        sx={{ bgcolor: '#1a237e' }}
                    >
                        Novo Cliente
                    </Button>
                </Box>

                {/* Barra de Busca */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Buscar por nome ou CPF/CNPJ..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Paper>

                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#1a237e' }}>
                            <TableRow>
                                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Nome / Razão Social</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Tipo</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>CPF / CNPJ</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="center">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clientesFiltrados.map((cliente) => (
                                <TableRow key={cliente.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Person color="action" />
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {cliente.nome}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{cliente.tipo}</TableCell>
                                    <TableCell>{cliente.cpfCnpj}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label="Ativo"
                                            size="small"
                                            sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">

                                        {/* Botão de Chat Adicionado Aqui */}
                                        <Tooltip title="Abrir Chat">
                                            <IconButton
                                                sx={{ color: '#1a237e' }}
                                                // onClick={() => navigate(`/chat?clienteId=${cliente.id}`)}
                                                onClick={() => navigate(`/chat/${cliente.id}`)}
                                            >
                                                <Chat />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Ver Documentos">
                                            <IconButton
                                                color="primary"
                                                onClick={() => navigate('/gestao-documentos', { state: { clienteId: cliente.id } })}
                                            >
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Editar Dados">
                                            <IconButton sx={{ color: '#7b1fa2' }}>
                                                <Edit />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Layout>
    );
}