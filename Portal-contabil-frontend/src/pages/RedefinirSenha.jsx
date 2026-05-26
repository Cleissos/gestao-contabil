import { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Container, InputAdornment, IconButton, Alert } from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function RedefinirSenha() {
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
    
    const navigate = useNavigate();
    const location = useLocation();

    // Captura o token que veio do link do e-mail (?token=XYZ)
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    const handleRedefinir = async (e) => {
        e.preventDefault();
        
        if (novaSenha !== confirmarSenha) {
            setMensagem({ tipo: 'error', texto: 'As senhas não coincidem!' });
            return;
        }

        if (!token) {
            setMensagem({ tipo: 'error', texto: 'Token de verificação ausente ou inválido.' });
            return;
        }

        setLoading(true);
        setMensagem({ tipo: '', texto: '' });

        try {
            const response = await api.post('/auth/redefinir-senha', { token, novaSenha });
            setMensagem({ tipo: 'success', texto: response.data.mensagem });
            
            // Redireciona para o login após 3 segundos
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            const erroMsg = error.response?.data?.erro || "Erro ao redefinir a senha.";
            setMensagem({ tipo: 'error', texto: erroMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            height: '100vh', display: 'flex', alignItems: 'center',
            background: 'linear-gradient(135deg, #1a237e 30%, #0d47a1 90%)'
        }}>
            <Container maxWidth="xs">
                <Paper elevation={10} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                        Nova Senha
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        Digite e confirme sua nova senha de acesso.
                    </Typography>

                    {mensagem.texto && (
                        <Alert severity={mensagem.tipo} sx={{ mb: 2, textAlign: 'left' }}>
                            {mensagem.texto}
                        </Alert>
                    )}

                    <form onSubmit={handleRedefinir}>
                        <TextField
                            fullWidth
                            label="Nova Senha"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            margin="normal"
                            required
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start"><Lock color="primary" /></InputAdornment>
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

                        <TextField
                            fullWidth
                            label="Confirmar Nova Senha"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            margin="normal"
                            required
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start"><Lock color="primary" /></InputAdornment>
                                    ),
                                }
                            }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            size="large"
                            disabled={loading || mensagem.tipo === 'success'}
                            sx={{ mt: 3, mb: 2, backgroundColor: '#1a237e', height: '50px' }}
                        >
                            {loading ? "Salvando..." : "Alterar Senha"}
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}