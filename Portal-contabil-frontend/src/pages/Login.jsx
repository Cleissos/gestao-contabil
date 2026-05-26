import { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Container, InputAdornment, IconButton } from '@mui/material';
import { AccountCircle, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { login, password });
            const { token, role } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('userId', response.data.id); // ESSENCIAL PARA O CHAT

            // Redireciona baseado na Role que vem do seu Backend
            if (role === 'CONTADOR') navigate('/dashboard-contador');
            else navigate('/dashboard-cliente');

        } catch (error) {
            alert("Login ou senha inválidos!" + error);
        }
    };

    return (
        <Box sx={{
            height: '100vh', display: 'flex', alignItems: 'center',
            background: 'linear-gradient(135deg, #1a237e 30%, #0d47a1 90%)'
        }}>
            <Container maxWidth="xs">
                <Paper elevation={10} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                        Portal Contábil
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        Bem-vindo! Identifique-se para acessar seus documentos.
                    </Typography>

                    <form onSubmit={handleLogin}>
                        <TextField
                            fullWidth
                            label="CPF, CNPJ ou CRC"
                            variant="outlined"
                            margin="normal"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccountCircle color="primary" />
                                        </InputAdornment>
                                    ),
                                }

                            }}
                        />

                        <TextField
                            fullWidth
                            label="Senha"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            slotProps={{
                                input: { // ADICIONADO: No MUI v6, adornments devem ficar dentro de 'input'
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock color="primary" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />

                        {/* LINK ADICIONADO PARA RECUPERAÇÃO DE SENHA */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => navigate('/esqueci-senha')}
                                sx={{ color: '#1a237e', textTransform: 'none', fontWeight: 500 }}
                            >
                                Esqueci minha senha
                            </Button>
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            size="large"
                            sx={{ mt: 3, mb: 2, backgroundColor: '#1a237e', height: '50px' }}
                        >
                            Entrar
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}