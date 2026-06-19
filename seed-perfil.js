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
            (1, 'Violão Básico - Qui 17h', 1, 1, 'Em Andamento', 'Quinta', '17:00', '18:00', 5, '2024-01-15', NULL),
            (2, 'Teclado Avançado - Qua 11h', 2, 2, 'Em Andamento', 'Quarta', '11:00', '12:00', 3, '2024-07-01', NULL);
        `);
        console.log('✓ Turmas inseridas');

        // 7. Ministra (Professor <-> Turma)
        await connection.query(`
            INSERT IGNORE INTO ministra (fk_turma_id, fk_professor_id, data_atribuicao)
            VALUES (1, 1, '2024-01-15'), (2, 1, '2024-07-01');
        `);
        console.log('✓ Ministra inserida');

        // 8. Contratos
        await connection.query(`
            INSERT IGNORE INTO contrato (id, fk_aluno_id, fk_curso_id, data_inicio, data_fim, data_vencimento_parcela, valor_mensal, status_contrato)
            VALUES 
            (1, 1, 1, '2024-01-16', '2025-01-16', '2024-01-16', 300.00, 'Ativo'),
            (2, 1, 2, '2024-07-01', '2025-01-01', '2024-07-16', 310.00, 'Ativo');
        `);
        console.log('✓ Contratos inseridos');

        // 9. Agenda (Aluno <-> Turma)
        await connection.query(`
            INSERT IGNORE INTO agenda (fk_aluno_id, fk_turma_id, frequencia, status_agenda, data_inscricao)
            VALUES (1, 1, 0, 'Matriculado', '2024-01-16'), (1, 2, 0, 'Matriculado', '2024-07-01');
        `);
        console.log('✓ Agenda inserida');

        // 10. Aulas (histórico)
        const aulas = [];
        const datasAulas = [
            '2024-09-19', '2024-09-26', '2024-10-03', '2024-10-10', '2024-10-17',
            '2024-10-24', '2024-10-31', '2024-11-07', '2024-11-14', '2024-11-21', '2024-11-28'
        ];
        const presencas = [
            ['Presente','Presente'],['Presente','Presente'],['Faltou','Faltou'],
            ['Presente','Presente'],['Presente','Presente'],['Presente','Presente'],
            ['Presente','Presente'],['Presente','Presente'],['Faltou','Faltou'],
            ['Presente','Presente'],['Faltou','Faltou']
        ];
        for (let i = 0; i < datasAulas.length; i++) {
            aulas.push(`(${i+1}, 1, 1, '${datasAulas[i]}', ${presencas[i][0]==='Presente'?`'${datasAulas[i]}'`:'NULL'}, '17:00', '18:00', '${presencas[i][0]}', '${presencas[i][1]}', ${presencas[i][0]==='Faltou'?1:0}, '${presencas[i][0]==='Presente'?'Realizada':'Cancelada'}', NULL)`);
        }
        await connection.query(`INSERT IGNORE INTO aula (id, fk_aluno_id, fk_turma_id, data_prevista, data_realizada, horario_inicio, horario_fim, status_presenca_aluno, status_presenca_professor, reagendado, status_aula, observacoes) VALUES ${aulas.join(',')};`);
        console.log('✓ Aulas inseridas');

        // 11. Faturas
        const faturas = [];
        const meses = ['01','02','03','04','05','06','07','08','09','10','11','12'];
        const statusPagos = ['Paga','Paga','Paga','Paga','Paga','Paga','Paga','Paga','Paga','Paga','Vencida','Vencida'];
        const formasPag = ['Boleto','Boleto','Pix','Pix','Pix','Cartão de Crédito','Pix','Pix','Pix','Pix',null,null];
        const datasPag = ['2024-01-16','2024-02-16','2024-03-19','2024-04-17','2024-05-20','2024-06-17','2024-07-11','2024-08-16','2024-09-11','2024-10-21',null,null];
        const valoresDevidos = [200,200,300,300,300,300,10,10,10,10,10,10];
        const descontos = [0,0,6.30,6.10,6.40,6.10,0.49,0.39,0.28,0.22,0.24,0];

        for (let i = 0; i < 12; i++) {
            const dataPag = datasPag[i] ? `'${datasPag[i]}'` : 'NULL';
            const forma = formasPag[i] ? `'${formasPag[i]}'` : 'NULL';
            const receb = datasPag[i] ? (i < 2 ? "'Maria'" : "'Sistema'") : 'NULL';
            const valorPago = datasPag[i] ? (valoresDevidos[i] + descontos[i]) : 0;
            faturas.push(`(${i+1}, 1, '2024-${meses[i]}-16', ${dataPag}, ${valoresDevidos[i]}.00, ${descontos[i]}, ${valorPago}, '${statusPagos[i]}', ${forma}, ${receb}, 'Parcela ${meses[i]}/2024 do curso de Curso Básico de Violão')`);
        }
        await connection.query(`INSERT IGNORE INTO fatura (id, fk_contrato_id, data_vencimento, data_pagamento, valor_devido, desconto_juros, valor_pago, status_fatura, forma_pagamento, recebedor, descricao) VALUES ${faturas.join(',')};`);
        console.log('✓ Faturas inseridas');

        // 12. Histórico e Registros
        const registros = [
            [1, '2024-08-13 16:12:00', 'Aula alterada por Equipe da Escola\nReagendada\nde prof. Júlio Nona para prof. José Notas', 'Professor Alterado', 'Equipe da Escola'],
            [1, '2024-10-10 13:59:00', 'Matrícula renovada por Equipe da Escola\nCurso de Básico de Violão renovado até 19/06/2025.\nProf: José Notas\nNr de Aulas: 35\nPrimeira Aula: 19/09/2024', 'Matrícula Renovada', 'Equipe da Escola'],
            [1, '2024-10-10 14:34:00', 'Aula alterada por Equipe da Escola\nReagendada\nQuinta, 10/10/2024 de 18:00h para 17:00h', 'Aula Reagendada', 'Equipe da Escola'],
            [1, '2024-10-17 14:32:00', 'Aula alterada por Equipe da Escola\nReagendada\nQuinta, 17/10/2024 de 18:00h para 17:00h', 'Aula Reagendada', 'Equipe da Escola'],
            [1, '2024-10-24 15:55:00', 'Aula alterada por Equipe da Escola\nReagendada\nQuinta, 24/10/2024 de 18:00h para 17:00h', 'Aula Reagendada', 'Equipe da Escola'],
            [1, '2024-10-31 17:29:00', 'Aula alterada por Equipe da Escola\nReagendada\nQuinta, 31/10/2024 de 18:00h para 19:00h', 'Aula Reagendada', 'Equipe da Escola'],
            [1, '2024-11-14 14:05:00', 'Aula alterada por Equipe da Escola\nReagendada\nQuinta, 14/11/2024 de 18:00h para 19:00h', 'Aula Reagendada', 'Equipe da Escola'],
            [1, '2024-11-28 16:00:00', 'Aula alterada por Equipe da Escola\nReagendada\nQuinta, 28/11/2024 de 18:00h para 17:00h', 'Aula Reagendada', 'Equipe da Escola'],
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
