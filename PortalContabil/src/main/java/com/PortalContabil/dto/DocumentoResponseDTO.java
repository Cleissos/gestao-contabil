package com.PortalContabil.dto;

import com.PortalContabil.model.enums.TipoDocumento;

import java.time.LocalDateTime;
import java.util.UUID;

// DocumentoResponseDTO: Para listar os documentos para o contador ou cliente.
public record DocumentoResponseDTO(
        UUID id,
        TipoDocumento tipo,
        Integer mes,
        Integer ano,
        String urlArquivo,
        LocalDateTime dataUpload
) {
}
