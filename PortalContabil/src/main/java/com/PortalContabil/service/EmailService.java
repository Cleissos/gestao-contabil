package com.PortalContabil.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String emailRemetente;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarEmailRecuperacao(String emailDestinatario, String linkRecuperacao) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(emailRemetente);
        message.setTo(emailDestinatario);
        message.setSubject("Recuperação de Senha - Portal Contábil");

        String conteudo = "Olá,\n\n"
                + "Você solicitou a redefinição de sua senha no Portal Contábil.\n"
                + "Clique no link abaixo para criar uma nova senha (este link é válido por 15 minutos):\n\n"
                + linkRecuperacao + "\n\n"
                + "Se você não solicitou essa alteração, por favor ignore este e-mail.\n"
                + "Atenciosamente,\nEquipe Portal Contábil.";

        message.setText(conteudo);

        mailSender.send(message);
    }

    // 💡 ADICIONADO: Método para notificar o cliente sobre a nova pendência
    public void enviarEmailNovaPendencia(String emailDestinatario, String nomeCliente, String descricaoPendencia, String prazoFormatado) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(emailRemetente);
        message.setTo(emailDestinatario);
        message.setSubject("⚠️ Nova Pendência Cadastrada - Portal Contábil");

        String linkPortal = "https://portalcontabil.site/login"; // Link do seu frontend

        String conteudo = "Olá, " + nomeCliente + ",\n\n"
                + "O seu escritório de contabilidade cadastrou uma nova obrigação no sistema:\n\n"
                + "📌 Descrição: " + descricaoPendencia + "\n"
                + "📅 Prazo Limite: " + prazoFormatado + "\n\n"
                + "Para visualizar os detalhes e enviar os documentos necessários, acesse o portal pelo link abaixo:\n"
                + linkPortal + "\n\n"
                + "Atenciosamente,\nEquipe Portal Contábil.";

        message.setText(conteudo);
        mailSender.send(message);
    }
}
