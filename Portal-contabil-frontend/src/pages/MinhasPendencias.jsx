import { useState, useEffect } from 'react';
import {
    Box, Paper, Grid, Button, Typography, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { CloudUpload, CheckCircle, HourglassEmpty } from '@mui/icons-material';
import api from '../services/api';
import Layout from '../components/Layout';

export default function MinhasPendencias() {
    const [statusAtivo, setStatusAtivo] = useState('ABERTO'); // No banco: ABERTO = Recebida pelo cliente
    const [pendencias, setPendencias] = useState([]);
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroData, setFiltroData] = useState('');

    useEffect(() => {
        carregarMinhasPendencias();
    }, []);

    const carregarMinhasPendencias = async () => {
        try {
            // 💡 Endpoint correto liberado para a role CLIENTE
            const res = await api.get('/pendencias/minhas');
            setPendencias(res.data);
        } catch (error) {
            console.error("Erro ao carregar pendências do cliente:", error);
        }
    };

    const handleUploadArquivo = async (e, pendenciaId) => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        const formData = new FormData();
        formData.append('file', arquivo);

        try {
            await api.post(`/pendencias/${pendenciaId}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Documento enviado com sucesso! Aguardando análise do contador.");
            carregarMinhasPendencias();
        } catch (error) {
            alert("Erro ao enviar o arquivo.");
        }
    };

    const pendenciasFiltradas = pendencias.filter(p => {
        const matchesStatus = p.status === statusAtivo;
        const matchesTexto = p.descricao.toLowerCase().includes(filtroTexto.toLowerCase());
        const matchesData = filtroData ? p.prazo === filtroData : true;
        return matchesStatus && matchesTexto && matchesData;
    });

    return (
        <Layout title="Minhas Pendências">
            <Grid container spacing={3}>
                {/* Abas Esquerda */}
                <Grid item xs={12} md={3}>
                    <Button
                        variant={statusAtivo === 'ABERTO' ? "contained" : "outlined"}
                        fullWidth sx={{ mb: 2, py: 1.5 }} onClick={() => setStatusAtivo('ABERTO')}
                    >
                        Pendências Recebidas
                    </Button>
                    <Button
                        variant={statusAtivo === 'EM_ANALISE' ? "contained" : "outlined"}
                        fullWidth sx={{ mb: 2, py: 1.5 }} color="warning" onClick={() => setStatusAtivo('EM_ANALISE')}
                    >
                        Em Análise
                    </Button>
                    <Button
                        variant={statusAtivo === 'CONCLUIDO' ? "contained" : "outlined"}
                        fullWidth sx={{ mb: 2, py: 1.5 }} color="success" onClick={() => setStatusAtivo('CONCLUIDO')}
                    >
                        Concluídas
                    </Button>
                </Grid>

                {/* Tabela Direita */}
                <Grid item xs={12} md={9}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={7}>
                                <TextField
                                    fullWidth label="Filtrar por Descrição"
                                    value={filtroTexto} onChange={(e) => setFiltroTexto(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={5}>

                                {/* <TextField
                                    fullWidth
                                    type="date"
                                    label="Filtrar por Prazo"
                                    InputLabelProps={{ shrink: true }} // 🌟 Resolve o problema no módulo do cliente também!
                                    value={filtroData}
                                    onChange={(e) => setFiltroData(e.target.value)}
                                /> */}

                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Filtrar por Prazo"
                                    InputLabelProps={{ shrink: true }} // Mantido para retrocompatibilidade
                                    slotProps={{ inputLabel: { shrink: true } }} // Força nas versões mais recentes
                                    value={filtroData}
                                    onChange={(e) => setFiltroData(e.target.value)}
                                />
                            </Grid>
                        </Grid>

                        <TableContainer>
                            <Table>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell style={{ fontWeight: 'bold' }}>Descrição</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Prazo Limite</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Vencimento Guia</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }} align="center">Ação</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendenciasFiltradas.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" style={{ color: '#757575' }}>
                                                Nenhuma pendência encontrada.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pendenciasFiltradas.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell>{p.descricao}</TableCell>
                                                <TableCell>{new Date(p.prazo).toLocaleDateString('pt-BR')}</TableCell>
                                                <TableCell>{p.dataVencimento ? new Date(p.dataVencimento).toLocaleDateString('pt-BR') : '-'}</TableCell>
                                                <TableCell align="center">
                                                    {statusAtivo === 'ABERTO' && (
                                                        <Button variant="contained" component="label" startIcon={<CloudUpload />} size="small">
                                                            Responder
                                                            <input type="file" hidden onChange={(e) => handleUploadArquivo(e, p.id)} />
                                                        </Button>
                                                    )}
                                                    {statusAtivo === 'EM_ANALISE' && <Box sx={{ color: '#ff9100' }}><HourglassEmpty /> Em Análise</Box>}
                                                    {statusAtivo === 'CONCLUIDO' && <Box sx={{ color: '#4caf50' }}><CheckCircle /> Concluído</Box>}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Layout>
    );
}