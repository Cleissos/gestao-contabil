import { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Container, Fade } from '@mui/material';
import { BusinessCenter } from '@mui/icons-material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Cadastro() {
    const [formData, setFormData] = useState({ 
        nome: '', 
        documento: '', // Será o CRC e também o login
        password: ''
    });
    const navigate = useNavigate();

    const handleCadastro = async (e) => {
        e.preventDefault();

        try {
            // Payload ajustado para o RegistroContadorDTO do seu Backend
            const payload = {
                login: formData.documento, 
                password: formData.password,
                nome: formData.nome,
                registroProfissional: formData.documento
            };

            // Envia para a rota de registro de contador
            await api.post('/auth/register/contador', payload);
            
            alert("Conta de Contador criada com sucesso!");
            navigate('/login'); // Redireciona para a tela de login
        } catch (error) {
            console.error("Erro no cadastro:", error);
            alert("Erro ao cadastrar. Verifique se o CRC já está em uso ou se o servidor está ativo.");
        }
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', background: '#f0f2f5' }}>
            <Container maxWidth="sm">
                <Fade in timeout={800}>
                    <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
                        
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <BusinessCenter color="primary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h5" fontWeight="bold">
                                Registro de Contador
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Crie sua conta profissional para gerenciar seus clientes.
                            </Typography>
                        </Box>

                        <form onSubmit={handleCadastro}>
                            <TextField 
                                fullWidth 
                                label="Nome Completo" 
                                margin="normal" 
                                required
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })} 
                            />

                            <TextField 
                                fullWidth 
                                label="Número do CRC" 
                                margin="normal"
                                required
                                helperText="O CRC será utilizado como seu login de acesso."
                                value={formData.documento}
                                onChange={(e) => setFormData({ ...formData, documento: e.target.value })} 
                            />

                            <TextField 
                                fullWidth 
                                label="Senha" 
                                type="password" 
                                margin="normal"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                            />

                            <Button 
                            
                                fullWidth 
                                variant="contained" 
                                type="submit" 
                                size="large" 
                                sx={{ mt: 3, py: 1.5, backgroundColor: '#1a237e', fontWeight: 'bold' }}
                                onClick={() => navigate("/login")}
                            >
                                FINALIZAR CADASTRO
                            </Button>
                            
                            <Button 
                                fullWidth 
                                variant="text" 
                                sx={{ mt: 1, textTransform: 'none' }} 
                                onClick={() => navigate('/login')}
                            >
                                Já possui uma conta? Entrar agora
                            </Button>
                        </form>
                    </Paper>
                </Fade>
            </Container>
        </Box>
    );
}