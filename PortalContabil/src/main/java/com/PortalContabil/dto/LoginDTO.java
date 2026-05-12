package com.PortalContabil.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// LoginDTO (Para o cliente enviar CPF/CNPJ e Senha)
public record LoginDTO(
        @NotBlank(message = "O login (CPF/CNPJ) é obrigatório")
        String login,

        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres.")
        String password
) {
}
