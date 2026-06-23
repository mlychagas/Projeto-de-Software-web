document.addEventListener('DOMContentLoaded', () => {
    gerarGradeAgendamentoVazia();
});

function gerarGradeAgendamentoVazia() {
    const timelineBody = document.getElementById('gradeAgendamentoAgenda');
    if (!timelineBody) return;
    timelineBody.innerHTML = '';

    const dias = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const inicio = 8;
    const fim = 22; // 8 to 22 means 15 slots
    const totalSlots = fim - inicio + 1; // 15

    dias.forEach((dia, index) => {
        const row = document.createElement('div');
        row.className = "timeline-row";
        row.style.display = "flex";
        row.style.borderBottom = "1px solid #e0e4e8";
        row.style.minHeight = "65px";
        // Alternating row background for better readability
        row.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#fbfbfc";

        // Label do Dia (Revertido para o padrão limpo)
        const resource = document.createElement('div');
        resource.className = "timeline-resource";
        resource.style.width = "180px";
        resource.style.flexShrink = "0";
        resource.style.padding = "10px";
        resource.style.borderRight = "1px solid #ddd";
        resource.style.display = "flex";
        resource.style.alignItems = "center";
        resource.innerHTML = `<strong>${dia}</strong>`;
        row.appendChild(resource);

        // Grid do Dia
        const grid = document.createElement('div');
        grid.className = "timeline-grid";
        grid.style.display = "flex";
        grid.style.flexGrow = "1";
        grid.style.position = "relative";
        
        for (let h = inicio; h <= fim; h++) {
            const cell = document.createElement('div');
            cell.className = "timeline-grid-cell";
            cell.style.flex = "1";
            cell.style.borderRight = "1px dashed #eee";
            cell.style.backgroundColor = "#f4f6f8"; // Cinza claro institucional como fundo
            cell.style.cursor = "pointer";
            cell.style.transition = "background-color 0.2s";
            
            cell.onmouseover = () => cell.style.backgroundColor = "#e2e6ea";
            cell.onmouseout = () => cell.style.backgroundColor = "#f4f6f8";

            const horaStr = String(h).padStart(2, '0') + ':00';
            cell.onclick = () => abrirModalAgendamento(dia, horaStr, grid, h);

            grid.appendChild(cell);
        }

        row.appendChild(grid);
        timelineBody.appendChild(row);
    });
}

let slotSelecionado = null; // Guardará: { grid, dia, hora, numHora }
let agendamentoFinal = null;

async function filtrarGrade() {
    const profSelect = document.getElementById('filtroProfessor');
    const profId = profSelect.value;
    
    if (!profId) {
        Swal.fire('Atenção', 'Selecione um professor para ver a agenda.', 'warning');
        return;
    }

    // Refresh grid
    gerarGradeAgendamentoVazia();
    
    const timelineBody = document.getElementById('gradeAgendamentoAgenda');
    if (!timelineBody) return;

    try {
        const response = await fetch(`/matricula/api/agenda-professor/${profId}`);
        const turmas = await response.json();

        turmas.forEach(turma => {
            let diaDB = turma.diaSemana;
            if (!diaDB.includes('-feira') && diaDB !== 'Sábado' && diaDB !== 'Domingo') {
                diaDB += '-feira';
            }
            if (diaDB === 'Sábado') diaDB = 'Sábado'; // keep

            const rows = timelineBody.querySelectorAll('.timeline-row');
            let targetGrid = null;
            rows.forEach(row => {
                const resText = row.querySelector('.timeline-resource strong').textContent;
                if (resText === diaDB) {
                    targetGrid = row.querySelector('.timeline-grid');
                }
            });

            if (targetGrid && turma.horarioInicio) {
                const horaStart = parseInt(turma.horarioInicio.split(':')[0], 10);
                const sub = `Sala: ${turma.sala} | Alunos: ${turma.alunosMatriculados}/${turma.capacidade}`;
                
                let classes = 'bg-danger text-white opacity-75';
                if (turma.alunosMatriculados < turma.capacidade) {
                    classes = 'bg-warning text-dark'; // Tem vaga
                }

                adicionarEventoAoGrid(targetGrid, horaStart, turma.nome, sub, classes, true);
            }
        });

        Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            icon: 'success',
            title: 'Grade atualizada com sucesso!'
        });
    } catch (e) {
        console.error('Erro ao buscar agenda do professor:', e);
        Swal.fire('Erro', 'Não foi possível buscar a agenda do professor.', 'error');
    }
}

function abrirModalAgendamento(dia, hora, gridElement, numHora) {
    const profSelect = document.getElementById('filtroProfessor');
    if (!profSelect.value) {
        Swal.fire('Atenção', 'Selecione o Professor no topo antes de escolher o horário.', 'info');
        return;
    }
    
    slotSelecionado = { grid: gridElement, dia, hora, numHora };
    const nomeProf = profSelect.options[profSelect.selectedIndex].text;
    
    document.getElementById('modalProf').textContent = nomeProf;
    document.getElementById('modalDia').textContent = dia;
    document.getElementById('modalHora').textContent = hora;
    
    $('#modalAdicionarAula').modal('show');
}

function confirmarAula() {
    if (!slotSelecionado) return;

    const profNome = document.getElementById('modalProf').textContent;
    const sala = document.getElementById('modalSala').value;
    
    const pessoaCard = document.querySelector('[data-pessoa-id]');
    const alunoNome = pessoaCard ? pessoaCard.querySelector('h5').textContent : "Novo Aluno";

    const subtitulo = `${sala} - ${alunoNome}`;
    
    adicionarEventoAoGrid(slotSelecionado.grid, slotSelecionado.numHora, profNome, subtitulo, 'bg-primary text-white', false);

    agendamentoFinal = {
        dia: slotSelecionado.dia,
        hora: slotSelecionado.hora,
        sala: sala
    };

    $('#modalAdicionarAula').modal('hide');
    
    Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        icon: 'success',
        title: 'Horário reservado com sucesso!'
    });
}

function adicionarEventoAoGrid(grid, startHour, titulo, subtitulo, classes, isBlocked) {
    const totalHours = 15;
    const index = startHour - 8;
    
    const percentLeft = (index / totalHours) * 100;
    const percentWidth = (1 / totalHours) * 100;

    const eventDiv = document.createElement('div');
    eventDiv.className = `timeline-event p-1 rounded ${classes}`;
    eventDiv.style.position = "absolute";
    eventDiv.style.top = "5px";
    eventDiv.style.bottom = "5px";
    eventDiv.style.left = `calc(${percentLeft}% + 2px)`;
    eventDiv.style.width = `calc(${percentWidth}% - 4px)`;
    eventDiv.style.overflow = "hidden";
    eventDiv.style.fontSize = "11px";
    eventDiv.style.display = "flex";
    eventDiv.style.flexDirection = "column";
    eventDiv.style.justifyContent = "center";
    eventDiv.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
    eventDiv.style.zIndex = "10";

    if (!isBlocked) {
        eventDiv.innerHTML = `
            <strong style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${titulo}</strong>
            <small style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${subtitulo}</small>
            <i class="fa fa-times" style="position: absolute; top: 2px; right: 2px; cursor: pointer; color: #fff;" onclick="this.parentElement.remove()"></i>
        `;
    } else {
        eventDiv.style.opacity = "0.6";
        eventDiv.innerHTML = `
            <strong style="text-align: center; width: 100%;">${titulo}</strong>
        `;
    }

    grid.appendChild(eventDiv);
}

function avancarParaFinanceiro() {
    const profSelect = document.getElementById('filtroProfessor');
    const cursoSelect = document.getElementById('filtroCurso');
    
    const profId = profSelect ? profSelect.value : '';
    const cursoId = cursoSelect ? cursoSelect.value : '';
    
    const pessoaCard = document.querySelector('[data-pessoa-id]');
    const pessoaId = pessoaCard ? pessoaCard.getAttribute('data-pessoa-id') : '';
    
    const params = new URLSearchParams(window.location.search);
    if(profId) params.set('prof', profId);
    if(cursoId) params.set('curso', cursoId);
    if(pessoaId) params.set('pessoa', pessoaId);
    if(agendamentoFinal) {
        params.set('dia', agendamentoFinal.dia);
        params.set('hora', agendamentoFinal.hora);
        params.set('sala', agendamentoFinal.sala);
    }
    
    window.location.href = `/matricula/nova?${params.toString()}`;
}
