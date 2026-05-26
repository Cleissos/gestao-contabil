package com.PortalContabil.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegistroContadorDTO(
        @NotBlank String login,
        @NotBlank String password,
        @NotBlank String nome,
        @NotBlank String registroProfissional, // O seu CRC [cite: 7]
        @NotBlank @Email String email // ADICIONADO: Campo obrigatório e validado como e-mai
) {
}
