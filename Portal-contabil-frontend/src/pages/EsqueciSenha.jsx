import { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Container, InputAdornment, Alert } from '@mui/material';
import { Email } from '@mui/icons-material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function EsqueciSenha() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensagem({ tipo: '', texto: '' });

        try {
            const response = await api.post('/auth/esqueci-senha', { email });
            setMensagem({ tipo: 'success', texto: response.data.mensagem });
        } catch (error) {
            const erroMsg = error.response?.data?.erro || "Erro ao solicitar recuperação.";
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
                        Recuperar Senha
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        Digite seu e-mail cadastrado. Enviaremos um link seguro para você redefinir sua senha.
                    </Typography>

                    {mensagem.texto && (
                        <Alert severity={mensagem.tipo} sx={{ mb: 2, textAlign: 'left' }}>
                            {mensagem.texto}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="E-mail"
                            type="email"
                            variant="outlined"
                            margin="normal"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email color="primary" />
                                        </InputAdornment>
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
                            {loading ? "Enviando..." : "Enviar Link"}
                        </Button>

                        <Button 
                            fullWidth 
                            variant="text" 
                            onClick={() => navigate('/')}
                            sx={{ color: 'text.secondary', textTransform: 'none' }}
                        >
                            Voltar para o Login
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}