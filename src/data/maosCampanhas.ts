export type MaosCampaignSection = {
  title: string;
  icon: string;
  content: string[];
  cta?: string;
};

export type MaosCampaignUpdate = {
  date: string;
  content: string;
};

export type MaosCampaign = {
  slug: string;
  title: string;
  image: string;
  category: string;
  organization: string;
  createdAtLabel: string;
  excerpt: string;
  raised: number;
  goal: number;
  daysLeft: number;
  pixKey: string;
  suggestedValues: number[];
  sections: MaosCampaignSection[];
  updates?: MaosCampaignUpdate[];
};

export const maosCampaigns: MaosCampaign[] = [
  {
    slug: 'theo',
    title: 'Théo corre o risco de perder os movimentos',
    image: '/images/maos/doacao-theo.png',
    category: 'Saúde',
    organization: 'Esperança do Bem',
    createdAtLabel: 'Criada em 02 de dez. de 2025',
    excerpt: 'Theo, um bebê de 1 ano e 3 meses, precisa de ajuda urgente para continuar o tratamento.',
    raised: 5225388.28,
    goal: 6000000,
    daysLeft: 0,
    pixKey: 'doe@maosqueacolhem.org',
    suggestedValues: [30, 40, 50, 100, 150, 200, 250, 500, 1000],
    sections: [
      {
        icon: '💙',
        title: 'Ajude o Theo a seguir lutando',
        content: [
          'Theo é um bebê de 1 ano e 3 meses que enfrenta uma condição extremamente delicada. Mesmo tão pequeno, ele já passou por internações, exames e uma rotina intensa de cuidados que mudaram completamente a vida da família.',
          'Hoje, cada passo do tratamento é decisivo para preservar seus movimentos, sua respiração e seu desenvolvimento. O tempo é precioso, e a continuidade dos cuidados não pode esperar.',
        ],
        cta: 'AJUDAR O THEO 💙',
      },
      {
        icon: '🧠',
        title: 'As sequelas e os riscos são urgentes',
        content: [
          'Theo corre o risco de perder movimentos importantes e também pode enfrentar complicações respiratórias se o tratamento for interrompido.',
          'A família precisa manter fisioterapia, acompanhamento com especialistas, exames e suporte clínico frequente para reduzir esses riscos e dar a ele uma chance real de evolução.',
        ],
      },
      {
        icon: '🙏',
        title: 'Cada doação encurta a distância até o cuidado',
        content: [
          'Sua ajuda representa mais sessões, mais exames e mais segurança para um bebê que precisa de resposta rápida.',
          'Se você puder doar, qualquer valor já ajuda. E se não puder, compartilhar essa história também é uma forma de cuidado.',
        ],
        cta: 'DOAR PELO THEO 🙏',
      },
    ],
    updates: [
      {
        date: '12 de mar. de 2026',
        content: 'Temos a alegria de informar que as duas primeiras metas da campanha foram oficialmente alcançadas. Graças à generosidade de milhares de apoiadores, já foi possível garantir a estabilidade necessária para que o Theo continue o tratamento com segurança. As sessões de fisioterapia foram intensificadas e os resultados têm sido animadores.',
      },
      {
        date: '28 de fev. de 2026',
        content: 'O Theo completou mais uma etapa importante do tratamento. Os médicos relataram melhora significativa na resposta motora e a família segue confiante na evolução. Cada doação tem feito diferença real na vida dele. Obrigado a todos que contribuíram até aqui!',
      },
    ],
  },
  {
    slug: 'bernardo',
    title: 'Ajude o Bernardo a vencer essa luta',
    image: '/images/maos/doacao-bernardo.png',
    category: 'Saúde',
    organization: 'Esperança do Bem',
    createdAtLabel: 'Criada em 01 de dez. de 2025',
    excerpt: 'Ajude o pequeno Bernardo a continuar lutando com dignidade e acesso ao tratamento.',
    raised: 2542570.88,
    goal: 16000000,
    daysLeft: 0,
    pixKey: 'doe@maosqueacolhem.org',
    suggestedValues: [30, 40, 50, 100, 150, 200, 250, 500, 1000],
    sections: [
      {
        icon: '💙',
        title: 'Ajude o pequeno Bernardo a continuar lutando',
        content: [
          'Bernardo tem apenas 2 anos e 5 meses de vida. Mesmo tão pequeno, ele já enfrentou desafios que muitas pessoas não enfrentam em toda uma vida. Ele venceu um câncer raro com metástase no fígado, uma batalha dura que marcou profundamente sua história.',
          'Essa vitória, porém, deixou sequelas importantes. Hoje, Bernardo não fala, não come sozinho e ainda não caminha. A luta continua todos os dias, e a família precisa de ajuda para sustentar o tratamento.',
        ],
        cta: 'AJUDAR O BERNARDO 🤍',
      },
      {
        icon: '🧠',
        title: 'As sequelas deixadas pela doença',
        content: [
          'Para continuar evoluindo, Bernardo precisa de tratamentos intensivos e diários. Entre eles estão a fisioterapia constante, a fonoaudiologia e a terapia ocupacional.',
          'Cada pausa representa um retrocesso no progresso que Bernardo conquistou com tanto esforço. O cuidado precisa ser contínuo para que ele volte a evoluir com dignidade.',
        ],
      },
      {
        icon: '💔',
        title: 'Uma luta que gera custos altos e contínuos',
        content: [
          'Durante muito tempo, a família precisou arcar com medicações, transporte para tratamentos, alimentação especial, exames e consultas médicas.',
          'Mesmo após tantas batalhas vencidas, a luta continua. O câncer não espera. E a reabilitação do Bernardo também não pode esperar.',
        ],
        cta: 'DOAR AGORA 🙏',
      },
      {
        icon: '🤍',
        title: 'Qualquer valor faz a diferença',
        content: [
          'Cada conquista do Bernardo até aqui só foi possível graças à união, ao amor e à solidariedade de pessoas como você.',
          'Cada contribuição é uma semente de esperança para que esse pequeno guerreiro volte a caminhar e tenha qualidade de vida.',
        ],
        cta: 'AJUDAR O BERNARDO 💙',
      },
    ],
  },
  {
    slug: 'lorenzo',
    title: 'Vamos salvar o Lorenzo!',
    image: '/images/maos/doacao-lorenzo.png',
    category: 'Saúde',
    organization: 'Esperança do Bem',
    createdAtLabel: 'Criada em 05 de dez. de 2025',
    excerpt: 'Lorenzo luta contra uma distrofia muscular rara e precisa da nossa corrente de apoio.',
    raised: 2491713.11,
    goal: 16000000,
    daysLeft: 0,
    pixKey: 'doe@maosqueacolhem.org',
    suggestedValues: [30, 40, 50, 100, 150, 200, 250, 500, 1000],
    sections: [
      {
        icon: '💙',
        title: 'Lorenzo precisa de ajuda agora',
        content: [
          'Lorenzo enfrenta uma distrofia muscular rara que exige resposta rápida, monitoramento e acesso contínuo a terapias e procedimentos de alto custo.',
          'A família tem vivido dias de muita pressão emocional e financeira, tentando manter o tratamento ativo e evitar perdas irreversíveis.',
        ],
        cta: 'AJUDAR O LORENZO 💙',
      },
      {
        icon: '🏥',
        title: 'O tratamento não pode parar',
        content: [
          'Os custos envolvem consultas, exames, deslocamentos, suporte clínico e acompanhamento especializado.',
          'Qualquer interrupção pode comprometer a evolução do Lorenzo, por isso a mobilização precisa acontecer agora.',
        ],
      },
      {
        icon: '🙏',
        title: 'Doe ou compartilhe',
        content: [
          'Sua contribuição ajuda a transformar urgência em cuidado real.',
          'Se não puder doar, compartilhar a campanha já ajuda a ampliar a rede de apoio da família.',
        ],
        cta: 'DOAR PELO LORENZO 🙏',
      },
    ],
  },
  {
    slug: 'vitor',
    title: 'Ajude a salvar a vida do Vitor',
    image: '/images/maos/doacao-miguel.png',
    category: 'Saúde',
    organization: 'Esperança do Bem',
    createdAtLabel: 'Criada em 08 de dez. de 2025',
    excerpt: 'História verificada: Vitor precisa de tratamento, suporte e cuidados imediatos.',
    raised: 1526417.87,
    goal: 2000000,
    daysLeft: 14,
    pixKey: 'doe@maosqueacolhem.org',
    suggestedValues: [30, 40, 50, 100, 150, 200, 250, 500, 1000],
    sections: [
      {
        icon: '💙',
        title: 'Vitor precisa de uma resposta urgente',
        content: [
          'A campanha do Vitor reúne uma história verificada, marcada por dor, coragem e uma corrida contra o tempo para garantir atendimento.',
          'Os próximos passos do tratamento exigem recursos imediatos para que ele continue sendo acompanhado com segurança.',
        ],
        cta: 'AJUDAR O VITOR 💙',
      },
      {
        icon: '💊',
        title: 'Os custos são altos e constantes',
        content: [
          'Exames, medicamentos, transporte, consultas e cuidados diários pesam diretamente no orçamento da família.',
          'Cada valor arrecadado ajuda a manter o tratamento em andamento e dá mais estabilidade para quem está lutando todos os dias.',
        ],
      },
      {
        icon: '🙏',
        title: 'Sua ajuda muda o ritmo dessa história',
        content: [
          'Doar é uma forma direta de aliviar a urgência e aproximar o Vitor do cuidado que ele precisa.',
          'Compartilhar a campanha também fortalece essa corrente do bem.',
        ],
        cta: 'DOAR PELO VITOR 🙏',
      },
    ],
    updates: [
      {
        date: '10 de mar. de 2026',
        content: 'A campanha do Vitor ultrapassou 76% da meta! O tratamento segue firme e os exames mais recentes mostraram sinais positivos de estabilização. A família agradece imensamente cada contribuição e reforça que estamos na reta final para garantir todo o suporte que ele precisa.',
      },
    ],
  },
  {
    slug: 'davi',
    title: 'Meu filho está com câncer em estágio avançado e precisa de tratamento urgente',
    image: '/images/maos/doacao-arthur.png',
    category: 'Saúde',
    organization: 'Esperança do Bem',
    createdAtLabel: 'Criada em 10 de dez. de 2025',
    excerpt: 'Davi, um menino de 4 anos, precisa de ajuda para seguir com o tratamento sem interrupções.',
    raised: 941005.75,
    goal: 1500000,
    daysLeft: 0,
    pixKey: 'doe@maosqueacolhem.org',
    suggestedValues: [30, 40, 50, 100, 150, 200, 250, 500, 1000],
    sections: [
      {
        icon: '💙',
        title: 'Davi precisa de ajuda urgente',
        content: [
          'Davi é uma criança que enfrenta um diagnóstico grave e precisa continuar o tratamento com máxima urgência.',
          'A família está mobilizada para não deixar faltar nenhum passo essencial nessa caminhada tão dura.',
        ],
        cta: 'AJUDAR O DAVI 💙',
      },
      {
        icon: '🏥',
        title: 'Cada etapa do tratamento importa',
        content: [
          'Consultas, exames, medicações e deslocamentos frequentes fazem parte da rotina atual da família.',
          'Sem apoio, o peso financeiro cresce rapidamente e coloca em risco a continuidade do cuidado.',
        ],
      },
      {
        icon: '🙏',
        title: 'Qualquer valor já ajuda',
        content: [
          'Cada doação representa fôlego para continuar e esperança para enfrentar os próximos dias.',
          'Se você puder contribuir, estará ajudando diretamente uma criança que precisa de resposta rápida.',
        ],
        cta: 'DOAR PELO DAVI 🙏',
      },
    ],
  },
  {
    slug: 'maria-alice',
    title: 'Maria Alice precisa da sua ajuda para comprar o medicamento mais caro do mundo',
    image: '/images/maos/doacao-gabriel.png',
    category: 'Saúde',
    organization: 'Esperança do Bem',
    createdAtLabel: 'Criada em 12 de dez. de 2025',
    excerpt: 'Maria Alice luta contra a AME e precisa do medicamento que pode mudar sua vida.',
    raised: 746688.25,
    goal: 900000,
    daysLeft: 0,
    pixKey: 'doe@maosqueacolhem.org',
    suggestedValues: [30, 40, 50, 100, 150, 200, 250, 500, 1000],
    sections: [
      {
        icon: '💙',
        title: 'Maria Alice precisa da nossa corrente',
        content: [
          'Maria Alice luta contra a AME e precisa de um medicamento de altíssimo custo para ter uma chance melhor de desenvolvimento.',
          'A família está em busca de apoio para transformar uma necessidade impossível em uma possibilidade real.',
        ],
        cta: 'AJUDAR A MARIA ALICE 💙',
      },
      {
        icon: '💉',
        title: 'O medicamento é urgente e caro',
        content: [
          'O valor necessário é alto, mas a mobilização coletiva pode encurtar essa distância e dar rapidez ao tratamento.',
          'Cada ajuda contribui para que a campanha avance com mais força e mais visibilidade.',
        ],
      },
      {
        icon: '🙏',
        title: 'Faça parte dessa história',
        content: [
          'Doar é uma forma concreta de apoiar uma criança e aliviar o peso sobre a família.',
          'Compartilhar a campanha também é essencial para ampliar o alcance dessa causa.',
        ],
        cta: 'DOAR PELA MARIA ALICE 🙏',
      },
    ],
    updates: [
      {
        date: '14 de mar. de 2026',
        content: 'A campanha da Maria Alice já alcançou mais de 83% da meta! A família está emocionada com a mobilização de tantas pessoas. O processo para aquisição do medicamento já foi iniciado junto ao hospital de referência. Cada real doado nos aproxima do momento em que ela poderá receber o tratamento que pode transformar sua vida.',
      },
      {
        date: '01 de mar. de 2026',
        content: 'Maria Alice segue sendo acompanhada de perto pela equipe médica. Os exames de rotina foram realizados e os resultados estão dentro do esperado. A família mantém a esperança e a força para seguir nessa jornada. Obrigado por cada compartilhamento e cada doação!',
      },
    ],
  },
];

export const getMaosCampaignBySlug = (slug?: string) =>
  maosCampaigns.find((campaign) => campaign.slug === slug);
