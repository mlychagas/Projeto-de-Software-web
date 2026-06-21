const mysql = require('mysql2/promise');

async function seed() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'escola_de_musica',
        multipleStatements: true
    });

    try {
        console.log('=== Seeding Perfil do Aluno data ===');

        // 1. Responsável
        await connection.query(`
            INSERT IGNORE INTO responsavel_aluno (id, cpf, rg, nome, email, telefone, data_nascimento, parentesco)
            VALUES (1, '11122233344', 'MG1234567', 'Maria da Silva', 'maria@email.com', '11988887777', '1975-03-15', 'Mãe');
        `);
        console.log('✓ Responsável inserido');

        // 2. Alunos
        await connection.query(`
            INSERT IGNORE INTO aluno (id, cpf, rg, nome, email, telefone, data_nascimento, data_matricula, status_aluno, fk_id_responsavel)
            VALUES 
            (1, '99988877766', 'SP9876543', 'Bia Souza', 'bia@email.com', '11999998888', '1995-12-09', '2024-02-19', 'Ativo', 1),
            (2, '55544433322', 'RJ5544332', 'Pedro Souza', 'pedro@email.com', '11977776666', '2010-05-20', '2024-03-01', 'Ativo', 1),
            (3, '66677788899', 'MG6677889', 'Ana Souza', 'ana@email.com', '11966665555', '2012-08-10', '2024-04-15', 'Ativo', 1);
        `);
        console.log('✓ Alunos inseridos');

        // 3. Cursos
        await connection.query(`
            INSERT IGNORE INTO curso (id, nome, descricao, instrumento, nivel, carga_horaria, duracao_meses)
            VALUES 
            (1, 'Básico de Violão', 'Curso introdutório de violão acústico', 'Violão', 'Iniciante', 48, 12),
            (2, 'Teclado Avançado', 'Curso avançado de teclado e piano', 'Teclado', 'Avançado', 48, 6);
        `);
        console.log('✓ Cursos inseridos');

        // 4. Salas
        await connection.query(`
            INSERT IGNORE INTO sala (id, nome, capacidade, localizacao)
            VALUES 
            (1, 'Sala 1', 5, 'Bloco A'),
            (2, 'Sala 2', 3, 'Bloco B');
        `);
        console.log('✓ Salas inseridas');

        // 5. Professores
        await connection.query(`
            INSERT IGNORE INTO professor (id, cpf, rg, nome, email, telefone, data_admissao, status_prof, especialidade, valor_hora_aula)
            VALUES 
            (1, '12312312300', 'PR1231231', 'José Notas', 'jose@escola.com', '11955554444', '2020-01-15', 'Ativo', 'Violão', 50.00);
        `);
        console.log('✓ Professor inserido');

        // 6. Turmas
        await connection.query(`
            INSERT IGNORE INTO turma (id, nome, fk_curso, fk_sala, status_turma, dia_semana, horario_inicio, horario_fim, capacidade, data_inicio, data_fim)
            VALUES 
            (1, 'Violão Básico - Dom 10h', 1, 1, 'Em Andamento', 'Domingo', '10:00', '11:00', 5, '2026-06-01', NULL),
            (2, 'Teclado Avançado - Dom 11h', 2, 2, 'Em Andamento', 'Domingo', '11:00', '12:00', 3, '2026-06-01', NULL),
            (3, 'Violão Intermediário - Seg 15h', 1, 1, 'Em Andamento', 'Segunda', '15:00', '16:00', 5, '2026-06-01', NULL);
        `);
        console.log('✓ Turmas inseridas');

        // 7. Ministra (Professor <-> Turma)
        await connection.query(`
            INSERT IGNORE INTO ministra (fk_turma_id, fk_professor_id, data_atribuicao)
            VALUES (1, 1, '2026-06-01'), (2, 1, '2026-06-01'), (3, 1, '2026-06-01');
        `);
        console.log('✓ Ministra inserida');

        // 8. Contratos
        await connection.query(`
            INSERT IGNORE INTO contrato (id, fk_aluno_id, fk_curso_id, data_inicio, data_fim, data_vencimento_parcela, valor_mensal, status_contrato)
            VALUES 
            (1, 1, 1, '2026-06-01', '2027-06-01', '2026-06-05', 300.00, 'Ativo'),
            (2, 2, 2, '2026-06-01', '2027-06-01', '2026-06-10', 310.00, 'Ativo'),
            (3, 3, 1, '2026-06-01', '2027-06-01', '2026-06-15', 300.00, 'Ativo');
        `);
        console.log('✓ Contratos inseridos');

        // 9. Agenda (Aluno <-> Turma)
        await connection.query(`
            INSERT IGNORE INTO agenda (fk_aluno_id, fk_turma_id, frequencia, status_agenda, data_inscricao)
            VALUES 
            (1, 1, 0, 'Matriculado', '2026-06-01'), 
            (2, 2, 0, 'Matriculado', '2026-06-01'),
            (3, 3, 0, 'Matriculado', '2026-06-01');
        `);
        console.log('✓ Agenda inserida');

        // 10. Aulas (histórico e futuras)
        const aulas = [];
        
        // Vamos pegar a data de hoje para gerar as aulas em torno dela
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
        const dia = hoje.getDate().toString().padStart(2, '0');
        const dataHojeStr = `${ano}-${mes}-${dia}`;

        // Aula 1: Hoje, atrasada ou terminando (Faltou/Presente) - Turma 1
        aulas.push(`(1, 1, 1, '${dataHojeStr}', '${dataHojeStr}', '08:00', '09:00', 'Presente', 'Presente', 0, 'Realizada', 'Aula concluída hoje cedo')`);
        
        // Aula 2: Hoje, no horário atual (Em Andamento) - Turma 1
        const horaAtual = hoje.getHours();
        const proxHora = (horaAtual + 1).toString().padStart(2, '0');
        const horaAtualStr = horaAtual.toString().padStart(2, '0');
        aulas.push(`(2, 1, 1, '${dataHojeStr}', NULL, '${horaAtualStr}:00', '${proxHora}:00', 'Pendente', 'Pendente', 0, 'Agendada', 'Aula em andamento')`);
        
        // Aula 3: Hoje, mais tarde (Próxima) - Turma 2
        let horaMaisTarde = (horaAtual + 2) % 24;
        let horaMaisTardeStr = horaMaisTarde.toString().padStart(2, '0');
        let proxHoraMaisTarde = ((horaAtual + 3) % 24).toString().padStart(2, '0');
        if (horaMaisTarde <= horaAtual) { 
           // se virou o dia, ajusta pra ser hoje ainda, se possivel, ou só põe 23:00
           horaMaisTardeStr = '22:00';
           proxHoraMaisTarde = '23:00';
        }
        aulas.push(`(3, 2, 2, '${dataHojeStr}', NULL, '${horaMaisTardeStr}:00', '${proxHoraMaisTarde}:00', 'Pendente', 'Pendente', 0, 'Agendada', 'Próxima aula de hoje')`);

        // Aula 4: Amanhã - Turma 3
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        const amanhaStr = `${amanha.getFullYear()}-${(amanha.getMonth() + 1).toString().padStart(2, '0')}-${amanha.getDate().toString().padStart(2, '0')}`;
        aulas.push(`(4, 3, 3, '${amanhaStr}', NULL, '15:00', '16:00', 'Pendente', 'Pendente', 0, 'Agendada', 'Aula de amanhã')`);

        // Aula 5: Ontem - Turma 1
        const ontem = new Date(hoje);
        ontem.setDate(ontem.getDate() - 1);
        const ontemStr = `${ontem.getFullYear()}-${(ontem.getMonth() + 1).toString().padStart(2, '0')}-${ontem.getDate().toString().padStart(2, '0')}`;
        aulas.push(`(5, 1, 1, '${ontemStr}', '${ontemStr}', '10:00', '11:00', 'Faltou', 'Presente', 0, 'Realizada', 'Aluno faltou ontem')`);

        await connection.query(`INSERT IGNORE INTO aula (id, fk_aluno_id, fk_turma_id, data_prevista, data_realizada, horario_inicio, horario_fim, status_presenca_aluno, status_presenca_professor, reagendado, status_aula, observacoes) VALUES ${aulas.join(',')};`);
        console.log('✓ Aulas inseridas');

        // 11. Faturas
        const faturas = [];
        
        // Fatura vencida no mês passado (Maio/2026)
        faturas.push(`(1, 1, '2026-05-05', NULL, 300.00, 0, 0, 'Vencida', NULL, NULL, 'Parcela 05/2026')`);
        
        // Fatura paga do mês atual (Junho/2026)
        faturas.push(`(2, 2, '2026-06-10', '2026-06-08', 310.00, 10.00, 300.00, 'Paga', 'Pix', 'Sistema', 'Parcela 06/2026')`);
        
        // Fatura pendente do mês atual (Junho/2026)
        faturas.push(`(3, 3, '2026-06-25', NULL, 300.00, 0, 0, 'Pendente', NULL, NULL, 'Parcela 06/2026')`);

        await connection.query(`INSERT IGNORE INTO fatura (id, fk_contrato_id, data_vencimento, data_pagamento, valor_devido, desconto_juros, valor_pago, status_fatura, forma_pagamento, recebedor, descricao) VALUES ${faturas.join(',')};`);
        console.log('✓ Faturas inseridas');

        // 12. Histórico e Registros
        const registros = [
            [1, `${dataHojeStr} 08:00:00`, 'Aula concluída. Aluno presente.', 'Aula Realizada', 'Professor José'],
            [1, `${ontemStr} 10:00:00`, 'Falta registrada para o aluno.', 'Falta', 'Professor José'],
            [2, `${dataHojeStr} 09:00:00`, 'Mensalidade paga via Pix.', 'Pagamento Efetuado', 'Sistema Financeiro'],
            [3, `${dataHojeStr} 07:30:00`, 'Nova matrícula efetuada.', 'Matrícula', 'Secretaria'],
        ];
        const regValues = registros.map((r, i) => {
            const desc = r[2].replace(/'/g, "\\'");
            return `(${i+1}, ${r[0]}, '${r[1]}', '${desc}', '${r[3]}', '${r[4]}')`;
        });
        await connection.query(`INSERT IGNORE INTO historico_registro (id, fk_aluno_id, data_hora, descricao, tipo_registro, responsavel_registro) VALUES ${regValues.join(',')};`);
        console.log('✓ Histórico e Registros inseridos');

        console.log('\n=== Seed completo! ===');
    } catch (error) {
        console.error('Erro no seed:', error);
    } finally {
        await connection.end();
    }
}

seed();
