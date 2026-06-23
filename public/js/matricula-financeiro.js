document.addEventListener('DOMContentLoaded', () => {
    const triggerIds = ['nrMensalidades', 'diaVencimento', 'valorMensalidade', 'primeiraParcela'];
    triggerIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', calcularTotais);
    });
    
    // Calcular ao carregar a tela
    calcularTotais();

    // Preencher dados vindos da tela de agendamento (via QueryString)
    const urlParams = new URLSearchParams(window.location.search);
    const profId = urlParams.get('prof');
    const cursoId = urlParams.get('curso');
    const alunoId = urlParams.get('aluno');

    if (alunoId) {
        const alunoNomeEl = document.getElementById('alunoNome');
        if (alunoNomeEl) alunoNomeEl.value = "João da Silva"; // Mock para o nome baseado no ID
    }

    if (cursoId) {
        const cursoSelect = document.getElementById('cursoSelect');
        if (cursoSelect) cursoSelect.value = cursoId;
    }

    if (profId) {
        // O card do professor é apenas HTML no template atual, então vamos injetar os dados
        const divProf = document.getElementById('profCardDetails');
        if (divProf) {
            divProf.innerHTML = `
                <strong>Prof. João Mixolídio</strong><br>
                <small class="text-muted">Agendado (Sala 1)</small>
            `;
        }
    }
});

function converterParaFloat(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/\./g, '').replace(',', '.'));
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcularTotais() {
    const valorCursoBaseExistenteEl = document.getElementById('valorCursoBaseExistente');
    const valorCursoBase = valorCursoBaseExistenteEl && valorCursoBaseExistenteEl.value ? parseFloat(valorCursoBaseExistenteEl.value) : 310.00;
    const desconto = converterParaFloat(document.getElementById('desconto').value);
    const taxaMatricula = converterParaFloat(document.getElementById('taxaMatricula').value);
    const nrMensalidades = parseInt(document.getElementById('nrMensalidades').value) || 1;

    // Calcular nova mensalidade com desconto
    const valorMensalidade = valorCursoBase - desconto;
    document.getElementById('valorMensalidade').textContent = formatarMoeda(valorMensalidade);

    // Calcular total a pagar (Mensalidade * num_meses)
    // De acordo com a captura, o Total a Pagar baseia-se na multiplicação das parcelas. 
    // Ex: 310 * 6 = 1860. A taxa de matrícula fica separada, mas pode compor se necessário.
    const totalPagar = valorMensalidade * nrMensalidades;
    document.getElementById('totalPagar').textContent = formatarMoeda(totalPagar);

    // Avisa a grade de aulas que a mensalidade mudou para atualizar as parcelas no calendário
    if (typeof gerarGradeAulas === 'function') {
        gerarGradeAulas();
    }
}

function iniciarFluxoFazerMatricula() {
    const alunoNome = document.getElementById('alunoNome').value;
    const cursoSelect = document.getElementById('cursoSelect').value;
    const primeiraAula = document.getElementById('primeiraAulaInput').value;
    const nrAulas = document.getElementById('nrAulasInput').value;
    const diaVencimento = document.getElementById('diaVencimento').value;
    const primeiraParcela = document.getElementById('primeiraParcela').value;

    if (!alunoNome || !cursoSelect || !primeiraAula || !nrAulas || !diaVencimento || !primeiraParcela) {
        Swal.fire({
            title: 'Campos Obrigatórios',
            text: 'Por favor, preencha Aluno, Curso, Datas de Aula, Primeira Parcela e Vencimento antes de prosseguir.',
            icon: 'warning',
            confirmButtonColor: '#7b61ff'
        });
        return;
    }

    // Coletar dados da URL (origem do agendamento)
    const urlParams = new URLSearchParams(window.location.search);
    const turmaId = urlParams.get('turma');
    const profId = urlParams.get('prof');
    const dia = urlParams.get('dia');
    const hora = urlParams.get('hora');
    const sala = urlParams.get('sala');
    
    const alunoId = document.getElementById('alunoNome').getAttribute('data-pessoa-id');
    const valorMensalidadeElement = document.getElementById('valorMensalidade');
    const valorLiquido = valorMensalidadeElement ? converterParaFloat(valorMensalidadeElement.textContent) : 0;
    
    // Preparar payload para o backend
    const payload = {
        aluno: {
            id: alunoId ? parseInt(alunoId) : null,
            nome: alunoNome,
            cpf: '123456789' + Math.floor(Math.random() * 99), // Mock para evitar conflito Unique
            rg: '123456' + Math.floor(Math.random() * 99),
            email: 'lead@exemplo.com',
            telefone: '11999999999',
            dataNascimento: '1990-01-01'
        },
        financeiro: {
            cursoId: cursoSelect,
            valorLiquido: valorLiquido,
            diaVencimento: diaVencimento
        },
        agendamento: {
            turmaId: turmaId ? parseInt(turmaId) : null,
            profId: profId ? parseInt(profId) : null,
            dia: dia,
            hora: hora,
            sala: sala
        }
    };

    Swal.fire({
        title: 'Processando...',
        text: 'Aguarde enquanto preparamos o seu cadastro.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    fetch('/matricula/api/salvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            window.location.href = '/matricula/cadastro?aluno=' + data.alunoId;
        } else {
            Swal.fire('Erro', data.message, 'error');
        }
    })
    .catch(err => {
        Swal.fire('Erro', 'Não foi possível comunicar com o servidor.', 'error');
    });
}

function iniciarFluxoAlterarMatricula() {
    const alunoNome = document.getElementById('alunoNome').value;
    const cursoSelect = document.getElementById('cursoSelect').value;
    const primeiraAula = document.getElementById('primeiraAulaInput').value;
    const nrAulas = document.getElementById('nrAulasInput').value;
    const diaVencimento = document.getElementById('diaVencimento').value;

    if (!alunoNome || !cursoSelect || !primeiraAula || !nrAulas || !diaVencimento) {
        Swal.fire({
            title: 'Campos Obrigatórios',
            text: 'Por favor, preencha todos os campos antes de prosseguir.',
            icon: 'warning',
            confirmButtonColor: '#7b61ff'
        });
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const turmaId = urlParams.get('turma');
    const profId = urlParams.get('prof');
    const dia = urlParams.get('dia');
    const hora = urlParams.get('hora');
    const sala = urlParams.get('sala');
    
    const alunoId = document.getElementById('alunoNome').getAttribute('data-pessoa-id');
    const valorMensalidadeElement = document.getElementById('valorMensalidade');
    const valorLiquido = valorMensalidadeElement ? converterParaFloat(valorMensalidadeElement.textContent) : 0;
    const turmaAntigaId = document.getElementById('turmaAntigaId').value;
    
    const payload = {
        aluno: { id: parseInt(alunoId) },
        financeiro: {
            cursoId: cursoSelect,
            valorLiquido: valorLiquido,
            diaVencimento: diaVencimento
        },
        agendamento: {
            turmaId: turmaId ? parseInt(turmaId) : null,
            profId: profId ? parseInt(profId) : null,
            dia: dia,
            hora: hora,
            sala: sala,
            turmaAntigaId: parseInt(turmaAntigaId)
        }
    };

    Swal.fire({
        title: 'Salvando...',
        text: 'Aguarde enquanto atualizamos o seu cadastro.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    fetch('/matricula/api/alterar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            Swal.fire({
                title: 'Tudo Certo! ✅',
                text: 'Matrícula atualizada com sucesso.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = `/pessoas/${data.alunoId}/perfil?tab=cursos`;
            });
        } else {
            Swal.fire('Erro', data.message, 'error');
        }
    })
    .catch(err => Swal.fire('Erro', 'Falha na comunicação com o servidor.', 'error'));
}
