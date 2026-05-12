package com.PortalContabil.service;

import com.PortalContabil.dto.ClienteCreateDTO;
import com.PortalContabil.model.Cliente;
import com.PortalContabil.model.Contador;
import com.PortalContabil.model.User;
import com.PortalContabil.model.enums.UserRole;
import com.PortalContabil.repository.ClienteRepository;
import com.PortalContabil.repository.ContadorRepository;
import com.PortalContabil.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
//
//@Service
//public class ClienteService {
//
//    @Autowired
//    private ClienteRepository clienteRepository;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//
//    @Autowired
//    private ContadorRepository contadorRepository;
//
//    @Transactional // Garante que se um erro ocorrer, nada seja salvo
//    public void cadastrarNovoCliente(ClienteCreateDTO data, User userContadorLogado) {
//
//        // 1. Criar a conta de login (User) para o Cliente
//        User novoUser = new User();
//        novoUser.setLogin(data.cpfCnpj()); // O login do cliente será o CPF/CNPJ
//        novoUser.setPassword(passwordEncoder.encode(data.password())); // Senha definida pelo contador
//        novoUser.setRole(UserRole.CLIENTE);
//        // Salvamos primeiro o usuário para gerar o ID dele
//        userRepository.save(novoUser);
//
//        // 2. Buscar o perfil do Contador que está logado
//        Contador contadorPerfil = contadorRepository.findByUserAccount(userContadorLogado)
//                .orElseThrow(() -> new RuntimeException("Contador não encontrado"));
//
//        // 3. Criar o Cliente (Dados)
//        Cliente novoCliente = new Cliente();
//        novoCliente.setNome(data.nome());
//        novoCliente.setCpfCnpj(data.cpfCnpj());
//        novoCliente.setTipoCliente(data.tipoCliente());
//        novoCliente.setUserAccount(novoUser); // Vincula à conta de login criada acima
//        novoCliente.setContador(contadorPerfil); // O contador que está logado agora
//
//        clienteRepository.save(novoCliente);
//    }
//}

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ContadorRepository contadorRepository;

    @Transactional
    public void cadastrarNovoCliente(ClienteCreateDTO data, User userContadorLogado) {

        // 1. Criar a conta de login (User) para o Cliente
        User novoUser = new User();
        novoUser.setLogin(data.cpfCnpj());
        novoUser.setPassword(passwordEncoder.encode(data.password()));
        novoUser.setRole(UserRole.CLIENTE);

        // Salva o usuário para gerar o ID UUID
        User userClienteSalvo = userRepository.save(novoUser);

        // 2. Buscar o perfil do Contador logado (usando o ID unificado)
        Contador contadorPerfil = contadorRepository.findById(userContadorLogado.getId())
                .orElseThrow(() -> new RuntimeException("Contador não encontrado"));

        // 3. Criar o perfil do Cliente com o ID unificado
        Cliente novoCliente = new Cliente();
        novoCliente.setNome(data.nome());
        novoCliente.setCpfCnpj(data.cpfCnpj());
        novoCliente.setTipoCliente(data.tipoCliente());
        novoCliente.setContador(contadorPerfil);

        // Vincula a conta. O @MapsId na entidade Cliente cuidará do ID igual
        novoCliente.setUserAccount(userClienteSalvo);

        clienteRepository.save(novoCliente);
    }
}