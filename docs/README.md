# Documentação — Form Builder

Esta pasta reúne a documentação técnica do projeto **Form Builder**, um clone de estudo do Google Forms desenvolvido com **Spring Boot 4.1 (Java 21)** no backend, **React + Vite + TypeScript** no frontend e **MySQL 8.4** como banco de dados, tudo orquestrado via **Docker Compose**.

## Índice

| Documento | Conteúdo |
|-----------|----------|
| [ARQUITETURA.md](./ARQUITETURA.md) | Visão geral do sistema, camadas do backend, stack do frontend e fluxo de execução via Docker. |
| [BANCO-DE-DADOS.md](./BANCO-DE-DADOS.md) | Modelo de dados: as 7 entidades, chaves, relacionamentos, tipos, enums e as decisões de projeto (armazenamento de UUID, InnoDB, consultas avançadas). |
| [API.md](./API.md) | Referência dos endpoints REST: autenticação, formulários, seções, perguntas, opções, respostas públicas e consultas. |

## Diagrama Entidade-Relacionamento

O MER (modelo lógico) está disponível nesta mesma pasta em dois formatos:

- [`MER-Form-Builder.svg`](./MER-Form-Builder.svg) — versão vetorial (recomendada para leitura em tela).
- [`MER-Form-Builder.png`](./MER-Form-Builder.png) — versão em imagem.

## Como rodar o projeto

O passo a passo completo de execução (variáveis de ambiente, `docker compose up`, portas) está no [README principal do repositório](../README.md) e resumido em [ARQUITETURA.md](./ARQUITETURA.md#execução-via-docker).

Resumo rápido:

```bash
cp .env.example .env   # ajuste as senhas e o JWT_SECRET
docker compose up --build
```

| Serviço | Porta padrão |
|---------|--------------|
| Frontend (Nginx) | `5173` |
| Backend (Spring Boot) | `8080` |
| MySQL | `3306` |
