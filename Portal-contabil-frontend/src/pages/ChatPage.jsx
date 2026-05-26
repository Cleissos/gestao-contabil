// import { useState, useEffect, useRef } from 'react';
// import { Box, Paper, TextField, IconButton, Typography, List, ListItem, Divider, CircularProgress, Avatar } from '@mui/material';
// import SendIcon from '@mui/icons-material/Send';
// import Layout from '../components/Layout';
// import api from '../services/api';
// import SockJS from 'sockjs-client';
// import Stomp from 'stompjs';
// import { useLocation } from 'react-router-dom';

// export default function ChatPage() {
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState("");
//     const [stompClient, setStompClient] = useState(null);
//     const [loading, setLoading] = useState(true);

//     const [destinatarioId, setDestinatarioId] = useState(null);
//     const [nomeDestinatario, setNomeDestinatario] = useState("Carregando...");

//     const userId = localStorage.getItem('userId');
//     const role = localStorage.getItem('role');
//     const location = useLocation();
//     const scrollRef = useRef();

//     // 1. Efeito para Definir o Destinatário e buscar o nome
//     useEffect(() => {
//         const definirAlvoConversa = async () => {
//             setLoading(true);
//             try {
//                 if (role === 'CLIENTE') {
//                     // O cliente sempre fala com o contador. 
//                     // Buscamos os dados do perfil para saber quem é o contador vinculado.
//                     const res = await api.get('/auth/me');
//                     if (res.data.contadorId) {
//                         setDestinatarioId(res.data.contadorId);
//                         setNomeDestinatario("Suporte Contábil");
//                     }
//                 } else {
//                     // O Contador pega o ID do cliente pela URL
//                     const params = new URLSearchParams(location.search);
//                     const idUrl = params.get("clienteId");

//                     if (idUrl) {
//                         setDestinatarioId(idUrl);
//                         // BUSCA O NOME REAL DO CLIENTE NO BACKEND
//                         // const resCliente = await api.get(`/usuarios/${idUrl}`); // Ajuste o endpoint conforme seu backend
//                         // setNomeDestinatario(resCliente.data.nome || "Cliente");

//                         try {
//                             // Tente buscar do seu repositório de clientes
//                             const resCliente = await api.get(`/clientes/${idUrl}`);
//                             setNomeDestinatario(resCliente.data.nome || "Cliente");
//                         } catch (e) {
//                             setNomeDestinatario("Cliente", e);
//                         }
//                     }
//                 }
//             } catch (error) {
//                 console.error("Erro ao identificar destinatário:", error);
//                 setNomeDestinatario("Conversa");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         definirAlvoConversa();
//     }, [role, location]);

//     // 2. Efeito para WebSocket e Histórico
//     useEffect(() => {
//         if (!destinatarioId || !userId) return;

//         // Conectar WebSocket
//         const socket = new SockJS('http://localhost:8080/ws-portal');
//         const client = Stomp.over(socket);
//         client.debug = null; // Remove logs chatos no console

//         client.connect({}, () => {
//             setStompClient(client);
//             // Se inscreve na fila privada
//             client.subscribe(`/user/${userId}/queue/messages`, (payload) => {
//                 const msg = JSON.parse(payload.body);
//                 // SÓ adiciona na tela se a mensagem vier de quem eu estou conversando agora
//                 if (msg.remetente.id === destinatarioId || msg.remetente.id === userId) {
//                     setMessages((prev) => {
//                         // Evita duplicados se o backend enviar confirmação
//                         if (prev.find(m => m.id === msg.id)) return prev;
//                         return [...prev, msg];
//                     });
//                 }
//             });
//         });

//         // Carregar Histórico (Certifique-se que o Repository no Java tem o "OR" no SQL)
//         const carregarHistorico = async () => {
//             try {
//                 console.log("Buscando histórico entre:", userId, "e", destinatarioId); // ADICIONE ISSO
//                 const res = await api.get(`/messages/historico/${userId}/${destinatarioId}`);
//                 setMessages(res.data);

//                 // APÓS CARREGAR, AVISA O BACKEND QUE VOCÊ LEU AS MENSAGENS
//                 await api.put(`/messages/ler/${userId}/${destinatarioId}`);
//             } catch (err) {
//                 console.error("Erro ao carregar histórico:", err);
//             }
//         };

//         carregarHistorico();

//         return () => { if (client && client.connected) client.disconnect(); };
//     }, [destinatarioId, userId]);

//     // 3. Função de Enviar Mensagem
//     const sendMessage = () => {
//         if (stompClient && newMessage.trim() !== "" && destinatarioId) {
//             const mensagemDto = {
//                 remetenteId: userId,
//                 destinatarioId: destinatarioId,
//                 conteudo: newMessage
//             };

//             stompClient.send("/app/chat", {}, JSON.stringify(mensagemDto));

//             setNewMessage("");
//         }
//     };

//     // 4. Scroll Automático
//     useEffect(() => {
//         if (scrollRef.current) {
//             scrollRef.current.scrollTo({
//                 top: scrollRef.current.scrollHeight,
//                 behavior: 'smooth'
//             });
//         }
//     }, [messages]);

//     if (loading) {
//         return (
//             <Layout title="Mensagens">
//                 <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, gap: 2 }}>
//                     <CircularProgress size={60} sx={{ color: '#1a237e' }} />
//                     <Typography color="textSecondary">Iniciando conversa segura...</Typography>
//                 </Box>
//             </Layout>
//         );
//     }

//     if (!destinatarioId && role === 'CONTADOR') {
//         return (
//             <Layout title="Mensagens">
//                 <Box sx={{ p: 5, textAlign: 'center', bgcolor: 'white', m: 3, borderRadius: 4 }}>
//                     <Typography variant="h6" color="primary" gutterBottom>Central de Atendimento</Typography>
//                     <Typography color="textSecondary">Selecione um cliente na lista de gestão para visualizar as mensagens.</Typography>
//                 </Box>
//             </Layout>
//         );
//     }

//     return (
//         <Layout title="Chat de Atendimento">
//             <Paper elevation={4} sx={{ height: '80vh', display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden', mx: { xs: 0, md: 4 } }}>

//                 {/* Header do Chat */}
//                 <Box sx={{ p: 2, bgcolor: '#1a237e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 3 }}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                         <Avatar sx={{ bgcolor: '#3949ab', fontWeight: 'bold', border: '2px solid white' }}>
//                             {nomeDestinatario.charAt(0).toUpperCase()}
//                         </Avatar>
//                         <Box>
//                             <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
//                                 {nomeDestinatario}
//                             </Typography>
//                             <Typography variant="caption" sx={{ opacity: 0.8 }}>
//                                 ● Online agora
//                             </Typography>
//                         </Box>
//                     </Box>
//                 </Box>

//                 {/* Área de Mensagens */}
//                 <Box ref={scrollRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: '#f4f6f9', display: 'flex', flexDirection: 'column' }}>
//                     {messages.length === 0 && (
//                         <Typography variant="body2" sx={{ textAlign: 'center', mt: 4, color: 'gray', fontStyle: 'italic' }}>
//                             Nenhuma mensagem anterior. Inicie a conversa abaixo!
//                         </Typography>
//                     )}

//                     {messages.map((msg, index) => {
//                         const eMinha = msg.remetente?.id === userId;
//                         return (
//                             <Box key={index} sx={{ display: 'flex', justifyContent: eMinha ? 'flex-end' : 'flex-start', mb: 2 }}>
//                                 <Box sx={{
//                                     maxWidth: '70%',
//                                     bgcolor: eMinha ? '#1a237e' : 'white',
//                                     color: eMinha ? 'white' : '#333',
//                                     p: 1.8,
//                                     borderRadius: eMinha ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
//                                     boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
//                                 }}>
//                                     <Typography variant="body1" sx={{ wordBreak: 'break-word', fontSize: '0.95rem' }}>
//                                         {msg.conteudo}
//                                     </Typography>
//                                     <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, fontSize: '0.65rem', opacity: 0.7 }}>
//                                         {new Date(msg.dataEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                     </Typography>
//                                 </Box>
//                             </Box>
//                         );
//                     })}
//                 </Box>

//                 <Divider />

//                 {/* Input de Envio */}
//                 <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', gap: 1.5, alignItems: 'center' }}>
//                     <TextField
//                         fullWidth
//                         variant="outlined"
//                         placeholder="Escreva sua mensagem..."
//                         value={newMessage}
//                         onChange={(e) => setNewMessage(e.target.value)}
//                         onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
//                         sx={{ "& .MuiOutlinedInput-root": { borderRadius: 10, bgcolor: '#f0f2f5' } }}
//                     />
//                     <IconButton
//                         onClick={sendMessage}
//                         disabled={!newMessage.trim()}
//                         sx={{
//                             bgcolor: '#1a237e',
//                             color: 'white',
//                             width: 45, height: 45,
//                             "&:hover": { bgcolor: '#0d1440' },
//                             "&.Mui-disabled": { bgcolor: '#e0e0e0' }
//                         }}
//                     >
//                         <SendIcon />
//                     </IconButton>
//                 </Box>
//             </Paper>
//         </Layout>
//     );
// }

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; // Adicione useParams aqui
import { Box, Paper, TextField, IconButton, Typography, CircularProgress, Avatar, Divider, Badge } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DoneIcon from '@mui/icons-material/Done'; // Um traço
import DoneAllIcon from '@mui/icons-material/DoneAll'; // Dois traços
import Layout from '../components/Layout';
import api from '../services/api';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useLocation } from 'react-router-dom';

export default function ChatPage() {
    const { id } = useParams(); // 'id' deve ser o mesmo nome definido no seu App.js (ex: /chat/:id)
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [loading, setLoading] = useState(true);

    const [destinatarioId, setDestinatarioId] = useState(null);
    const [nomeDestinatario, setNomeDestinatario] = useState("Carregando...");

    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    const location = useLocation();
    const scrollRef = useRef();

    // 1. Identifica com quem o usuário está falando
    // useEffect(() => {
    //     const definirAlvoConversa = async () => {
    //         setLoading(true);
    //         try {
    //             if (role === 'CLIENTE') {
    //                 const res = await api.get('/auth/me');
    //                 if (res.data.contadorId) {
    //                     setDestinatarioId(res.data.contadorId);
    //                     setNomeDestinatario("Suporte Contábil");
    //                 }
    //             } else {
    //                 const params = new URLSearchParams(location.search);
    //                 const idUrl = params.get("clienteId");
    //                 if (idUrl) {
    //                     setDestinatarioId(idUrl);
    //                     try {
    //                         const resCliente = await api.get(`/clientes/${idUrl}`);
    //                         setNomeDestinatario(resCliente.data.nome || "Cliente");
    //                     } catch (e) {
    //                         setNomeDestinatario("Cliente");
    //                     }
    //                 }
    //             }
    //         } catch (error) {
    //             console.error("Erro ao identificar destinatário:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     definirAlvoConversa();
    // }, [role, location]);

    useEffect(() => {
        const definirAlvoConversa = async () => {
            setLoading(true);
            try {
                if (role === 'CLIENTE') {
                    const res = await api.get('/auth/me');
                    if (res.data.contadorId) {
                        setDestinatarioId(res.data.contadorId);
                        setNomeDestinatario("Suporte Contábil");
                    }
                } else {
                    // MUDANÇA AQUI: Pegamos direto do useParams, não do location.search
                    if (id) { 
                        setDestinatarioId(id);
                        try {
                            const resCliente = await api.get(`/clientes/${id}`);
                            setNomeDestinatario(resCliente.data.nome || "Cliente");
                        } catch (e) {
                            setNomeDestinatario("Cliente");
                        }
                    }
                }
            } catch (error) {
                console.error("Erro ao identificar destinatário:", error);
            } finally {
                setLoading(false);
            }
        };
        definirAlvoConversa();
    }, [role, id]); // Adicione 'id' aqui no array de dependências

    // 2. WebSocket, Histórico e Confirmação de Leitura
    useEffect(() => {
        if (!destinatarioId || !userId) return;

        const socket = new SockJS('http://localhost:8080/ws-portal');
        const client = Stomp.over(socket);
        client.debug = null;

        client.connect({}, () => {
            setStompClient(client);
            client.subscribe(`/user/${userId}/queue/messages`, async (payload) => {
                const msg = JSON.parse(payload.body);
                
                if (msg.remetente.id === destinatarioId || msg.remetente.id === userId) {
                    setMessages((prev) => {
                        if (prev.find(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });

                    // Se a mensagem acabou de chegar e eu sou o destinatário, marco como lida
                    if (msg.destinatario.id === userId) {
                        await api.put(`/messages/ler/${userId}/${destinatarioId}`);
                    }
                }
            });
        });

        const carregarHistoricoEMarcarLido = async () => {
            try {
                const res = await api.get(`/messages/historico/${userId}/${destinatarioId}`);
                setMessages(res.data);
                
                // Notifica o backend que todas as mensagens anteriores foram visualizadas
                await api.put(`/messages/ler/${userId}/${destinatarioId}`);
            } catch (err) {
                console.error("Erro no fluxo de mensagens:", err);
            }
        };

        carregarHistoricoEMarcarLido();

        return () => { if (client && client.connected) client.disconnect(); };
    }, [destinatarioId, userId]);

    // 3. Enviar Mensagem
    const sendMessage = () => {
        if (stompClient && newMessage.trim() !== "" && destinatarioId) {
            const mensagemDto = {
                remetenteId: userId,
                destinatarioId: destinatarioId,
                conteudo: newMessage
            };
            stompClient.send("/app/chat", {}, JSON.stringify(mensagemDto));
            setNewMessage("");
        }
    };

    // 4. Scroll Automático
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    if (loading) return (
        <Layout title="Mensagens">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, gap: 2 }}>
                <CircularProgress size={60} sx={{ color: '#1a237e' }} />
                <Typography color="textSecondary">Iniciando conversa segura...</Typography>
            </Box>
        </Layout>
    );

    return (
        <Layout title="Chat de Atendimento">
            <Paper elevation={4} sx={{ height: '80vh', display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden', mx: { xs: 0, md: 4 } }}>
                
                {/* Header */}
                <Box sx={{ p: 2, bgcolor: '#1a237e', color: 'white', display: 'flex', alignItems: 'center', boxShadow: 3 }}>
                    <Avatar sx={{ bgcolor: '#3949ab', mr: 2, border: '2px solid white' }}>
                        {nomeDestinatario.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">{nomeDestinatario}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>● Atendimento Ativo</Typography>
                    </Box>
                </Box>

                {/* Mensagens */}
                <Box ref={scrollRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: '#f4f6f9', display: 'flex', flexDirection: 'column' }}>
                    {messages.map((msg, index) => {
                        const eMinha = msg.remetente?.id === userId;
                        return (
                            <Box key={msg.id || index} sx={{ display: 'flex', justifyContent: eMinha ? 'flex-end' : 'flex-start', mb: 2 }}>
                                <Box sx={{
                                    maxWidth: '70%',
                                    bgcolor: eMinha ? '#1a237e' : 'white',
                                    color: eMinha ? 'white' : '#333',
                                    p: 1.5,
                                    borderRadius: eMinha ? '15px 15px 0px 15px' : '15px 15px 15px 0px',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                    position: 'relative'
                                }}>
                                    <Typography variant="body1" sx={{ fontSize: '0.9rem', pb: 1 }}>{msg.conteudo}</Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                        <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: 0.7 }}>
                                            {new Date(msg.dataEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                        
                                        {/* ÍCONES DE VISUALIZAÇÃO (Traços) */}
                                        {eMinha && (
                                            msg.lida ? (
                                                <DoneAllIcon sx={{ fontSize: 14, color: '#4fc3f7' }} /> // Azul (Visualizado)
                                            ) : (
                                                <DoneIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }} /> // Branco fosco (Enviado)
                                            )
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>

                <Divider />

                {/* Input */}
                <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Escreva sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 5, bgcolor: '#f0f2f5' } }}
                    />
                    <IconButton onClick={sendMessage} disabled={!newMessage.trim()} sx={{ bgcolor: '#1a237e', color: 'white', "&:hover": { bgcolor: '#0d1440' } }}>
                        <SendIcon />
                    </IconButton>
                </Box>
            </Paper>
        </Layout>
    );
}