import { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, LinearProgress,
    FormControl, InputLabel, Select, MenuItem, Fade
} from '@mui/material';
import { CloudUpload, GetApp, InsertDriveFile, Visibility } from '@mui/icons-material';
import Layout from '../components/Layout.jsx';
import api from '../services/api';

export default function GestaoDocumentos() {
    const [arquivos, setArquivos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [clienteSelecionado, setClienteSelecionado] = useState('');

    const role = localStorage.getItem('role');

    // Carrega documentos com base no papel do usuário
    const carregarDocumentos = async () => {
        try {
            const url = role === 'CLIENTE' ? '/documentos/meus' : `/documentos/cliente/${clienteSelecionado}`;

            // Se for contador e não selecionou cliente, não busca
            if (role === 'CONTADOR' && !clienteSelecionado) return;

            const response = await api.get(url);
            setArquivos(response.data);
        } catch (error) {
            console.error("Erro ao carregar documentos", error);
        }
    };

    // Efeito para carregar lista de clientes (se for contador) ou docs (se for cliente)
    useEffect(() => {
        if (role === 'CONTADOR') {
            api.get('/clientes').then(res => setClientes(res.data));
        } else {
            carregarDocumentos();
        }
    }, [role]);

    // Recarrega a tabela sempre que o contador trocar o cliente no select
    useEffect(() => {
        if (role === 'CONTADOR' && clienteSelecionado) {
            carregarDocumentos();
        }
    }, [clienteSelecionado]);

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('tipo', 'RECIBO'); // Ajuste conforme a necessidade ou crie um select de tipo

        if (role === 'CONTADOR') {
            if (!clienteSelecionado) {
                alert("Por favor, selecione um cliente antes de enviar.");
                return;
            }
            formData.append('clienteId', clienteSelecionado);
        }

        setUploading(true);
        try {
            await api.post('/documentos/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Documento enviado com sucesso!");
            carregarDocumentos();
        } catch (error) {
            alert("Erro ao enviar arquivo: " + (error.response?.data || error.message));
        } finally {
            setUploading(false);
            event.target.value = null;
        }
    };

    const handleDownload = async (id, nomeOriginal) => {
        try {
            const response = await api.get(`/documentos/download/${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Define o nome do arquivo para o download
            link.setAttribute('download', nomeOriginal || 'documento.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("Erro ao baixar arquivo. Verifique a conexão com o servidor.", error);
        }
    };

    // const handleVisualizar = async (id) => {
    //     try {
    //         const response = await api.get(`/documentos/download/${id}`, {
    //             responseType: 'blob'
    //         });

    //         // Verificamos o tipo que o servidor mandou
    //         const type = response.headers['content-type'] || 'application/pdf';

    //         const file = new Blob([response.data], { type: type });
    //         const fileURL = URL.createObjectURL(file);

    //         // Criamos um iframe temporário ou abrimos a aba
    //         // DICA: Se for PDF, o browser lida bem. Se for imagem, também.
    //         const win = window.open();
    //         if (win) {
    //             win.document.write(
    //                 `<iframe src="${fileURL}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
    //             );
    //             win.document.title = "Visualizando Documento";
    //         } else {
    //             alert("O bloqueador de pop-ups impediu a visualização.");
    //         }

    //     } catch (error) {
    //         console.error("Erro detalhado:", error);
    //         alert("Erro ao abrir visualização.");
    //     }
    // };

    const handleVisualizar = async (id) => {
        try {
            const response = await api.get(`/documentos/download/${id}`, {
                responseType: 'blob'
            });

            // Agora, com o setExposedHeaders no Java, essa linha abaixo vai funcionar:
            const contentType = response.headers['content-type'];
            console.log("Tipo detectado:", contentType); // Deve imprimir 'application/pdf' ou 'image/png'

            const file = new Blob([response.data], { type: contentType });
            const fileURL = URL.createObjectURL(file);

            window.open(fileURL, '_blank');
        } catch (error) {
            console.error(error);
            alert("Erro ao abrir visualização.");
        }
    };

    // Função auxiliar para limpar o nome do arquivo (remove o UUID inicial)
    const formatarNomeArquivo = (url) => {
        if (!url) return "Documento";
        return url.split('_').pop();
    };

    return (
        <Layout title="Gestão de Documentos">
            <Box sx={{ p: 3 }}>

                {role === 'CONTADOR' && (
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Selecionar Cliente Destino</InputLabel>
                        <Select
                            value={clienteSelecionado}
                            label="Selecionar Cliente Destino"
                            onChange={(e) => setClienteSelecionado(e.target.value)}
                        >
                            {clientes.map((c) => (
                                <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                <Paper sx={{ p: 4, mb: 4, textAlign: 'center', border: '2px dashed #1a237e', bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <CloudUpload sx={{ fontSize: 50, color: '#1a237e', mb: 2 }} />
                    <Typography variant="h6">Selecione um documento para upload</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Formatos aceitos: PDF, PNG, JPG (Máx: 5MB)
                    </Typography>

                    <Button
                        variant="contained"
                        component="label"
                        disabled={uploading}
                        startIcon={<CloudUpload />}
                        sx={{ backgroundColor: '#1a237e' }}
                    >
                        {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
                        <input type="file" hidden onChange={handleUpload} />
                    </Button>

                    {uploading && <LinearProgress sx={{ mt: 2 }} />}
                </Paper>

                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#1a237e' }}>
                            <TableRow>
                                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Tipo</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Nome do Arquivo</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Data de Envio</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="center">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {arquivos.map((doc) => (
                                <TableRow key={doc.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                                            {doc.tipo}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <InsertDriveFile fontSize="small" color="action" />
                                            {formatarNomeArquivo(doc.urlArquivo)}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {doc.dataUpload ? new Date(doc.dataUpload).toLocaleDateString('pt-BR') : 'N/A'}
                                    </TableCell>

                                    <TableCell align="center">
                                        {/* Botão de Visualizar */}
                                        <IconButton
                                            color="secondary"
                                            title="Visualizar"
                                            onClick={() => handleVisualizar(doc.id)}
                                        >
                                            <Visibility />
                                        </IconButton>

                                        {/* Botão de Download */}
                                        <IconButton
                                            color="primary"
                                            title="Baixar"
                                            onClick={() => handleDownload(doc.id, formatarNomeArquivo(doc.urlArquivo))}
                                        >
                                            <GetApp />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {arquivos.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                        <Typography color="textSecondary">Nenhum documento encontrado.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Layout>
    );
}