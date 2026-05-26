import { useState, useEffect } from 'react';
import {
    Box, Paper, Grid, Button, Typography, TextField, MenuItem,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add, Visibility, Delete, CheckCircle, Download } from '@mui/icons-material';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Pendencias() {
    // Estados das abas e listagem
    const [statusAtivo, setStatusAtivo] = useState('ABERTO');
    const [clientes, setClientes] = useState([]);
    const [todasPendencias, setTodasPendencias] = useState([]);
    const [clienteSelecionado, setClienteSelecionado] = useState('');
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroData, setFiltroData] = useState('');

    // Estados para a modal de visualização (Olhinho)
    const [openVisualizarModal, setOpenVisualizarModal] = useState(false);
    const [pendenciaSelecionada, setPendenciaSelecionada] = useState(null);

    // Estados da Modal (Nova Pendência)
    const [openModal, setOpenModal] = useState(false);
    const [novaPendencia, setNovaPendencia] = useState({
        clienteId: '',
        descricao: '',
        prazo: '',
        dataVencimento: ''
    });

    useEffect(() => {
        carregarClientes();
    }, []);

    const carregarClientes = async () => {
        try {
            const res = await api.get('/clientes');
            setClientes(res.data);
            // Se houver clientes, pré-seleciona o primeiro para não deixar a tela vazia
            if (res.data.length > 0) {
                setClienteSelecionado(res.data[0].id);
                buscarPendenciasDoCliente(res.data[0].id);
            }
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
        }
    };

    const buscarPendenciasDoCliente = async (clienteId) => {
        if (!clienteId) {
            setTodasPendencias([]);
            return;
        }
        try {
            const res = await api.get(`/pendencias/cliente/${clienteId}`);
            setTodasPendencias(res.data);
        } catch (error) {
            console.error("Erro ao buscar pendências:", error);
        }
    };

    const handleCriarPendencia = async (e) => {
        e.preventDefault();
        try {
            await api.post('/pendencias', novaPendencia);
            alert("Pendência criada com sucesso!");
            setOpenModal(false);
            setNovaPendencia({ clienteId: '', descricao: '', prazo: '', dataVencimento: '' });

            if (clienteSelecionado === novaPendencia.clienteId) {
                buscarPendenciasDoCliente(clienteSelecionado);
            }
        } catch (error) {
            alert("Erro ao criar pendência.");
        }
    };

    const handleAlterarStatus = async (id, novoStatus) => {
        try {
            // 💡 Mudamos de 'null' para '{}' para evitar que o Axios aborte a requisição por rede
            await api.patch(`/pendencias/${id}/status`, {}, {
                params: { status: novoStatus }
            });

            alert(`Pendência atualizada para ${novoStatus === 'CONCLUIDO' ? 'Concluída' : novoStatus}!`);

            // Atualiza a tabela dinamicamente na tela do contador
            buscarPendenciasDoCliente(clienteSelecionado);
        } catch (error) {
            console.error("Erro ao atualizar status da pendência:", error);
            alert("Erro ao atualizar status da pendência.");
        }
    };

    const handleAbrirVisualizacao = (pendencia) => {
        setPendenciaSelecionada(pendencia);
        setOpenVisualizarModal(true);
    };

    const handleDownload = async (filename) => {
        if (!filename) return;
        try {
            // Busca o arquivo como um Blob (Arquivo binário) através do Axios autenticado
            const response = await api.get(`/pendencias/download/${filename}`, {
                responseType: 'blob'
            });

            // Cria um link temporário no navegador para iniciar o download automaticamente
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Erro ao baixar o arquivo:", error);
            alert("Não foi possível baixar o arquivo. Verifique se você está logado.");
        }
    };

    const pendenciasFiltradas = todasPendencias.filter(p => {
        const matchesStatus = p.status === statusAtivo;
        const matchesTexto = p.descricao.toLowerCase().includes(filtroTexto.toLowerCase());
        const matchesData = filtroData ? p.prazo === filtroData : true;
        return matchesStatus && matchesTexto && matchesData;
    });

    return (
        <Layout title="Gerenciador de Pendências Gerais">
            <Grid container spacing={3}>

                {/* COLUNA DA ESQUERDA: Menu de Blocos */}
                <Grid item xs={12} md={3}>
                    <Button
                        variant="contained" fullWidth startIcon={<Add />} size="large"
                        sx={{ backgroundColor: '#1a237e', mb: 3, fontWeight: 'bold', py: 1.5 }}
                        onClick={() => setOpenModal(true)}
                    >
                        Nova Pendência
                    </Button>

                    {/* Bloco: Pendências Enviadas (ABERTO) */}
                    <Button
                        variant={statusAtivo === 'ABERTO' ? "contained" : "outlined"}
                        fullWidth sx={{ mb: 2, py: 1.5, justifyContent: 'flex-start', pl: 3 }}
                        onClick={() => setStatusAtivo('ABERTO')}
                    >
                        <Box sx={{ textAlign: 'left' }}>
                            <Typography variant="subtitle2" fontWeight="bold">Pendências Enviadas</Typography>
                            <Typography variant="caption" style={{ textTransform: 'none' }}>Aguardando o Cliente</Typography>
                        </Box>
                    </Button>

                    {/* Bloco: Pendências Recebidas (EM_ANALISE) */}
                    <Button
                        variant={statusAtivo === 'EM_ANALISE' ? "contained" : "outlined"}
                        fullWidth color="warning" sx={{ mb: 2, py: 1.5, justifyContent: 'flex-start', pl: 3 }}
                        onClick={() => setStatusAtivo('EM_ANALISE')}
                    >
                        <Box sx={{ textAlign: 'left' }}>
                            <Typography variant="subtitle2" fontWeight="bold">Pendências Recebidas</Typography>
                            <Typography variant="caption" style={{ textTransform: 'none' }}>Documentos para Analisar</Typography>
                        </Box>
                    </Button>

                    {/* Bloco: Pendências Concluídas (CONCLUIDO) */}
                    <Button
                        variant={statusAtivo === 'CONCLUIDO' ? "contained" : "outlined"}
                        fullWidth color="success" sx={{ mb: 2, py: 1.5, justifyContent: 'flex-start', pl: 3 }}
                        onClick={() => setStatusAtivo('CONCLUIDO')}
                    >
                        <Box sx={{ textAlign: 'left' }}>
                            <Typography variant="subtitle2" fontWeight="bold">Pendências Concluídas</Typography>
                            <Typography variant="caption" style={{ textTransform: 'none' }}>Histórico de Obrigações</Typography>
                        </Box>
                    </Button>
                </Grid>

                {/* COLUNA DA DIREITA: Painel Dinâmico */}
                <Grid item xs={12} md={9}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>

                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1a237e' }}>
                            {statusAtivo === 'ABERTO' && "Pendências Enviadas (Aguardando Retorno do Cliente)"}
                            {statusAtivo === 'EM_ANALISE' && "Documentos Recebidos (Aguardando sua Análise)"}
                            {statusAtivo === 'CONCLUIDO' && "Histórico de Pendências Concluídas"}
                        </Typography>

                        {/* Filtros da Tabela */}
                        {/* <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    select fullWidth label="Selecionar Cliente"
                                    value={clienteSelecionado}
                                    onChange={(e) => {
                                        setClienteSelecionado(e.target.value);
                                        buscarPendenciasDoCliente(e.target.value);
                                    }}
                                >
                                    {clientes.map(cli => (
                                        <MenuItem key={cli.id} value={cli.id}>{cli.nome}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth label="Filtrar por Descrição"
                                    value={filtroTexto} onChange={(e) => setFiltroTexto(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}> */}
                        {/* 💡 InputLabelProps={{ shrink: true }} impede as letras de encavalarem no calendário */}
                        {/* <TextField
                                    fullWidth type="date" label="Filtrar por Prazo"
                                    InputLabelProps={{ shrink: true }}
                                    value={filtroData} onChange={(e) => setFiltroData(e.target.value)}
                                />
                            </Grid>
                        </Grid> */}

                        {/* Filtros da Tabela - Ajustados para melhor espaçamento */}
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    margin="normal"
                                    required
                                    label="Prazo de Entrega"
                                    InputLabelProps={{ shrink: true, style: { fontSize: '14px' } }}
                                    slotProps={{ inputLabel: { shrink: true } }} // Força nas versões mais recentes
                                    value={novaPendencia.prazo}
                                    onChange={(e) => setNovaPendencia({ ...novaPendencia, prazo: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    margin="normal"
                                    label="Data de Vencimento"
                                    InputLabelProps={{ shrink: true, style: { fontSize: '14px' } }}
                                    slotProps={{ inputLabel: { shrink: true } }} // Força nas versões mais recentes
                                    value={novaPendencia.dataVencimento}
                                    onChange={(e) => setNovaPendencia({ ...novaPendencia, dataVencimento: e.target.value })}
                                />
                            </Grid>
                        </Grid>

                        {/* Tabela Dinâmica */}
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell style={{ fontWeight: 'bold' }}>Descrição</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Prazo Limite</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Vencimento Guia</TableCell>
                                        {statusAtivo !== 'ABERTO' && <TableCell style={{ fontWeight: 'bold' }}>Documento</TableCell>}
                                        <TableCell style={{ fontWeight: 'bold' }} align="center">Ações</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {!clienteSelecionado ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" style={{ color: '#757575' }}>
                                                Selecione um cliente para carregar as pendências.
                                            </TableCell>
                                        </TableRow>
                                    ) : pendenciasFiltradas.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" style={{ color: '#757575' }}>
                                                Nenhuma pendência encontrada para este filtro.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pendenciasFiltradas.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell>{p.descricao}</TableCell>

                                                {/* Substitua as linhas de data por estas verificações seguras */}
                                                <TableCell>
                                                    {p.prazo ? new Date(p.prazo).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {p.dataVencimento ? new Date(p.dataVencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                                                </TableCell>

                                                {/* Exibe botão de download se não estiver em aberto */}
                                                {statusAtivo !== 'ABERTO' && (
                                                    <TableCell>
                                                        {p.arquivoUrl ? (
                                                            <Button startIcon={<Download />} size="small" onClick={() => handleDownload(p.arquivoUrl)}>
                                                                Baixar PDF
                                                            </Button>
                                                        ) : 'Sem anexo'}
                                                    </TableCell>
                                                )}

                                                <TableCell align="center">
                                                    {statusAtivo === 'ABERTO' && (
                                                        <IconButton color="error" title="Excluir">
                                                            <Delete />
                                                        </IconButton>
                                                    )}
                                                    {/* Se o cliente respondeu, exibe o botão de Concluir pro Contador dar baixa */}
                                                    {statusAtivo === 'EM_ANALISE' && (
                                                        <IconButton color="success" title="Aprovar e Concluir" onClick={() => handleAlterarStatus(p.id, 'CONCLUIDO')}>
                                                            <CheckCircle />
                                                        </IconButton>
                                                    )}
                                                    <IconButton
                                                        color="primary"
                                                        title="Visualizar"
                                                        onClick={() => handleAbrirVisualizacao(p)} // 💡 Agora ele executa a ação!
                                                    >
                                                        <Visibility />
                                                    </IconButton>
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

            {/* MODAL SUSPENSA */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
                <DialogTitle style={{ fontWeight: 'bold', color: '#1a237e' }}>Cadastrar Nova Obrigação</DialogTitle>
                <form onSubmit={handleCriarPendencia}>
                    <DialogContent dividers>
                        <TextField
                            select fullWidth label="Para qual Cliente?" margin="normal" required
                            value={novaPendencia.clienteId}
                            onChange={(e) => setNovaPendencia({ ...novaPendencia, clienteId: e.target.value })}
                        >
                            {clientes.map(cli => (
                                <MenuItem key={cli.id} value={cli.id}>{cli.nome}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth label="Descrição da Pendência" margin="normal" required multiline rows={3}
                            value={novaPendencia.descricao}
                            onChange={(e) => setNovaPendencia({ ...novaPendencia, descricao: e.target.value })}
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth type="date" margin="normal" required
                                    InputLabelProps={{ shrink: true }} label="Prazo de Entrega"
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    value={novaPendencia.prazo}
                                    onChange={(e) => setNovaPendencia({ ...novaPendencia, prazo: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth type="date" margin="normal"
                                    InputLabelProps={{ shrink: true }} label="Data de Vencimento"
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    value={novaPendencia.dataVencimento}
                                    onChange={(e) => setNovaPendencia({ ...novaPendencia, dataVencimento: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenModal(false)} color="secondary">Cancelar</Button>
                        <Button type="submit" variant="contained" sx={{ backgroundColor: '#1a237e' }}>Salvar e Notificar</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* MODAL DE VISUALIZAÇÃO DETALHADA (Olhinho) */}
            <Dialog open={openVisualizarModal} onClose={() => setOpenVisualizarModal(false)} fullWidth maxWidth="sm">
                <DialogTitle style={{ fontWeight: 'bold', color: '#1a237e' }}>
                    Detalhes da Obrigação
                </DialogTitle>
                <DialogContent dividers>
                    {pendenciaSelecionada && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <Box>
                                <Typography variant="caption" color="textSecondary" fontWeight="bold">STATUS ATUAL</Typography>
                                <Typography variant="body1" sx={{
                                    fontWeight: 'bold',
                                    color: pendenciaSelecionada.status === 'ABERTO' ? '#1a237e' : pendenciaSelecionada.status === 'EM_ANALISE' ? '#ff9100' : '#4caf50'
                                }}>
                                    {pendenciaSelecionada.status === 'ABERTO' && "AGUARDANDO CLIENTE"}
                                    {pendenciaSelecionada.status === 'EM_ANALISE' && "EM ANÁLISE (DOCUMENTO RECEBIDO)"}
                                    {pendenciaSelecionada.status === 'CONCLUIDO' && "CONCLUÍDA / ARQUIVADA"}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="textSecondary" fontWeight="bold">DESCRIÇÃO DA SOLICITAÇÃO</Typography>
                                <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                                    {pendenciaSelecionada.descricao}
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary" fontWeight="bold">PRAZO LIMITE</Typography>
                                    <Typography variant="body1">
                                        {pendenciaSelecionada.prazo ? new Date(pendenciaSelecionada.prazo).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary" fontWeight="bold">VENCIMENTO DA GUIA</Typography>
                                    <Typography variant="body1">
                                        {pendenciaSelecionada.dataVencimento ? new Date(pendenciaSelecionada.dataVencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {pendenciaSelecionada.arquivoUrl && (
                                <Box sx={{ mt: 1, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" fontWeight="bold" color="textSecondary">
                                        Documento Anexado pelo Cliente
                                    </Typography>
                                    <Button startIcon={<Download />} variant="outlined" size="small" onClick={() => handleDownload(pendenciaSelecionada.arquivoUrl)}>
                                        Baixar Arquivo
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenVisualizarModal(false)} variant="contained" sx={{ backgroundColor: '#1a237e' }}>
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}