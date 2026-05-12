import { Paper, TextField, Button, Typography, MenuItem, Grid, Fade } from '@mui/material';
import api from '../services/api';
import Layout from '../components/Layout';
import { useState } from 'react';
import { PatternFormat } from 'react-number-format'; // Importação correta

export default function CadastroCliente() {
    const [formData, setFormData] = useState({
        nome: '',
        cpfCnpj: '',
        password: '',
        tipoCliente: 'PF'
    });

    const handleCadastro = async (e) => {
        e.preventDefault();
        try {
            // OPCIONAL: Se o seu backend preferir apenas números, 
            // você pode limpar a máscara antes de enviar:
            const dadosParaEnviar = {
                ...formData,
                cpfCnpj: formData.cpfCnpj.replace(/\D/g, '') // Remove tudo que não for número
            };

            await api.post('/clientes', dadosParaEnviar);
            alert("Cliente cadastrado com sucesso!");
            setFormData({ nome: '', cpfCnpj: '', password: '', tipoCliente: 'PF' });
        } catch (error) {
            alert("Erro ao cadastrar cliente. Verifique os dados." + error);
        }
    };

    return (
        <Layout title="Cadastrar Novo Cliente">
            <Fade in timeout={500}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 800, mx: 'auto' }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#1a237e' }}>
                        Dados do Cliente
                    </Typography>

                    <form onSubmit={handleCadastro}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth label="Nome da Empresa ou Pessoa"
                                    required
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    select
                                    fullWidth label="Tipo"
                                    value={formData.tipoCliente}
                                    onChange={(e) => setFormData({ ...formData, tipoCliente: e.target.value, cpfCnpj: '' })} // Limpa o campo ao trocar tipo
                                >
                                    <MenuItem value="PF">Pessoa Física (CPF)</MenuItem>
                                    <MenuItem value="MEI">Pessoa Jurídica (CNPJ)</MenuItem>
                                </TextField>
                            </Grid>

                            {/* CAMPO COM MÁSCARA DINÂMICA */}

                            <Grid item xs={12} md={6}>
                                <PatternFormat
                                    format={formData.tipoCliente === 'PF' ? "###.###.###-##" : "##.###.###/####-##"}
                                    mask="_"
                                    customInput={TextField} // Isso faz ele herdar todo o estilo do MUI
                                    fullWidth
                                    label={formData.tipoCliente === 'PF' ? "CPF" : "CNPJ"}
                                    required
                                    value={formData.cpfCnpj}
                                    onValueChange={(values) => {
                                        // .value traz apenas os números (ex: 12345678901)
                                        // .formattedValue traz com a máscara (ex: 123.456.789-01)
                                        setFormData({ ...formData, cpfCnpj: values.value });
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth label="Senha Provisória"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </Grid>

                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    sx={{ py: 1.5, backgroundColor: '#1a237e' }}
                                >
                                    Salvar e Gerar Acesso
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Fade>
        </Layout>
    );
}