// import { useState, useEffect } from 'react';
// import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
// import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
// import Layout from '../components/Layout.jsx';
// import api from '../services/api';

// export default function HistoricoDocumentos() {
//     const [historico, setHistorico] = useState([]);

//     useEffect(() => {
//         api.get('/documentos/historico').then(res => setHistorico(res.data));
//     }, []);

//     return (
//         <Layout title="Histórico de Documentos">
//             <Box sx={{ p: 3 }}>
//                 <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}>
//                     Fluxo de Documentos (Uploads/Downloads)
//                 </Typography>

//                 <TableContainer component={Paper} elevation={3}>
//                     <Table>
//                         <TableHead sx={{ bgcolor: '#f5f5f5' }}>
//                             <TableRow>
//                                 <TableCell>Data/Hora</TableCell>
//                                 <TableCell>Documento</TableCell>
//                                 <TableCell>Operação</TableCell>
//                                 <TableCell>Origem (Quem enviou)</TableCell>
//                                 <TableCell>Destino (Para quem)</TableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {historico.map((log) => (
//                                 <TableRow key={log.id}>
//                                     <TableCell>{new Date(log.data).toLocaleString('pt-BR')}</TableCell>
//                                     <TableCell><strong>{log.tipo}</strong></TableCell>
//                                     <TableCell>
//                                         <Chip 
//                                             icon={log.operacao === 'UPLOAD' ? <ArrowUpward /> : <ArrowDownward />}
//                                             label={log.operacao} 
//                                             color={log.operacao === 'UPLOAD' ? "primary" : "secondary"}
//                                             variant="outlined" size="small"
//                                         />
//                                     </TableCell>
//                                     <TableCell>{log.origem}</TableCell>
//                                     <TableCell>{log.destino}</TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//             </Box>
//         </Layout>
//     );
// }

import { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip 
} from '@mui/material';
import { ArrowUpward, CloudDownload } from '@mui/icons-material';
import Layout from '../components/Layout.jsx';
import api from '../services/api';

export default function HistoricoDocumentos() {
    const [historico, setHistorico] = useState([]);

    useEffect(() => {
        carregarHistorico();
    }, []);

    const carregarHistorico = async () => {
        try {
            const response = await api.get('/documentos/historico');
            setHistorico(response.data);
        } catch (error) {
            console.error("Erro ao carregar histórico", error);
        }
    };

    return (
        <Layout title="Histórico de Documentos">
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}>
                    Fluxo de Movimentação de Arquivos
                </Typography>

                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Data / Hora</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Documento</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Operação</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Origem (Remetente)</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Destino (Destinatário)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {historico.map((log) => (
                                <TableRow key={log.id} hover>
                                    <TableCell>
                                        {new Date(log.data).toLocaleString('pt-BR')}
                                    </TableCell>
                                    <TableCell>
                                        <strong>{log.tipo}</strong>
                                    </TableCell>
                                    <TableCell>
                                        {/* Lógica Visual: Verde para o que entrou, Azul para o que saiu */}
                                        <Chip 
                                            icon={log.operacao === 'UPLOAD' ? <ArrowUpward /> : <CloudDownload />}
                                            label={log.operacao} 
                                            variant="outlined"
                                            size="small"
                                            sx={{ 
                                                fontWeight: 'bold',
                                                borderColor: log.operacao === 'UPLOAD' ? '#1a237e' : '#2e7d32',
                                                color: log.operacao === 'UPLOAD' ? '#1a237e' : '#2e7d32'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{log.origem}</TableCell>
                                    <TableCell>{log.destino}</TableCell>
                                </TableRow>
                            ))}
                            {historico.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                        Nenhuma movimentação encontrada.
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