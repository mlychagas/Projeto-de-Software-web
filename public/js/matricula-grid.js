document.addEventListener('DOMContentLoaded', () => {
    // Generate the grid initially
    gerarGradeAulas();

    // Re-generate if relevant fields change
    const triggerIds = ['primeiraAulaInput', 'nrAulasInput', 'nrMensalidades', 'diaVencimento', 'primeiraParcela', 'valorMensalidade'];
    triggerIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', gerarGradeAulas);
    });

    // We also need a mutation observer or interceptor if valorMensalidade changes via JS,
    // but the easiest way is to let the financeiro JS call gerarGradeAulas after recalculation.
});

function gerarGradeAulas() {
    const primeiraAulaStr = document.getElementById('primeiraAulaInput')?.value;
    const nrAulas = parseInt(document.getElementById('nrAulasInput')?.value) || 0;
    const tbody = document.getElementById('gridAulasBody');
    const ultimaAulaInput = document.getElementById('ultimaAulaInput');
    
    if (!primeiraAulaStr || nrAulas <= 0) {
        if (tbody) tbody.innerHTML = '';
        if (ultimaAulaInput) ultimaAulaInput.value = '';
        return;
    }

    // Get financeiro data
    const nrMensalidades = parseInt(document.getElementById('nrMensalidades')?.value) || 0;
    const primeiraParcelaStr = document.getElementById('primeiraParcela')?.value;
    const diaVencimento = parseInt(document.getElementById('diaVencimento')?.value) || 10;
    const valorMensalidadeStr = document.getElementById('valorMensalidade')?.textContent || "0,00";

    // Generate parcelas array
    const parcelas = [];
    if (nrMensalidades > 0 && primeiraParcelaStr) {
        let currentParcelaDate = new Date(primeiraParcelaStr + 'T12:00:00Z');
        parcelas.push(new Date(currentParcelaDate));

        for (let i = 1; i < nrMensalidades; i++) {
            let nextMonthDate = new Date(currentParcelaDate);
            nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
            
            // Adjust day to diaVencimento
            nextMonthDate.setDate(diaVencimento);
            
            parcelas.push(new Date(nextMonthDate));
            currentParcelaDate = nextMonthDate;
        }
    }

    let currentDate = new Date(primeiraAulaStr + 'T12:00:00Z'); // Evitar timezone issues
    const meses = {};
    let lastDate = null;

    // Map month string to an object that holds classes and possibly a parcela
    for (let i = 0; i < nrAulas; i++) {
        const monthKey = currentDate.toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
        if (!meses[monthKey]) {
            meses[monthKey] = { aulas: [], parcela: null };
        }
        meses[monthKey].aulas.push(new Date(currentDate));
        lastDate = new Date(currentDate);

        // Pula 7 dias (Turma semanal)
        currentDate.setDate(currentDate.getDate() + 7);
    }
    
    if (ultimaAulaInput && lastDate) {
        ultimaAulaInput.value = lastDate.toISOString().split('T')[0];
    }

    // Assign parcelas to the months they belong to, or append if they exceed the class months
    let monthKeys = Object.keys(meses);
    parcelas.forEach((p, idx) => {
        const monthKey = p.toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
        if (!meses[monthKey]) {
            meses[monthKey] = { aulas: [], parcela: null };
            monthKeys.push(monthKey);
        }
        meses[monthKey].parcela = p;
    });

    if (tbody) tbody.innerHTML = '';

    const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // We must iterate over keys in chronological order. Since we pushed them chronologically:
    monthKeys.forEach((monthName) => {
        const data = meses[monthName];
        const tr = document.createElement('tr');
        
        // Mês (ex: Nov 2024)
        const tdMonth = document.createElement('td');
        tdMonth.className = "align-middle font-weight-bold";
        tdMonth.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1).replace('. de ', ' ');
        tr.appendChild(tdMonth);

        // Aulas
        const tdAulas = document.createElement('td');
        tdAulas.colSpan = 5;
        tdAulas.style.textAlign = 'left';
        
        data.aulas.forEach(d => {
            const dayStr = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth()+1).padStart(2, '0');
            const diaSem = diasDaSemana[d.getDay()];
            
            const badge = document.createElement('span');
            badge.className = "badge badge-primary p-2 mr-2 mb-1";
            badge.style.backgroundColor = "#d8e1fa";
            badge.style.color = "#4a6cd4";
            badge.style.border = "1px solid #b0c4f8";
            badge.style.fontWeight = "normal";
            
            badge.innerHTML = `${diaSem} ${dayStr}`;
            tdAulas.appendChild(badge);
        });
        tr.appendChild(tdAulas);

        // Parcela do mês
        const tdParcela = document.createElement('td');
        tdParcela.className = "align-middle";
        if (data.parcela) {
            const pDay = String(data.parcela.getDate()).padStart(2, '0');
            const pMon = String(data.parcela.getMonth()+1).padStart(2, '0');
            const pYear = data.parcela.getFullYear();
            tdParcela.innerHTML = `<div style="background-color: #e4e7ea; padding: 4px 10px; border-radius: 4px; border: 1px solid #d0d4d8;">${pDay}/${pMon}/${pYear} R$ ${valorMensalidadeStr}</div>`;
        } else {
            tdParcela.innerHTML = `<span class="text-muted" style="font-size: 12px;">-</span>`;
        }
        tr.appendChild(tdParcela);

        tbody.appendChild(tr);
    });
}
