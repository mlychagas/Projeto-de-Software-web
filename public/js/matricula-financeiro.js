document.addEventListener('DOMContentLoaded', () => {
    const inputs = ['desconto', 'nrMensalidades', 'taxaMatricula'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', calcularTotais);
    });

    calcularTotais();
});

function converterParaFloat(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/\./g, '').replace(',', '.'));
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcularTotais() {
    const valorCursoBase = 310.00;
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

    // Alerta intermediário sobre cadastro do responsável (Caso não possua)
    Swal.fire({
        title: 'Verificação de Responsável',
        text: `O Aluno "${alunoNome}" não possui um responsável financeiro vinculado ou é necessário confirmar os dados.`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#7b61ff',
        cancelButtonColor: '#d33',
        confirmButtonText: '<i class="fa fa-search"></i> Buscar Cadastrado',
        cancelButtonText: '<i class="fa fa-user-plus"></i> Novo Responsável'
    }).then((result) => {
        // Redireciona para o Stepper de Cadastro, simulando a escolha do usuário
        window.location.href = '/matricula/cadastro';
    });
}
