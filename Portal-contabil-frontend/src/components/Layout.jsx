import { useState, useEffect } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Divider, ListItemButton, Badge } from '@mui/material';
import {
  Dashboard as DashIcon,
  People,
  PersonAddAlt1,
  Description, 
  Assignment, 
  ExitToApp,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const drawerWidth = 260;

export default function Layout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');
  const [totalNaoLidas, setTotalNaoLidas] = useState(0);

  // Busca o total de mensagens não lidas para a bolinha do menu
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const buscarNotificacoes = async () => {
      try {
        // Chamada ao endpoint que soma todas as mensagens não lidas
        const res = await api.get('/messages/total-nao-lidas');
        // Garante que o valor seja um número válido
        setTotalNaoLidas(Number(res.data) || 0);
      } catch (err) {
        if (err.response?.status !== 403 && err.response?.status !== 401) {
          console.error("Erro ao buscar notificações", err);
        }
      }
    };

    buscarNotificacoes();
    
    // Atualiza o contador a cada 60 segundos automaticamente
    const interval = setInterval(buscarNotificacoes, 5000);
    return () => clearInterval(interval);
  }, [location]); // Recarrega ao mudar de página para atualizar o badge imediatamente

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Configuração do Menu com base no cargo (Role)
  const menuItems = role === 'CONTADOR'
    ? [
        { text: 'Dashboard', icon: <DashIcon />, path: '/dashboard' },
        { text: 'Novo Cliente', icon: <PersonAddAlt1 />, path: '/cadastrar-cliente' },
        { text: 'Gestão de Clientes', icon: <People />, path: '/clientes' },
        { text: 'Mensagens', icon: <ChatIcon />, path: '/mensagens-gerais', badge: totalNaoLidas }, 
        { text: 'Gestão de Documentos', icon: <Description />, path: '/documentos' },
        { text: 'Pendências Gerais', icon: <Assignment />, path: '/pendencias' },
      ]
    : [
        { text: 'Meu Painel', icon: <DashIcon />, path: '/dashboard' },
        { text: 'Mensagens', icon: <ChatIcon />, path: '/chat', badge: totalNaoLidas }, 
        { text: 'Meus Documentos', icon: <Description />, path: '/documentos' },
        { text: 'Minhas Pendências', icon: <Assignment />, path: '/minhas-pendencias' },
      ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#1a237e' }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Portal Contábil - {title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ opacity: 0.8, bgcolor: 'rgba(255,255,255,0.1)', px: 1, py: 0.5, borderRadius: 1 }}>
              {role}
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: 1 }} />
            <IconButton color="inherit" onClick={handleLogout} title="Sair">
              <ExitToApp />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            borderRight: '1px solid #e0e0e0',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List sx={{ px: 1 }}>
            {menuItems.map((item) => {
              const isSelected = location.pathname === item.path;
              return (
                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      minHeight: 48,
                      px: 2.5,
                      mb: 0.5,
                      borderRadius: '8px',
                      backgroundColor: isSelected ? '#e8eaf6' : 'transparent',
                      '&:hover': { backgroundColor: '#f5f5f5' },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: 2,
                        justifyContent: 'center',
                        color: isSelected ? '#1a237e' : '#757575',
                      }}
                    >
                      {/* O Badge só aparece se houver notificações (item.badge > 0) */}
                      <Badge 
                        badgeContent={item.badge} 
                        color="error" 
                        max={99}
                        invisible={!item.badge || item.badge === 0}
                      >
                        {item.icon}
                      </Badge>
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      sx={{ 
                        '& .MuiTypography-root': { 
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.85rem',
                          color: isSelected ? '#1a237e' : '#424242'
                        } 
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          backgroundColor: '#f4f6f8', 
          minHeight: '100vh',
          width: { sm: `calc(100% - ${drawerWidth}px)` } 
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}


// MOBILE QUE FALTA IMPLEMENTAR
// import { useState, useEffect } from 'react';
// import { 
//   Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, 
//   Toolbar, Typography, IconButton, Divider, ListItemButton, Badge, useMediaQuery, useTheme 
// } from '@mui/material';
// import {
//   Menu as MenuIcon, // Ícone para o "hambúrguer"
//   Dashboard as DashIcon,
//   People,
//   PersonAddAlt1,
//   Description, 
//   Assignment, 
//   ExitToApp,
//   Chat as ChatIcon
// } from '@mui/icons-material';
// import { useNavigate, useLocation } from 'react-router-dom';
// import api from '../services/api';

// const drawerWidth = 260;

// export default function Layout({ children, title }) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const theme = useTheme();
  
//   // Detecta se a tela é celular (abaixo de 900px / 'md')
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [totalNaoLidas, setTotalNaoLidas] = useState(0);
//   const role = localStorage.getItem('role');

//   const handleDrawerToggle = () => {
//     setMobileOpen(!mobileOpen);
//   };

//   useEffect(() => {
//     const buscarNotificacoes = async () => {
//       try {
//         const res = await api.get('/messages/total-nao-lidas');
//         setTotalNaoLidas(Number(res.data) || 0);
//       } catch (err) {
//         if (err.response?.status !== 403) console.error(err);
//       }
//     };
//     buscarNotificacoes();
//   }, [location]);

//   const menuItems = role === 'CONTADOR'
//     ? [
//         { text: 'Dashboard', icon: <DashIcon />, path: '/dashboard' },
//         { text: 'Novo Cliente', icon: <PersonAddAlt1 />, path: '/cadastrar-cliente' },
//         { text: 'Gestão de Clientes', icon: <People />, path: '/clientes' },
//         { text: 'Mensagens', icon: <ChatIcon />, path: '/mensagens-gerais', badge: totalNaoLidas }, 
//         { text: 'Gestão de Documentos', icon: <Description />, path: '/documentos' },
//         { text: 'Pendências Gerais', icon: <Assignment />, path: '/pendencias' },
//       ]
//     : [
//         { text: 'Meu Painel', icon: <DashIcon />, path: '/dashboard' },
//         { text: 'Mensagens', icon: <ChatIcon />, path: '/chat', badge: totalNaoLidas }, 
//         { text: 'Meus Documentos', icon: <Description />, path: '/documentos' },
//         { text: 'Minhas Pendências', icon: <Assignment />, path: '/pendencias' },
//       ];

//   // Conteúdo do Menu (extraído para repetir no Mobile e Desktop)
//   const drawerContent = (
//     <Box sx={{ mt: 2 }}>
//       <Toolbar /> {/* Espaço para não ficar atrás da AppBar */}
//       <List sx={{ px: 1 }}>
//         {menuItems.map((item) => {
//           const isSelected = location.pathname === item.path;
//           return (
//             <ListItem key={item.text} disablePadding>
//               <ListItemButton
//                 onClick={() => {
//                   navigate(item.path);
//                   if (isMobile) setMobileOpen(false); // Fecha o menu ao clicar no celular
//                 }}
//                 sx={{
//                   borderRadius: '8px',
//                   mb: 0.5,
//                   backgroundColor: isSelected ? '#e8eaf6' : 'transparent',
//                 }}
//               >
//                 <ListItemIcon sx={{ color: isSelected ? '#1a237e' : '#757575' }}>
//                   <Badge badgeContent={item.badge} color="error" invisible={!item.badge}>
//                     {item.icon}
//                   </Badge>
//                 </ListItemIcon>
//                 <ListItemText primary={item.text} />
//               </ListItemButton>
//             </ListItem>
//           );
//         })}
//       </List>
//     </Box>
//   );

//   return (
//     <Box sx={{ display: 'flex' }}>
//       <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, backgroundColor: '#1a237e' }}>
//         <Toolbar>
//           {/* BOTÃO HAMBÚRGUER: Só aparece no celular */}
//           {isMobile && (
//             <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
//               <MenuIcon />
//             </IconButton>
//           )}
          
//           <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 'bold', fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
//             Portal Contábil - {title}
//           </Typography>
          
//           <IconButton color="inherit" onClick={() => { localStorage.clear(); navigate('/login'); }}>
//             <ExitToApp />
//           </IconButton>
//         </Toolbar>
//       </AppBar>

//       {/* SISTEMA DE MENUS RESPONSIVOS */}
//       <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
//         {/* MENU MOBILE (Temporário) */}
//         <Drawer
//           variant="temporary"
//           open={mobileOpen}
//           onClose={handleDrawerToggle}
//           ModalProps={{ keepMounted: true }} // Melhora o desempenho no mobile
//           sx={{
//             display: { xs: 'block', md: 'none' },
//             '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
//           }}
//         >
//           {drawerContent}
//         </Drawer>

//         {/* MENU DESKTOP (Permanente) */}
//         <Drawer
//           variant="permanent"
//           sx={{
//             display: { xs: 'none', md: 'block' },
//             '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
//           }}
//           open
//         >
//           {drawerContent}
//         </Drawer>
//       </Box>

//       {/* CONTEÚDO PRINCIPAL: Ajusta a margem automaticamente */}
//       <Box 
//         component="main" 
//         sx={{ 
//           flexGrow: 1, 
//           p: 3, 
//           width: { md: `calc(100% - ${drawerWidth}px)` },
//           minHeight: '100vh',
//           backgroundColor: '#f4f6f8'
//         }}
//       >
//         <Toolbar />
//         {children}
//       </Box>
//     </Box>
//   );
// }