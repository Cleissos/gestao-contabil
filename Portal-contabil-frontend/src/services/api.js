import axios from 'axios';

// Criamos a instância base do Axio
const api = axios.create({
    baseURL: 'http://localhost:8080', // URL do seu Backend Spring Boot
    headers: {
        'Content-Type': 'application/json'
    }
});

// INTERCEPTOR DE REQUISIÇÃO (Segurança e IHC)
// Antes de qualquer chamada sair, verificamos se há um token no localStorage.
// Isso evita que o usuário tenha que se reautenticar a cada clique.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Se o erro for 401, o sistema te redireciona
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // TRUQUE PARA BLOB: Se o erro vier de um download, 
        // precisamos converter o blob de erro de volta para JSON para ler a mensagem
        if (error.request.responseType === 'blob' && error.response.data instanceof Blob) {
            const textoErro = await error.response.data.text();
            const erroJson = JSON.parse(textoErro);
            console.error("Erro real do backend:", erroJson);
        }

        return Promise.reject(error);
    }
);

export default api;