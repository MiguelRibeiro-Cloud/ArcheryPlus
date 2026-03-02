// ============================================================
// FPTA ArcheryPlus - Internationalization (i18n)
// ============================================================

const TRANSLATIONS = {
    // Navigation
    'nav.dashboard': { pt: 'Painel', en: 'Dashboard' },
    'nav.athletes': { pt: 'Atletas', en: 'Athletes' },
    'nav.tournaments': { pt: 'Torneios', en: 'Tournaments' },
    'nav.standings': { pt: 'Classificações', en: 'Standings' },
    'nav.payments': { pt: 'Pagamentos', en: 'Payments' },
    'nav.calendar': { pt: 'Calendário', en: 'Calendar' },
    'nav.reports': { pt: 'Relatórios', en: 'Reports' },
    'nav.settings': { pt: 'Definições', en: 'Settings' },
    'nav.main': { pt: 'Principal', en: 'Main' },
    'nav.management': { pt: 'Gestão', en: 'Management' },
    'nav.tools': { pt: 'Ferramentas', en: 'Tools' },

    // Header
    'header.search': { pt: 'Pesquisar atletas, torneios...', en: 'Search athletes, tournaments...' },
    'header.notifications': { pt: 'Notificações', en: 'Notifications' },
    'header.admin': { pt: 'Administrador', en: 'Administrator' },

    // Dashboard
    'dashboard.title': { pt: 'Painel de Controlo', en: 'Dashboard' },
    'dashboard.welcome': { pt: 'Bem-vindo ao ArcheryPlus', en: 'Welcome to ArcheryPlus' },
    'dashboard.totalAthletes': { pt: 'Total de Atletas', en: 'Total Athletes' },
    'dashboard.activeTournaments': { pt: 'Torneios Ativos', en: 'Active Tournaments' },
    'dashboard.upcomingEvents': { pt: 'Próximos Eventos', en: 'Upcoming Events' },
    'dashboard.revenue': { pt: 'Receita Cobrada', en: 'Revenue Collected' },
    'dashboard.recentActivity': { pt: 'Atividade Recente', en: 'Recent Activity' },
    'dashboard.athletesByDiscipline': { pt: 'Atletas por Disciplina', en: 'Athletes by Discipline' },
    'dashboard.athletesByAge': { pt: 'Atletas por Categoria', en: 'Athletes by Category' },
    'dashboard.paymentOverview': { pt: 'Resumo de Pagamentos', en: 'Payment Overview' },
    'dashboard.quickActions': { pt: 'Ações Rápidas', en: 'Quick Actions' },
    'dashboard.upcomingTournaments': { pt: 'Próximos Torneios', en: 'Upcoming Tournaments' },
    'dashboard.newAthlete': { pt: 'Novo Atleta', en: 'New Athlete' },
    'dashboard.registerAthlete': { pt: 'Registar atleta', en: 'Register athlete' },
    'dashboard.newTournament': { pt: 'Novo Torneio', en: 'New Tournament' },
    'dashboard.createTournament': { pt: 'Criar torneio', en: 'Create tournament' },
    'dashboard.viewStandings': { pt: 'Classificações', en: 'Standings' },
    'dashboard.viewLeague': { pt: 'Ver liga', en: 'View league' },
    'dashboard.managePayments': { pt: 'Pagamentos', en: 'Payments' },
    'dashboard.manageFees': { pt: 'Gerir quotas', en: 'Manage fees' },
    'dashboard.pendingPayments': { pt: 'Pagamentos Pendentes', en: 'Pending Payments' },
    'dashboard.overduePayments': { pt: 'Pagamentos em Atraso', en: 'Overdue Payments' },
    'dashboard.paidPayments': { pt: 'Pagamentos Realizados', en: 'Paid Payments' },

    // Athletes
    'athletes.title': { pt: 'Gestão de Atletas', en: 'Athlete Management' },
    'athletes.addNew': { pt: 'Novo Atleta', en: 'New Athlete' },
    'athletes.search': { pt: 'Pesquisar por nome, clube...', en: 'Search by name, club...' },
    'athletes.filterDiscipline': { pt: 'Filtrar por disciplina', en: 'Filter by discipline' },
    'athletes.filterAge': { pt: 'Filtrar por categoria', en: 'Filter by category' },
    'athletes.filterClub': { pt: 'Filtrar por clube', en: 'Filter by club' },
    'athletes.filterStatus': { pt: 'Filtrar por estado', en: 'Filter by status' },
    'athletes.all': { pt: 'Todos', en: 'All' },
    'athletes.name': { pt: 'Nome', en: 'Name' },
    'athletes.club': { pt: 'Clube', en: 'Club' },
    'athletes.discipline': { pt: 'Disciplina', en: 'Discipline' },
    'athletes.category': { pt: 'Categoria', en: 'Category' },
    'athletes.license': { pt: 'Licença', en: 'License' },
    'athletes.status': { pt: 'Estado', en: 'Status' },
    'athletes.actions': { pt: 'Ações', en: 'Actions' },
    'athletes.active': { pt: 'Ativo', en: 'Active' },
    'athletes.inactive': { pt: 'Inativo', en: 'Inactive' },
    'athletes.expired': { pt: 'Expirado', en: 'Expired' },
    'athletes.total': { pt: 'Total de atletas', en: 'Total athletes' },
    'athletes.showing': { pt: 'A mostrar', en: 'Showing' },
    'athletes.of': { pt: 'de', en: 'of' },
    'athletes.export': { pt: 'Exportar', en: 'Export' },

    // Athlete Form
    'form.personalData': { pt: 'Dados Pessoais', en: 'Personal Data' },
    'form.firstName': { pt: 'Nome', en: 'First Name' },
    'form.lastName': { pt: 'Apelido', en: 'Last Name' },
    'form.birthDate': { pt: 'Data de Nascimento', en: 'Date of Birth' },
    'form.gender': { pt: 'Género', en: 'Gender' },
    'form.male': { pt: 'Masculino', en: 'Male' },
    'form.female': { pt: 'Feminino', en: 'Female' },
    'form.email': { pt: 'Email', en: 'Email' },
    'form.phone': { pt: 'Telefone', en: 'Phone' },
    'form.nif': { pt: 'NIF', en: 'Tax ID (NIF)' },
    'form.address': { pt: 'Morada', en: 'Address' },
    'form.emergencyContact': { pt: 'Contacto de Emergência', en: 'Emergency Contact' },
    'form.federationData': { pt: 'Dados Federativos', en: 'Federation Data' },
    'form.club': { pt: 'Clube', en: 'Club' },
    'form.discipline': { pt: 'Disciplina', en: 'Discipline' },
    'form.ageCategory': { pt: 'Categoria de Idade', en: 'Age Category' },
    'form.notes': { pt: 'Observações', en: 'Notes' },
    'form.save': { pt: 'Guardar', en: 'Save' },
    'form.cancel': { pt: 'Cancelar', en: 'Cancel' },
    'form.edit': { pt: 'Editar', en: 'Edit' },
    'form.delete': { pt: 'Eliminar', en: 'Delete' },
    'form.selectClub': { pt: 'Selecionar clube...', en: 'Select club...' },
    'form.selectDiscipline': { pt: 'Selecionar disciplina...', en: 'Select discipline...' },
    'form.selectCategory': { pt: 'Selecionar categoria...', en: 'Select category...' },

    // Athlete Profile
    'profile.title': { pt: 'Perfil do Atleta', en: 'Athlete Profile' },
    'profile.personalInfo': { pt: 'Informação Pessoal', en: 'Personal Information' },
    'profile.federationInfo': { pt: 'Informação Federativa', en: 'Federation Information' },
    'profile.tournamentHistory': { pt: 'Histórico de Torneios', en: 'Tournament History' },
    'profile.paymentHistory': { pt: 'Histórico de Pagamentos', en: 'Payment History' },
    'profile.bestScore': { pt: 'Melhor Pontuação', en: 'Best Score' },
    'profile.tournamentsPlayed': { pt: 'Torneios Disputados', en: 'Tournaments Played' },
    'profile.avgScore': { pt: 'Pontuação Média', en: 'Average Score' },
    'profile.back': { pt: 'Voltar', en: 'Back' },

    // Tournaments
    'tournaments.title': { pt: 'Gestão de Torneios', en: 'Tournament Management' },
    'tournaments.createNew': { pt: 'Novo Torneio', en: 'New Tournament' },
    'tournaments.upcoming': { pt: 'Próximos', en: 'Upcoming' },
    'tournaments.ongoing': { pt: 'Em Curso', en: 'Ongoing' },
    'tournaments.completed': { pt: 'Concluídos', en: 'Completed' },
    'tournaments.all': { pt: 'Todos', en: 'All' },
    'tournaments.name': { pt: 'Nome do Torneio', en: 'Tournament Name' },
    'tournaments.type': { pt: 'Tipo', en: 'Type' },
    'tournaments.date': { pt: 'Data', en: 'Date' },
    'tournaments.location': { pt: 'Local', en: 'Location' },
    'tournaments.participants': { pt: 'Participantes', en: 'Participants' },
    'tournaments.status': { pt: 'Estado', en: 'Status' },
    'tournaments.details': { pt: 'Detalhes', en: 'Details' },
    'tournaments.scores': { pt: 'Pontuações', en: 'Scores' },
    'tournaments.results': { pt: 'Resultados', en: 'Results' },
    'tournaments.addParticipant': { pt: 'Adicionar Participante', en: 'Add Participant' },
    'tournaments.enterScores': { pt: 'Registar Pontuações', en: 'Enter Scores' },
    'tournaments.description': { pt: 'Descrição', en: 'Description' },
    'tournaments.maxParticipants': { pt: 'Máx. Participantes', en: 'Max Participants' },
    'tournaments.rounds': { pt: 'Rondas', en: 'Rounds' },
    'tournaments.distances': { pt: 'Distâncias', en: 'Distances' },
    'tournaments.targetFace': { pt: 'Alvo', en: 'Target Face' },
    'tournaments.isLeague': { pt: 'Conta para Liga', en: 'League Event' },
    'tournaments.indoor': { pt: 'Indoor', en: 'Indoor' },
    'tournaments.outdoor': { pt: 'Outdoor', en: 'Outdoor' },
    'tournaments.field': { pt: 'Campo', en: 'Field' },
    'tournaments.statusUpcoming': { pt: 'Próximo', en: 'Upcoming' },
    'tournaments.statusCompleted': { pt: 'Concluído', en: 'Completed' },
    'tournaments.participantsLabel': { pt: 'participantes', en: 'participants' },
    'tournaments.league': { pt: 'Liga', en: 'League' },
    'tournaments.score': { pt: 'Pontuação', en: 'Score' },
    'tournaments.scorePlaceholder': { pt: 'Pontuação', en: 'Score' },
    'tournaments.scoreInstructions': { pt: 'Introduza as pontuações dos atletas participantes:', en: 'Enter scores for participating athletes:' },

    // Tournament Form
    'tournamentForm.title': { pt: 'Criar Torneio', en: 'Create Tournament' },
    'tournamentForm.editTitle': { pt: 'Editar Torneio', en: 'Edit Tournament' },
    'tournamentForm.startDate': { pt: 'Data de Início', en: 'Start Date' },
    'tournamentForm.endDate': { pt: 'Data de Fim', en: 'End Date' },

    // Standings
    'standings.title': { pt: 'Classificações da Liga', en: 'League Standings' },
    'standings.season': { pt: 'Época', en: 'Season' },
    'standings.rank': { pt: 'Pos.', en: 'Rank' },
    'standings.athlete': { pt: 'Atleta', en: 'Athlete' },
    'standings.club': { pt: 'Clube', en: 'Club' },
    'standings.totalPoints': { pt: 'Pontos Totais', en: 'Total Points' },
    'standings.events': { pt: 'Etapas', en: 'Events' },
    'standings.bestScore': { pt: 'Melhor Pontuação', en: 'Best Score' },
    'standings.filterDiscipline': { pt: 'Filtrar por disciplina', en: 'Filter by discipline' },
    'standings.allDisciplines': { pt: 'Todas as disciplinas', en: 'All disciplines' },
    'standings.leagueProgress': { pt: 'Progresso da Liga', en: 'League Progress' },
    'standings.etapa': { pt: 'Etapa', en: 'Stage' },
    'standings.stageAbbrev': { pt: 'E', en: 'S' },
    'standings.seasonInfo': { pt: 'Época 2025/2026', en: 'Season 2025/2026' },
    'standings.stagesCompleted': { pt: 'etapas concluídas de 3', en: 'of 3 stages completed' },
    'standings.stageCompleted': { pt: 'etapa concluída de 3', en: 'of 3 stage completed' },
    'standings.discipline': { pt: 'Disciplina', en: 'Discipline' },
    'standings.noData': { pt: 'Sem dados de classificação', en: 'No standings data' },

    // Payments
    'payments.title': { pt: 'Gestão de Pagamentos', en: 'Payment Management' },
    'payments.all': { pt: 'Todos', en: 'All' },
    'payments.paid': { pt: 'Pagos', en: 'Paid' },
    'payments.pending': { pt: 'Pendentes', en: 'Pending' },
    'payments.overdue': { pt: 'Em Atraso', en: 'Overdue' },
    'payments.athlete': { pt: 'Atleta', en: 'Athlete' },
    'payments.description': { pt: 'Descrição', en: 'Description' },
    'payments.amount': { pt: 'Valor', en: 'Amount' },
    'payments.dueDate': { pt: 'Data Limite', en: 'Due Date' },
    'payments.paidDate': { pt: 'Data de Pagamento', en: 'Payment Date' },
    'payments.status': { pt: 'Estado', en: 'Status' },
    'payments.markPaid': { pt: 'Marcar como Pago', en: 'Mark as Paid' },
    'payments.sendReminder': { pt: 'Enviar Lembrete', en: 'Send Reminder' },
    'payments.totalCollected': { pt: 'Total Cobrado', en: 'Total Collected' },
    'payments.totalPending': { pt: 'Total Pendente', en: 'Total Pending' },
    'payments.totalOverdue': { pt: 'Total em Atraso', en: 'Total Overdue' },
    'payments.collectionRate': { pt: 'Taxa de Cobrança', en: 'Collection Rate' },
    'payments.type': { pt: 'Tipo', en: 'Type' },
    'payments.newPayment': { pt: 'Novo Pagamento', en: 'New Payment' },
    'payments.quota_annual': { pt: 'Quota Anual', en: 'Annual Fee' },
    'payments.tournament_fee': { pt: 'Inscrição Torneio', en: 'Tournament Fee' },
    'payments.license_fee': { pt: 'Taxa de Licença', en: 'License Fee' },

    // Calendar
    'calendar.title': { pt: 'Calendário', en: 'Calendar' },
    'calendar.today': { pt: 'Hoje', en: 'Today' },
    'calendar.month': { pt: 'Mês', en: 'Month' },
    'calendar.tournament': { pt: 'Torneio', en: 'Tournament' },
    'calendar.meeting': { pt: 'Reunião', en: 'Meeting' },
    'calendar.deadline': { pt: 'Prazo', en: 'Deadline' },
    'calendar.training': { pt: 'Formação', en: 'Training' },
    'calendar.event': { pt: 'Evento', en: 'Event' },
    'calendar.months': {
        pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    'calendar.weekdays': {
        pt: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    'calendar.upcomingEvents': { pt: 'Próximos Eventos', en: 'Upcoming Events' },

    // Reports
    'reports.title': { pt: 'Relatórios e Estatísticas', en: 'Reports & Statistics' },
    'reports.overview': { pt: 'Visão Geral', en: 'Overview' },
    'reports.athleteStats': { pt: 'Estatísticas de Atletas', en: 'Athlete Statistics' },
    'reports.financialStats': { pt: 'Estatísticas Financeiras', en: 'Financial Statistics' },
    'reports.tournamentStats': { pt: 'Estatísticas de Torneios', en: 'Tournament Statistics' },
    'reports.genderDistribution': { pt: 'Distribuição por Género', en: 'Gender Distribution' },
    'reports.clubDistribution': { pt: 'Atletas por Clube', en: 'Athletes by Club' },
    'reports.ageDistribution': { pt: 'Distribuição por Idade', en: 'Age Distribution' },
    'reports.scoreEvolution': { pt: 'Evolução de Pontuações', en: 'Score Evolution' },
    'reports.topPerformers': { pt: 'Melhores Atletas', en: 'Top Performers' },
    'reports.generate': { pt: 'Gerar Relatório', en: 'Generate Report' },
    'reports.export': { pt: 'Exportar PDF', en: 'Export PDF' },

    // Settings
    'settings.title': { pt: 'Definições', en: 'Settings' },
    'settings.language': { pt: 'Idioma', en: 'Language' },
    'settings.theme': { pt: 'Tema', en: 'Theme' },
    'settings.notifications': { pt: 'Notificações', en: 'Notifications' },
    'settings.about': { pt: 'Sobre', en: 'About' },

    // Chatbot
    'chat.title': { pt: 'Assistente FPTA', en: 'FPTA Assistant' },
    'chat.placeholder': { pt: 'Escreva uma mensagem...', en: 'Type a message...' },
    'chat.welcome': { pt: 'Olá! Sou o assistente da FPTA. Como posso ajudar?', en: 'Hello! I\'m the FPTA assistant. How can I help?' },
    'chat.thinking': { pt: 'A pensar...', en: 'Thinking...' },
    'chat.error': { pt: 'Desculpe, ocorreu um erro. Tente novamente.', en: 'Sorry, an error occurred. Please try again.' },

    // Common
    'common.save': { pt: 'Guardar', en: 'Save' },
    'common.cancel': { pt: 'Cancelar', en: 'Cancel' },
    'common.delete': { pt: 'Eliminar', en: 'Delete' },
    'common.edit': { pt: 'Editar', en: 'Edit' },
    'common.view': { pt: 'Ver', en: 'View' },
    'common.close': { pt: 'Fechar', en: 'Close' },
    'common.confirm': { pt: 'Confirmar', en: 'Confirm' },
    'common.yes': { pt: 'Sim', en: 'Yes' },
    'common.no': { pt: 'Não', en: 'No' },
    'common.loading': { pt: 'A carregar...', en: 'Loading...' },
    'common.noResults': { pt: 'Sem resultados', en: 'No results' },
    'common.success': { pt: 'Sucesso', en: 'Success' },
    'common.error': { pt: 'Erro', en: 'Error' },
    'common.warning': { pt: 'Aviso', en: 'Warning' },
    'common.or': { pt: 'ou', en: 'or' },
    'common.and': { pt: 'e', en: 'and' },
    'common.from': { pt: 'de', en: 'from' },
    'common.to': { pt: 'até', en: 'to' },
    'common.actions': { pt: 'Ações', en: 'Actions' },
    'common.back': { pt: 'Voltar', en: 'Back' },

    // Notifications
    'notif.athleteSaved': { pt: 'Atleta guardado com sucesso!', en: 'Athlete saved successfully!' },
    'notif.athleteDeleted': { pt: 'Atleta eliminado com sucesso!', en: 'Athlete deleted successfully!' },
    'notif.tournamentSaved': { pt: 'Torneio guardado com sucesso!', en: 'Tournament saved successfully!' },
    'notif.tournamentDeleted': { pt: 'Torneio eliminado com sucesso!', en: 'Tournament deleted successfully!' },
    'notif.paymentUpdated': { pt: 'Pagamento atualizado com sucesso!', en: 'Payment updated successfully!' },
    'notif.reminderSent': { pt: 'Lembrete enviado com sucesso!', en: 'Reminder sent successfully!' },
    'notif.scoresSaved': { pt: 'Pontuações guardadas com sucesso!', en: 'Scores saved successfully!' },
    'notif.confirmDelete': { pt: 'Tem a certeza que deseja eliminar?', en: 'Are you sure you want to delete?' },
    'notif.exportSuccess': { pt: 'Dados exportados com sucesso!', en: 'Data exported successfully!' },
    'notif.requiredFields': { pt: 'Preencha os campos obrigatórios.', en: 'Please fill all required fields.' },
    'notif.paymentCreated': { pt: 'Pagamento criado com sucesso!', en: 'Payment created successfully!' },

    // Disciplines
    'discipline.recurvo': { pt: 'Recurvo', en: 'Recurve' },
    'discipline.composto': { pt: 'Composto', en: 'Compound' },
    'discipline.arcoNu': { pt: 'Arco Nu', en: 'Barebow' },
    'discipline.arcoLongo': { pt: 'Arco Longo', en: 'Longbow' },

    // Age Categories
    'age.sub15': { pt: 'Sub-15', en: 'Under 15' },
    'age.sub18': { pt: 'Sub-18', en: 'Under 18' },
    'age.sub21': { pt: 'Sub-21', en: 'Under 21' },
    'age.senior': { pt: 'Sénior', en: 'Senior' },
    'age.master': { pt: 'Master', en: 'Master' },

    // Footer
    'footer.text': { pt: '© 2026 FPTA - Federação Portuguesa de Tiro com Arco. Todos os direitos reservados.', en: '© 2026 FPTA - Portuguese Archery Federation. All rights reserved.' },
    'footer.demo': { pt: 'Versão Demo - ArcheryPlus', en: 'Demo Version - ArcheryPlus' }
};

let currentLanguage = localStorage.getItem('fpta_language') || 'pt';

function t(key) {
    const translation = TRANSLATIONS[key];
    if (!translation) return key;
    return translation[currentLanguage] || translation['pt'] || key;
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('fpta_language', lang);
    document.documentElement.lang = lang;
    translatePage();
}

function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = t(key);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = translated;
        } else {
            el.textContent = translated;
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
}

function getCurrentLanguage() {
    return currentLanguage;
}
