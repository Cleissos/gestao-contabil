package com.PortalContabil.service;


import jakarta.annotation.PostConstruct;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    // Defina uma pasta no seu C: ou no diretório do projeto
    private final Path root = Paths.get("uploads");

    // A anotação @PostConstruct faz esse método rodar assim que o Spring ligar
    @PostConstruct
    public void init() {
        try{
            if (!Files.exists(root)) {
                Files.createDirectories(root);
                System.out.println("Pasta de uploads criada com sucesso!");
            }
        }catch (IOException e) {
            throw new RuntimeException("Não foi possível inicializar a pasta de uploads.");
        }
    }

    public String salvar(MultipartFile file) {
        try{
            // Garante que a pasta existe antes de salvar (segurança extra)
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            String nomeArquivo = UUID.randomUUID() + "_" +  file.getOriginalFilename();
            Files.copy(file.getInputStream(), this.root.resolve(nomeArquivo));
            return nomeArquivo; // Retornamos o nome para salvar no banco
        }catch (Exception e){
            throw new RuntimeException("Erro ao salvar arquivo: " + e.getMessage());
        }
    }

    public Resource carregar(String filename) {
        try{
            Path file = root.resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) return resource;
            else throw new RuntimeException("Arquivo não encontrado");
        }catch (MalformedURLException e) {
            throw new RuntimeException("Erro: " + e.getMessage());
        }
    }

}
