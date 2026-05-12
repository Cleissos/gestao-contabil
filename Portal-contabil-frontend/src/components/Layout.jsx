import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Divider, ListItemButton } from '@mui/material';
import {
  Dashboard as DashIcon,
  People,
  PersonAddAlt1,
  Description, Assignment, ExitToApp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 260;

export default function Layout({ children, title }) {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const menuItems = role === 'CONTADOR'
    ? [
      { text: 'Dashboard', icon: <DashIcon />, path: '/dashboard' },
      { text: 'Novo Cliente', icon: <PersonAddAlt1 />, path: '/cadastrar-cliente' },
      { text: 'Gestão de Clientes', icon: <People />, path: '/clientes' },
      { text: 'Gestão de Documentos', icon: <Description />, path: '/documentos' },
      { text: 'Pendências Gerais', icon: <Assignment />, path: '/pendencias' },
    ]
    : [
      { text: 'Meu Painel', icon: <DashIcon />, path: '/dashboard' },
      { text: 'Meus Documentos', icon: <Description />, path: '/documentos' },
      { text: 'Minhas Pendências', icon: <Assignment />, path: '/pendencias' },
    ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#1a237e' }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Portal Contábil - {title}
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>{role}</Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #ddd' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    mb: 1,
                    '&:hover': { backgroundColor: '#e8eaf6' },
                    borderRadius: '8px',
                    mx: 1
                  }}
                >
                  <ListItemIcon sx={{ color: '#1a237e' }}>
                    {item.icon}
                  </ListItemIcon>
                  {/* Removido primaryTypographyProps para evitar o erro de InputProps/DOM */}
                  <ListItemText 
                    primary={item.text} 
                    sx={{ '& .MuiTypography-root': { fontWeight: 500 } }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}