package com.PortalContabil.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record DocumentoHistoricoDTO(
        UUID id,
        String tipo,
        LocalDateTime data,
        String operacao, // "UPLOAD" ou "DOWNLOAD"
        String origem,   // Nome de quem enviou (Contador ou Cliente)
        String destino   // Nome de quem deve receber
) {
}
