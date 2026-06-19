import { Controller, Get, Render, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Aluno } from './modules/aluno/aluno.entity';
import { ResponsavelAluno } from './modules/responsavel-aluno/responsavel-aluno.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('inicial')
  getHello(): object {
    // Dados mockados para o Dashboard
    const totalAlunos = 145;
    const aulasHoje = 12;
    const totalCursos = 8;
    const professoresAtivos = 5;

    const proximasAulas = [
      { horario: '14:00', aluno: 'João Silva', instrumento: 'Violão Iniciante', sala: 'Sala 1', status: 'Em andamento' },
      { horario: '15:00', aluno: 'Maria Souza', instrumento: 'Piano Intermediário', sala: 'Sala 3', status: 'Aguardando' },
      { horario: '15:30', aluno: 'Pedro Alves', instrumento: 'Bateria', sala: 'Sala 4', status: 'Aguardando' },
      { horario: '16:00', aluno: 'Ana Beatriz', instrumento: 'Canto', sala: 'Sala 2', status: 'Aguardando' },
    ];

    const graficoPresenca = {
      labels: ['08:00', '10:00', '14:00', '16:00', '18:00', '20:00'],
      hoje: [5, 8, 12, 10, 15, 6],
      ontem: [4, 7, 10, 8, 14, 5]
    };

    return {
      titulo: 'Dashboard - Escola de Música',
      horaAgora: new Date().toLocaleString('pt-BR'),
      totalAlunos,
      aulasHoje,
      totalCursos,
      professoresAtivos,
      proximasAulas,
      graficoPresenca: JSON.stringify(graficoPresenca), // Convert to string for JS rendering in the view
    };
  }

  @Get('/escola')
  @Render('escola')
  async getEscola() {
    // Busca a contagem real no banco de dados para os módulos que já temos implementados
    const totalAlunos = await Aluno.count();
    const totalResponsaveis = await ResponsavelAluno.count();

    return {
      titulo: 'Recursos e Configurações da Escola',
      headerType: 'escola',
      totalAlunos,
      totalResponsaveis,
      // Para os outros módulos não implementados, enviamos contagens mockadas/zeradas
      totalTurmas: 5, // Apenas para preencher visualmente, como na imagem
      totalCursos: 8,
      totalSalas: 6,
      totalProfessores: 7,
      totalInstrumentos: 48,
    };
  }

  @Get('/agenda')
  @Render('agenda')
  async getAgenda(
    @Query('date') dateParam?: string,
    @Query('recurso') recursoParam?: string,
    @Query('filtro') filtroParam?: string
  ) {
    const modoRecurso = recursoParam === 'salas' ? 'salas' : 'professores';
    const modoFiltro = filtroParam === 'todos' ? 'todos' : 'com-aula';
    
    // Retorna a data solicitada ou atual
    let dataAtual = new Date();
    if (dateParam) {
        // Para evitar problemas de fuso, criamos a data a partir da string com timezone UTC ou forçando hora
        const [year, month, day] = dateParam.split('-');
        dataAtual = new Date(Number(year), Number(month) - 1, Number(day));
    }
    
    // Formatação de data em pt-BR usando fallback seguro se o SO não suportar bem
    const diaMesFormatado = dataAtual.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
    const dataFormatada = `${dataAtual.getDate()} DE ${diaMesFormatado}`;
    
    // Array de dias rápidos da semana (Sáb, Dom, Seg...)
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const diaSemanaNome = diasSemana[dataAtual.getDay()];
    
    // Calcula os 3 dias rápidos (Ontem, Hoje, Amanhã em relação à data selecionada)
    const datasRapidas: { dia: string; mes: string; ano: number; fullDate: string }[] = [];
    for(let i=-1; i<=1; i++) {
        let d = new Date(dataAtual);
        d.setDate(d.getDate() + i);
        datasRapidas.push({
            dia: d.getDate().toString().padStart(2, '0'),
            mes: d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', ''),
            ano: d.getFullYear(),
            fullDate: d.toISOString().split('T')[0]
        });
    }

    const determineEventColor = (data: Date, horaAula: number) => {
        const now = new Date();
        const aulaTime = new Date(data);
        aulaTime.setHours(horaAula, 0, 0, 0);
        const diffHours = (aulaTime.getTime() - now.getTime()) / 3600000;
        
        if (diffHours > 1) return 'event-blue';
        if (diffHours > 0 && diffHours <= 1) return 'event-yellow';
        
        // Passado ou em andamento (diffHours <= 0)
        // Simulando a presença
        const presencaAluno = Math.random() > 0.3; // 70% de chance do aluno estar
        const presencaProf = Math.random() > 0.1; // 90% de chance do prof estar
        
        if (presencaAluno && presencaProf) return 'event-green';
        if (!presencaAluno && presencaProf) return 'event-purple'; // Só professor
        return 'event-red'; // Só aluno (ou nenhum)
    };

    const determineBadge = () => {
        const isReagendado = Math.random() > 0.85; // 15% de chance de ser reagendado
        if (isReagendado) return 'R';
        
        const aulasRestantes = Math.floor(Math.random() * 12); // Pacote fictício de até 11 aulas restantes
        if (aulasRestantes <= 4 && aulasRestantes > 0) {
            return aulasRestantes.toString();
        }
        return null;
    };
    
    const recursos: any[] = [];
    
    if (modoRecurso === 'professores') {
        const nomes = ['Izadora', 'José', 'Leonardo', 'Matheus', 'Camila', 'Rodrigo', 'Felipe', 'Mariana', 'Aline', 'Pedro', 'Beatriz', 'Carlos', 'Eduarda', 'Bruno', 'Juliana'];
        const sobrenomes = ['Sustenido', 'Notas', 'Sétima', 'Bemol', 'Clave', 'Acorde', 'Pauta', 'Compasso', 'Sinfonia', 'Harmonia', 'Ritmo', 'Melodia', 'BPM', 'Tempo', 'Arpejo'];
        
        for (let i = 0; i < 15; i++) {
            const inicioTurno = 8 + Math.floor(Math.random() * 4);
            const fimTurno = 18 + Math.floor(Math.random() * 5);
            
            const prof = {
                id: i + 1,
                nome: nomes[i],
                subtitulo: sobrenomes[i],
                inicioTurno,
                fimTurno,
                aulas: [] as any[]
            };
            
            // 50% de chance de não ter nenhuma aula para o filtro ficar óbvio
            const hasAulas = Math.random() > 0.5;
            const numAulas = hasAulas ? 1 + Math.floor(Math.random() * 4) : 0;
            let lastHour = prof.inicioTurno;
            for (let j = 0; j < numAulas; j++) {
                if (lastHour >= prof.fimTurno) break;
                const horaAula = lastHour + Math.floor(Math.random() * 3);
                if (horaAula >= prof.fimTurno) break;
                
                prof.aulas.push({
                    hora: horaAula,
                    tituloCard: `Aluno ${Math.floor(Math.random() * 1000)}`,
                    subtituloCard: `Sala ${1 + Math.floor(Math.random() * 5)}`,
                    cor: determineEventColor(dataAtual, horaAula),
                    badge: determineBadge()
                });
                lastHour = horaAula + 1;
            }
            recursos.push(prof);
        }
    } else {
        // Modo Salas
        const profsList = ['Izadora', 'José', 'Leonardo', 'Camila', 'Rodrigo', 'Felipe', 'Aline'];
        for (let i = 1; i <= 10; i++) {
            const inicioTurno = 8 + Math.floor(Math.random() * 2);
            const fimTurno = 20 + Math.floor(Math.random() * 4);
            
            const sala = {
                id: i,
                nome: `Sala ${i}`,
                subtitulo: `Capacidade ${Math.floor(Math.random() * 10) + 10}`,
                inicioTurno,
                fimTurno,
                aulas: [] as any[]
            };
            
            // 50% de chance de não ter nenhuma aula para o filtro ficar óbvio
            const hasAulas = Math.random() > 0.5;
            const numAulas = hasAulas ? 1 + Math.floor(Math.random() * 5) : 0;
            let lastHour = sala.inicioTurno;
            for (let j = 0; j < numAulas; j++) {
                if (lastHour >= sala.fimTurno) break;
                const horaAula = lastHour + Math.floor(Math.random() * 3);
                if (horaAula >= sala.fimTurno) break;
                
                sala.aulas.push({
                    hora: horaAula,
                    tituloCard: `Aluno ${Math.floor(Math.random() * 1000)}`,
                    subtituloCard: profsList[Math.floor(Math.random() * profsList.length)],
                    cor: determineEventColor(dataAtual, horaAula),
                    badge: determineBadge()
                });
                lastHour = horaAula + 1;
            }
            recursos.push(sala);
        }
    }

    // Aplica o filtro de "Com aula"
    let recursosFiltrados = recursos;
    if (modoFiltro === 'com-aula') {
        recursosFiltrados = recursos.filter(r => r.aulas && r.aulas.length > 0);
    }

    return {
      titulo: 'Agenda - Sistema de Gestão',
      headerType: 'agenda',
      dataAtualCompleta: `${dataFormatada} ${diaSemanaNome}`, 
      datasRapidas,
      // String formatada manualmente ou pelo toISOString (ajustado ao fuso)
      dataInput: `${dataAtual.getFullYear()}-${(dataAtual.getMonth()+1).toString().padStart(2,'0')}-${dataAtual.getDate().toString().padStart(2,'0')}`,
      recursos: recursosFiltrados, 
      modoRecurso,
      modoFiltro
    };
  }
}
