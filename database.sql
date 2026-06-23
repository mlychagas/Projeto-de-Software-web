-- Dump do Banco de Dados MuseERP (pw2_app_web)

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `agenda`;
CREATE TABLE `agenda` (
  `fk_aluno_id` int NOT NULL,
  `fk_turma_id` int NOT NULL,
  `frequencia` int NOT NULL DEFAULT '0',
  `status_agenda` enum('Matriculado','Cancelado','Suspenso','Concluído') NOT NULL DEFAULT 'Matriculado',
  `data_inscricao` date NOT NULL,
  `data_cancelamento` date DEFAULT NULL,
  PRIMARY KEY (`fk_aluno_id`,`fk_turma_id`),
  KEY `FK_9b1da46fd2518dd2b6d7871affc` (`fk_turma_id`),
  CONSTRAINT `FK_61fb7d20e4ef1b5ac838247b1c8` FOREIGN KEY (`fk_aluno_id`) REFERENCES `pessoa` (`id`),
  CONSTRAINT `FK_9b1da46fd2518dd2b6d7871affc` FOREIGN KEY (`fk_turma_id`) REFERENCES `turma` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `agenda` VALUES (2, 1, 0, 'Matriculado', '2026-06-01 04:00:00', NULL);
INSERT INTO `agenda` VALUES (3, 1, 1, 'Cancelado', '2026-06-22 04:00:00', '2026-06-23 04:00:00');
INSERT INTO `agenda` VALUES (3, 2, 0, 'Cancelado', '2026-06-01 04:00:00', '2026-06-23 04:00:00');
INSERT INTO `agenda` VALUES (6, 9, 1, 'Matriculado', '2026-06-22 04:00:00', NULL);
INSERT INTO `agenda` VALUES (7, 1, 1, 'Cancelado', '2026-06-23 04:00:00', '2026-06-23 04:00:00');
INSERT INTO `agenda` VALUES (7, 6, 1, 'Cancelado', '2026-06-23 04:00:00', '2026-06-23 04:00:00');
INSERT INTO `agenda` VALUES (7, 7, 1, 'Matriculado', '2026-06-23 04:00:00', '2026-06-23 04:00:00');
INSERT INTO `agenda` VALUES (10, 8, 1, 'Matriculado', '2026-06-23 04:00:00', NULL);

DROP TABLE IF EXISTS `aula`;
CREATE TABLE `aula` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data_prevista` date NOT NULL,
  `data_realizada` date DEFAULT NULL,
  `horario_inicio` time NOT NULL,
  `horario_fim` time NOT NULL,
  `status_presenca_aluno` enum('Presente','Faltou','Pendente','Justificado') NOT NULL DEFAULT 'Pendente',
  `status_presenca_professor` enum('Presente','Faltou','Pendente','Justificado') NOT NULL DEFAULT 'Pendente',
  `reagendado` tinyint NOT NULL DEFAULT '0',
  `status_aula` enum('Agendada','Realizada','Cancelada','Adiada') NOT NULL DEFAULT 'Agendada',
  `observacoes` text,
  `fk_aluno_id` int DEFAULT NULL,
  `fk_turma_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_19d73404795cfcfb7fb69949eed` (`fk_aluno_id`),
  KEY `FK_e7fa272f83e8f194b8954c3bd5f` (`fk_turma_id`),
  CONSTRAINT `FK_19d73404795cfcfb7fb69949eed` FOREIGN KEY (`fk_aluno_id`) REFERENCES `pessoa` (`id`),
  CONSTRAINT `FK_e7fa272f83e8f194b8954c3bd5f` FOREIGN KEY (`fk_turma_id`) REFERENCES `turma` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `aula` VALUES (1, '2026-06-22 04:00:00', '2026-06-22 04:00:00', '08:00:00', '09:00:00', 'Presente', 'Presente', 0, 'Realizada', 'Aula concluída hoje cedo', 2, 1);
INSERT INTO `aula` VALUES (2, '2026-06-22 04:00:00', NULL, '20:00:00', '21:00:00', 'Pendente', 'Pendente', 0, 'Agendada', 'Aula em andamento', 2, 1);
INSERT INTO `aula` VALUES (3, '2026-06-22 04:00:00', NULL, '22:00:00', '23:00:00', 'Pendente', 'Pendente', 0, 'Agendada', 'Próxima aula de hoje', 3, 2);
INSERT INTO `aula` VALUES (4, '2026-06-23 04:00:00', NULL, '15:00:00', '16:00:00', 'Pendente', 'Pendente', 0, 'Cancelada', 'Aula de amanhã', 4, 3);
INSERT INTO `aula` VALUES (5, '2026-06-21 04:00:00', '2026-06-21 04:00:00', '10:00:00', '11:00:00', 'Faltou', 'Presente', 0, 'Realizada', 'Aluno faltou ontem', 2, 1);

DROP TABLE IF EXISTS `contrato`;
CREATE TABLE `contrato` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data_inicio` date NOT NULL,
  `data_fim` date DEFAULT NULL,
  `data_vencimento_parcela` date DEFAULT NULL,
  `valor_mensal` decimal(10,2) NOT NULL,
  `status_contrato` enum('Ativo','Cancelado','Encerrado','Suspenso') NOT NULL DEFAULT 'Ativo',
  `fk_aluno_id` int NOT NULL,
  `fk_curso_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ccfb661d1fa19a2e0a7eb780c10` (`fk_aluno_id`),
  KEY `FK_a100dd6d15d68e319cc4eb67209` (`fk_curso_id`),
  CONSTRAINT `FK_a100dd6d15d68e319cc4eb67209` FOREIGN KEY (`fk_curso_id`) REFERENCES `curso` (`id`),
  CONSTRAINT `FK_ccfb661d1fa19a2e0a7eb780c10` FOREIGN KEY (`fk_aluno_id`) REFERENCES `pessoa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `contrato` VALUES (1, '2026-06-01 04:00:00', '2027-06-01 04:00:00', '2026-06-05 04:00:00', '300.00', 'Ativo', 2, 1);
INSERT INTO `contrato` VALUES (2, '2026-06-01 04:00:00', '2026-06-23 04:00:00', '2026-06-10 04:00:00', '310.00', 'Cancelado', 3, 2);
INSERT INTO `contrato` VALUES (3, '2026-06-01 04:00:00', '2027-06-01 04:00:00', '2026-06-15 04:00:00', '300.00', 'Ativo', 4, 1);
INSERT INTO `contrato` VALUES (4, '2026-06-22 04:00:00', NULL, '2026-07-21 04:00:00', '310.00', 'Ativo', 6, 1);
INSERT INTO `contrato` VALUES (5, '2026-06-22 04:00:00', '2026-06-23 04:00:00', '2026-07-22 04:00:00', '310.00', 'Cancelado', 3, 1);
INSERT INTO `contrato` VALUES (6, '2026-06-22 04:00:00', NULL, '2026-07-22 04:00:00', '310.00', 'Ativo', 3, 1);
INSERT INTO `contrato` VALUES (7, '2026-06-23 04:00:00', '2026-06-23 04:00:00', '2026-07-20 04:00:00', '310.00', 'Cancelado', 7, 1);
INSERT INTO `contrato` VALUES (8, '2026-06-23 04:00:00', NULL, '2026-07-22 04:00:00', '310.00', 'Ativo', 7, 2);
INSERT INTO `contrato` VALUES (9, '2026-06-23 04:00:00', NULL, '2026-07-23 04:00:00', '310.00', 'Ativo', 7, 2);
INSERT INTO `contrato` VALUES (10, '2026-06-23 04:00:00', NULL, '2026-07-23 04:00:00', '260.00', 'Ativo', 10, 3);

DROP TABLE IF EXISTS `curso`;
CREATE TABLE `curso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` text,
  `instrumento` varchar(100) NOT NULL,
  `nivel` enum('Iniciante','Intermediário','Avançado') NOT NULL,
  `carga_horaria` int NOT NULL,
  `duracao_meses` int NOT NULL,
  `modalidade` enum('Individual','Grupo') DEFAULT 'Individual',
  `valor_mensalidade` decimal(10,2) DEFAULT NULL,
  `status_curso` enum('Ativo','Inativo') DEFAULT 'Ativo',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_08e24146a7b59a6031ce2760ff` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `curso` VALUES (1, 'Básico de Violão', 'Curso introdutório de violão acústico', 'Violão', 'Iniciante', 48, 12, 'Individual', NULL, 'Ativo');
INSERT INTO `curso` VALUES (2, 'Teclado Avançado', 'Curso avançado de teclado e piano', 'Teclado', 'Avançado', 48, 6, 'Individual', NULL, 'Ativo');
INSERT INTO `curso` VALUES (3, 'Piano Clássico', '', 'Piano', 'Iniciante', 44, 12, 'Individual', '250.00', 'Ativo');

DROP TABLE IF EXISTS `disponibilidade_professor`;
CREATE TABLE `disponibilidade_professor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dia_semana` enum('Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo') NOT NULL,
  `horario_inicio` time NOT NULL,
  `horario_fim` time NOT NULL,
  `status_disp` enum('Disponível','Indisponível','Bloqueado') NOT NULL DEFAULT 'Disponível',
  `fk_professor_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ae37d8421cbd5b1ec74cfae0594` (`fk_professor_id`),
  CONSTRAINT `FK_ae37d8421cbd5b1ec74cfae0594` FOREIGN KEY (`fk_professor_id`) REFERENCES `pessoa` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `fatura`;
CREATE TABLE `fatura` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data_vencimento` date NOT NULL,
  `data_pagamento` date DEFAULT NULL,
  `valor_devido` decimal(10,2) NOT NULL,
  `desconto_juros` decimal(10,2) NOT NULL DEFAULT '0.00',
  `valor_pago` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status_fatura` enum('Pendente','Paga','Vencida','Cancelada') NOT NULL DEFAULT 'Pendente',
  `forma_pagamento` enum('Pix','Boleto','Cartão de Crédito','Cartão de Débito','Dinheiro','Transferência') DEFAULT NULL,
  `recebedor` varchar(100) DEFAULT NULL,
  `descricao` varchar(255) NOT NULL,
  `fk_contrato_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_cefac6511d4107ce515ddfd8901` (`fk_contrato_id`),
  CONSTRAINT `FK_cefac6511d4107ce515ddfd8901` FOREIGN KEY (`fk_contrato_id`) REFERENCES `contrato` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `fatura` VALUES (1, '2026-05-05 04:00:00', NULL, '300.00', '0.00', '0.00', 'Vencida', NULL, NULL, 'Mensalidade - Referente ao dependente Bia Souza', 1);
INSERT INTO `fatura` VALUES (2, '2026-06-10 04:00:00', '2026-06-08 04:00:00', '310.00', '10.00', '300.00', 'Paga', 'Pix', 'Sistema', 'Mensalidade - Referente ao dependente Pedro Souza', 2);
INSERT INTO `fatura` VALUES (3, '2026-06-25 04:00:00', NULL, '300.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade - Referente ao dependente Ana Souza', 3);
INSERT INTO `fatura` VALUES (4, '2026-07-23 04:00:00', NULL, '310.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Teclado Avançado - Parcela 1/6', 9);
INSERT INTO `fatura` VALUES (5, '2026-08-23 04:00:00', NULL, '310.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Teclado Avançado - Parcela 2/6', 9);
INSERT INTO `fatura` VALUES (6, '2026-09-23 04:00:00', NULL, '310.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Teclado Avançado - Parcela 3/6', 9);
INSERT INTO `fatura` VALUES (7, '2026-10-23 04:00:00', NULL, '310.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Teclado Avançado - Parcela 4/6', 9);
INSERT INTO `fatura` VALUES (8, '2026-11-23 04:00:00', NULL, '310.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Teclado Avançado - Parcela 5/6', 9);
INSERT INTO `fatura` VALUES (9, '2026-12-23 04:00:00', NULL, '310.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Teclado Avançado - Parcela 6/6', 9);
INSERT INTO `fatura` VALUES (10, '2026-07-23 04:00:00', NULL, '260.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Piano Clássico - Parcela 1/12', 10);
INSERT INTO `fatura` VALUES (11, '2026-08-23 04:00:00', NULL, '260.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Piano Clássico - Parcela 2/12', 10);
INSERT INTO `fatura` VALUES (12, '2026-09-23 04:00:00', NULL, '260.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Piano Clássico - Parcela 3/12', 10);
INSERT INTO `fatura` VALUES (13, '2026-10-23 04:00:00', NULL, '260.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Piano Clássico - Parcela 4/12', 10);
INSERT INTO `fatura` VALUES (14, '2026-11-23 04:00:00', NULL, '260.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Piano Clássico - Parcela 5/12', 10);
INSERT INTO `fatura` VALUES (15, '2026-12-23 04:00:00', NULL, '260.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Piano Clássico - Parcela 6/12', 10);
INSERT INTO `fatura` VALUES (16, '2027-01-23 04:00:00', NULL, '260.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Piano Clássico - Parcela 7/12', 10);
INSERT INTO `fatura` VALUES (17, '2027-02-23 04:00:00', NULL, '260.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Piano Clássico - Parcela 8/12', 10);
INSERT INTO `fatura` VALUES (18, '2027-03-23 04:00:00', NULL, '260.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Piano Clássico - Parcela 9/12', 10);
INSERT INTO `fatura` VALUES (19, '2027-04-23 04:00:00', NULL, '260.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Piano Clássico - Parcela 10/12', 10);
INSERT INTO `fatura` VALUES (20, '2027-05-23 04:00:00', NULL, '260.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Piano Clássico - Parcela 11/12', 10);
INSERT INTO `fatura` VALUES (21, '2027-06-23 04:00:00', NULL, '260.00', '0.00', '0.00', 'Pendente', NULL, NULL, 'Mensalidade Curso Piano Clássico - Parcela 12/12', 10);

DROP TABLE IF EXISTS `historico_registro`;
CREATE TABLE `historico_registro` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data_hora` datetime NOT NULL,
  `descricao` text NOT NULL,
  `tipo_registro` enum('Aula Reagendada','Matrícula Renovada','Matrícula Criada','Matrícula Cancelada','Professor Alterado','Fatura Paga','Cadastro Atualizado','Anotação','Outro') NOT NULL,
  `responsavel_registro` varchar(150) NOT NULL,
  `fk_aluno_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_2d4f9c4126a251f3769e19f9939` (`fk_aluno_id`),
  CONSTRAINT `FK_2d4f9c4126a251f3769e19f9939` FOREIGN KEY (`fk_aluno_id`) REFERENCES `pessoa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `historico_registro` VALUES (1, '2026-06-22 12:00:00', 'Aula concluída. Aluno presente.', '', 'Professor José', 2);
INSERT INTO `historico_registro` VALUES (2, '2026-06-21 14:00:00', 'Falta registrada para o aluno.', '', 'Professor José', 2);
INSERT INTO `historico_registro` VALUES (3, '2026-06-22 13:00:00', 'Mensalidade paga via Pix.', '', 'Sistema Financeiro', 3);
INSERT INTO `historico_registro` VALUES (4, '2026-06-22 11:30:00', 'Nova matrícula efetuada.', '', 'Secretaria', 4);

DROP TABLE IF EXISTS `ministra`;
CREATE TABLE `ministra` (
  `fk_turma_id` int NOT NULL,
  `fk_professor_id` int NOT NULL,
  `data_atribuicao` date NOT NULL,
  PRIMARY KEY (`fk_turma_id`,`fk_professor_id`),
  KEY `FK_08caed101e9f073af13e44c02d9` (`fk_professor_id`),
  CONSTRAINT `FK_08caed101e9f073af13e44c02d9` FOREIGN KEY (`fk_professor_id`) REFERENCES `pessoa` (`id`),
  CONSTRAINT `FK_dcaa618a50d9c44181f13d19d1f` FOREIGN KEY (`fk_turma_id`) REFERENCES `turma` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `ministra` VALUES (1, 5, '2026-06-01 04:00:00');
INSERT INTO `ministra` VALUES (2, 5, '2026-06-01 04:00:00');
INSERT INTO `ministra` VALUES (3, 5, '2026-06-01 04:00:00');
INSERT INTO `ministra` VALUES (6, 5, '2026-06-23 04:00:00');
INSERT INTO `ministra` VALUES (7, 5, '2026-06-23 04:00:00');
INSERT INTO `ministra` VALUES (8, 9, '2026-06-23 04:00:00');
INSERT INTO `ministra` VALUES (9, 5, '2026-06-23 04:00:00');

DROP TABLE IF EXISTS `pessoa`;
CREATE TABLE `pessoa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cpf` varchar(11) DEFAULT NULL,
  `rg` varchar(20) DEFAULT NULL,
  `nome` varchar(150) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `is_aluno` tinyint NOT NULL DEFAULT '0',
  `is_professor` tinyint NOT NULL DEFAULT '0',
  `is_responsavel` tinyint NOT NULL DEFAULT '0',
  `is_usuario` tinyint NOT NULL DEFAULT '0',
  `data_matricula` date DEFAULT NULL,
  `status_aluno` enum('Ativo','Inativo','Afastado','Desligado','Cancelado','Suspenso') DEFAULT 'Ativo',
  `data_admissao` date DEFAULT NULL,
  `data_demissao` date DEFAULT NULL,
  `status_prof` enum('Ativo','Inativo','Afastado','Desligado','Cancelado','Suspenso') DEFAULT 'Ativo',
  `especialidade` varchar(100) DEFAULT NULL,
  `valor_hora_aula` decimal(10,2) DEFAULT NULL,
  `parentesco` varchar(50) DEFAULT NULL,
  `fk_id_responsavel` int DEFAULT NULL,
  `pronome` varchar(10) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `logradouro` varchar(150) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` varchar(2) DEFAULT NULL,
  `status_lead` enum('Ativo','Incompleto','Pendente','Arquivado') DEFAULT 'Ativo',
  `origem_cadastro` varchar(100) DEFAULT NULL,
  `observacoes` text,
  `nome_responsavel` varchar(150) DEFAULT NULL,
  `instrumento_interesse` varchar(100) DEFAULT NULL,
  `senha` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_70e82a4695f07a6ce61fc9492b` (`rg`),
  UNIQUE KEY `IDX_ee80cc840596cc1bca8a149bcd` (`cpf`),
  KEY `FK_241a42116339549671bb70dc721` (`fk_id_responsavel`),
  CONSTRAINT `FK_241a42116339549671bb70dc721` FOREIGN KEY (`fk_id_responsavel`) REFERENCES `pessoa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `pessoa` VALUES (1, '11122233344', 'MG1234567', 'Maria da Silva', 'maria@email.com', '11988887777', '1975-03-15 04:00:00', 0, 0, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Ativo', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `pessoa` VALUES (2, '99988877766', 'SP9876543', 'Bia Souza', 'bia@email.com', '11999998888', '1995-12-09 04:00:00', 1, 0, 0, 0, '2024-02-19 04:00:00', 'Ativo', NULL, NULL, NULL, NULL, NULL, 'Filha', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Ativo', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `pessoa` VALUES (3, '55544433322', 'RJ5544332', 'Pedro Souza', 'pedro@email.com', '11977776666', '2010-05-19 04:00:00', 1, 0, 0, 0, '2024-03-01 04:00:00', 'Ativo', NULL, NULL, NULL, NULL, NULL, 'Filho', 1, 'Ele', '76920000', 'Rua Ceará', '540', '', 'Jardim Novo Estado', 'Ouro Preto do Oeste', 'RO', 'Ativo', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `pessoa` VALUES (4, '66677788899', 'MG6677889', 'Ana Souza', 'ana@email.com', '11966665555', '2012-08-10 04:00:00', 1, 0, 0, 0, '2024-04-15 04:00:00', 'Ativo', NULL, NULL, NULL, NULL, NULL, 'Filha', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Ativo', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `pessoa` VALUES (5, '12312312300', 'PR1231231', 'José Notas', 'jose@escola.com', '11955554444', '1980-01-15 04:00:00', 0, 1, 0, 0, NULL, NULL, '2020-01-15 04:00:00', NULL, 'Ativo', 'Violão', '50.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Ativo', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `pessoa` VALUES (6, '12345678954', '12345655', 'Bia Souza', 'lead@exemplo.com', '11999999999', '1989-12-31 04:00:00', 1, 0, 0, 0, '2026-06-22 04:00:00', 'Ativo', NULL, NULL, 'Ativo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Ativo', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `pessoa` VALUES (7, '04717094255', '1510389', 'Martinho Viola', 'violeiromartinho@gmail.com', '69992775254', '2001-07-08 04:00:00', 1, 1, 0, 0, '2026-06-23 04:00:00', 'Ativo', '2026-06-23 04:00:00', NULL, 'Ativo', 'Viola Caipira', '13.00', NULL, NULL, 'Ele', '76920000', 'Rua Ceará', '540', '', 'Jardim Novo Estado', 'Ouro Preto do Oeste', 'RO', 'Ativo', 'Insta', NULL, '', 'Violão', NULL);
INSERT INTO `pessoa` VALUES (9, '11589754522', NULL, 'Ludwig van Beethoven', 'moonlightsonata@gmail.com', '699927752658', '1770-06-23 04:00:04', 0, 1, 0, 0, NULL, 'Ativo', '2026-06-23 04:00:00', NULL, 'Ativo', 'Piano', '50.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Ativo', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `pessoa` VALUES (10, '12547896544', '15103898', 'Emily Pereira', 'emily@gmail.com', '699927756598', '2005-06-22 04:00:00', 1, 0, 0, 0, '2026-06-23 04:00:00', 'Ativo', NULL, NULL, 'Ativo', NULL, NULL, NULL, NULL, 'Ela', '76920000', 'Rua Rio Branco', '1100', '', 'Centro', 'Ouro Preto do Oeste', 'RO', 'Ativo', '', '', '', 'piano', NULL);
INSERT INTO `pessoa` VALUES (11, '00000000000', NULL, 'Administrador do Sistema', 'admin@gmail.com', NULL, NULL, 0, 0, 0, 1, NULL, 'Ativo', NULL, NULL, 'Ativo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Ativo', NULL, NULL, NULL, NULL, '$2b$10$2rmKlsQQU78sYDr7yXEVZuGpVlyJQsHkS4XtfSb/TX.CRAZfstrgi');

DROP TABLE IF EXISTS `sala`;
CREATE TABLE `sala` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `localizacao` varchar(100) NOT NULL,
  `equipamentos` text,
  `capacidade` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_2c4174154c3e8261b363c66cc2` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `sala` VALUES (1, 'Sala 1', 'Bloco A', NULL, 5);
INSERT INTO `sala` VALUES (2, 'Sala 2', 'Bloco B', NULL, 3);

DROP TABLE IF EXISTS `turma`;
CREATE TABLE `turma` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `status_turma` enum('Planejamento','Em Andamento','Concluída','Cancelada','Suspensa') NOT NULL DEFAULT 'Planejamento',
  `dia_semana` enum('Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo') NOT NULL,
  `horario_inicio` time NOT NULL,
  `horario_fim` time NOT NULL,
  `capacidade` int NOT NULL,
  `data_inicio` date NOT NULL,
  `data_fim` date DEFAULT NULL,
  `fk_curso` int NOT NULL,
  `fk_sala` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_3086b1ddf41cc1e24ab9b7480fd` (`fk_curso`),
  KEY `FK_6566fa16c3a0ab20ee95ed9db12` (`fk_sala`),
  CONSTRAINT `FK_3086b1ddf41cc1e24ab9b7480fd` FOREIGN KEY (`fk_curso`) REFERENCES `curso` (`id`),
  CONSTRAINT `FK_6566fa16c3a0ab20ee95ed9db12` FOREIGN KEY (`fk_sala`) REFERENCES `sala` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `turma` VALUES (1, 'Violão Básico - Dom 10h', 'Em Andamento', 'Domingo', '10:00:00', '11:00:00', 5, '2026-06-01 04:00:00', NULL, 1, 1);
INSERT INTO `turma` VALUES (2, 'Teclado Avançado - Dom 11h', 'Em Andamento', 'Domingo', '11:00:00', '12:00:00', 3, '2026-06-01 04:00:00', NULL, 2, 2);
INSERT INTO `turma` VALUES (3, 'Violão Intermediário - Seg 15h', 'Em Andamento', 'Segunda', '15:00:00', '16:00:00', 5, '2026-06-01 04:00:00', NULL, 1, 1);
INSERT INTO `turma` VALUES (6, 'Turma - Alencar Morete', 'Planejamento', 'Segunda', '18:00:00', '19:00:00', 1, '2026-06-23 04:00:00', NULL, 1, 1);
INSERT INTO `turma` VALUES (7, 'Turma - Alencar Morete', 'Planejamento', 'Terça', '18:00:00', '19:00:00', 1, '2026-06-23 04:00:00', NULL, 1, 1);
INSERT INTO `turma` VALUES (8, 'Turma - Emily Pereira', 'Planejamento', 'Terça', '18:00:00', '19:00:00', 1, '2026-06-23 04:00:00', NULL, 3, 1);
INSERT INTO `turma` VALUES (9, 'Turma - Bia Souza', 'Planejamento', 'Terça', '12:00:00', '13:00:00', 1, '2026-06-23 04:00:00', NULL, 1, 1);

SET FOREIGN_KEY_CHECKS = 1;
