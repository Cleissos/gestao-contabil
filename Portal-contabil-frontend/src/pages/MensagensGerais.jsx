// import { useState, useEffect } from 'react';
// import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Divider, Box, Badge } from '@mui/material';
// import { Chat as ChatIcon, DoneAll } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';

// export default function MensagensGerais() {
//     const [conversas, setConversas] = useState([]);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const carregarConversas = async () => {
//             try {
//                 // Endpoint que criamos anteriormente no Backend
//                 const res = await api.get('/messages/resumo');
//                 console.log("Dados que chegaram:", res.data); // Verifique os nomes das chaves aqui!
//                 setConversas(res.data);
//             } catch (err) {
//                 console.error("Erro ao carregar resumo de mensagens", err);
//             }
//         };
//         carregarConversas();
//     }, []);

//     return (
//         <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
//             <List sx={{ width: '100%', p: 0 }}>
//                 {conversas.map((conv, index) => (
//                     <div key={conv.remetenteId}>
//                         <ListItem 
//                             alignItems="flex-start" 
//                             button 
//                             onClick={() => navigate(`/chat/${conv.remetenteId}`)}
//                             sx={{ py: 2, '&:hover': { bgcolor: '#f5f5f5' } }}
//                         >
//                             <ListItemAvatar>
//                                 <Badge color="error" badgeContent={conv.qtdNaoLidas} overlap="circular">
//                                     <Avatar sx={{ bgcolor: '#1a237e' }}>
//                                         {conv.nomeRemetente.charAt(0)}
//                                     </Avatar>
//                                 </Badge>
//                             </ListItemAvatar>
                            
//                             <ListItemText
//                                 primary={
//                                     <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                                         <Typography sx={{ fontWeight: conv.qtdNaoLidas > 0 ? 700 : 500 }}>
//                                             {conv.nomeRemetente}
//                                         </Typography>
//                                         <Typography variant="caption" color="text.secondary">
//                                             {new Date(conv.dataEnvio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
//                                         </Typography>
//                                     </Box>
//                                 }
//                                 secondary={
//                                     <Typography
//                                         variant="body2"
//                                         color="text.primary"
//                                         sx={{ 
//                                             display: 'inline', 
//                                             fontWeight: conv.qtdNaoLidas > 0 ? 600 : 400,
//                                             overflow: 'hidden',
//                                             textOverflow: 'ellipsis',
//                                             whiteSpace: 'nowrap'
//                                         }}
//                                     >
//                                         {conv.ultimaMensagem}
//                                     </Typography>
//                                 }
//                             />
//                         </ListItem>
//                         {index < conversas.length - 1 && <Divider variant="inset" component="li" />}
//                     </div>
//                 ))}
//             </List>
//         </Box>
//     );
// }

import { useState, useEffect } from 'react';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Divider, Box, Badge, ListItemButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MensagensGerais() {
    const [conversas, setConversas] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const carregarConversas = async () => {
            try {
                const res = await api.get('/messages/resumo');
                setConversas(res.data);
            } catch (err) {
                console.error("Erro ao carregar resumo de mensagens", err);
            }
        };
        carregarConversas();
    }, []);

    return (
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
            <List sx={{ width: '100%', p: 0 }}>
                {conversas.map((conv, index) => (
                    <div key={conv.remetenteId}>
                        {/* 1. Removido 'button' e 'onClick' do ListItem */}
                        <ListItem 
                            alignItems="flex-start" 
                            disablePadding
                        >
                            {/* 2. Adicionado ListItemButton para resolver o erro 'non-boolean attribute button' */}
                            <ListItemButton 
                                onClick={() => navigate(`/chat/${conv.remetenteId}`)}
                                sx={{ py: 2, px: 2, '&:hover': { bgcolor: '#f5f5f5' } }}
                            >
                                <ListItemAvatar>
                                    <Badge color="error" badgeContent={conv.qtdNaoLidas} overlap="circular">
                                        <Avatar sx={{ bgcolor: '#1a237e' }}>
                                            {conv.nomeRemetente ? conv.nomeRemetente.charAt(0) : '?'}
                                        </Avatar>
                                    </Badge>
                                </ListItemAvatar>
                                
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography sx={{ fontWeight: conv.qtdNaoLidas > 0 ? 700 : 500 }}>
                                                {conv.nomeRemetente}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {conv.dataEnvio ? new Date(conv.dataEnvio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Typography
                                            variant="body2"
                                            color="text.primary"
                                            sx={{ 
                                                display: 'block', 
                                                fontWeight: conv.qtdNaoLidas > 0 ? 600 : 400,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {conv.ultimaMensagem}
                                        </Typography>
                                    }
                                />
                            </ListItemButton>
                        </ListItem>
                        {index < conversas.length - 1 && <Divider variant="inset" component="li" />}
                    </div>
                ))}
            </List>
        </Box>
    );
}