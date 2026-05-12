package com.PortalContabil.dto;

import com.PortalContabil.model.enums.StatusPendencia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;
// Para que o contador possa criar tarefas e o cliente possa ver o que deve.

//PendenciaDTO: Serve tanto para criação quanto para exibição.
public record PendenciaDTO(
        UUID id,
        @NotBlank String descricao,
        @NotNull LocalDate prazo,
        LocalDate dataVencimento,
        StatusPendencia status,
        UUID clienteId,
        String arquivoUrl
        ) {
}
