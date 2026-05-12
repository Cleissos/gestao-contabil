package com.PortalContabil.service;

import com.PortalContabil.dto.DocumentoRequestDTO;
import com.PortalContabil.model.Cliente;
import com.PortalContabil.model.Contador;
import com.PortalContabil.model.Documento;
import com.PortalContabil.repository.DocumentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DocumentoService {

    @Autowired
    private DocumentoRepository repository;

    public Documento salvarDocumento(DocumentoRequestDTO data, Cliente cliente) {
        Documento documento = new Documento();
        documento.setTipo(data.tipo());
        documento.setMes(data.mes());
        documento.setAno(data.ano());
        documento.setUrlArquivo(data.urlArquivo());

        // Vincula o documento ao cliente dono do arquivo
        documento.setCliente(cliente);

        // Vincula automaticamente ao contador que gerencia esse cliente
        // Isso é o que mudamos para seguir a nova arquitetura
        documento.setContador(cliente.getContador());

        return repository.save(documento);
    }
}
