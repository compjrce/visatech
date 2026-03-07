// campos.dart
// Definição fixa de todas as seções e campos do roteiro RDC 44/2009.
// Não há mais perguntas no banco — tudo está aqui.

enum TipoCampo { texto, data, opcoes, simNao, simNaoNaNo, checkboxes, numero, tabela }

class Campo {
  final String chave;
  final String label;
  final TipoCampo tipo;
  final bool obrigatorio;
  final String? referencia;
  final List<String>? opcoes; // para TipoCampo.opcoes e .checkboxes

  const Campo({
    required this.chave,
    required this.label,
    required this.tipo,
    this.obrigatorio = false,
    this.referencia,
    this.opcoes,
  });
}

class Secao {
  final String codigo;
  final String titulo;
  final List<Grupo> grupos;

  const Secao({required this.codigo, required this.titulo, required this.grupos});

  List<Campo> get todosCampos => grupos.expand((g) => g.campos).toList();
}

class Grupo {
  final String? titulo; // null = sem subtítulo
  final List<Campo> campos;

  const Grupo({this.titulo, required this.campos});
}

// ============================================================
// SEÇÃO A — Identificação
// ============================================================
const secaoA = Secao(
  codigo: 'A',
  titulo: 'Identificação da Empresa / Estabelecimento',
  grupos: [
    Grupo(campos: [
      Campo(
        chave: 'objetivo_inspecao',
        label: 'Objetivo da Inspeção',
        tipo: TipoCampo.opcoes,
        obrigatorio: true,
        opcoes: [
          'Solicitação de licença sanitária',
          'Renovação de licença sanitária',
          'Ação programada',
          'Apuração de denúncia',
          'Outros/Especificar',
        ],
      ),
      Campo(
        chave: 'objetivo_outros_texto',
        label: 'Especificar (Outros)',
        tipo: TipoCampo.texto,
      ),
      Campo(
        chave: 'data_inspecao',
        label: 'Data da Inspeção',
        tipo: TipoCampo.data,
        obrigatorio: true,
      ),
      Campo(
        chave: 'acompanhante',
        label: 'Acompanhante da Vistoria',
        tipo: TipoCampo.texto,
      ),
    ]),
  ],
);

// ============================================================
// SEÇÃO B — Responsabilidade Técnica
// ============================================================
const secaoB = Secao(
  codigo: 'B',
  titulo: 'Responsabilidade Técnica',
  grupos: [
    Grupo(campos: [
      Campo(
        chave: 'rt_inscrito_crf',
        label: 'Existe responsável técnico inscrito no CRF?',
        tipo: TipoCampo.simNao,
        obrigatorio: true,
        referencia: 'Art.15 da Lei Federal 5991/73 c/c Art.3º da RDC 44/2009',
      ),
      Campo(
        chave: 'farmaceutico_presente',
        label: 'Farmacêutico presente desde o início da inspeção?',
        tipo: TipoCampo.simNao,
        obrigatorio: true,
        referencia: 'Art.15 § 1º e 2º da Lei Federal 5991/73 c/c Art.3º da RDC 44/2009',
      ),
      Campo(
        chave: 'farmaceutico_identificado',
        label: 'O farmacêutico está identificado de modo distinto dos demais funcionários?',
        tipo: TipoCampo.simNao,
        obrigatorio: true,
        referencia: 'Art.17, parágrafo único da RDC 44/2009',
      ),
    ]),
  ],
);

// ============================================================
// SEÇÃO C — Administração
// ============================================================
const secaoC = Secao(
  codigo: 'C',
  titulo: 'Administração',
  grupos: [
    Grupo(titulo: 'I – Informações Gerais', campos: [
      Campo(chave: 'horario_funcionamento', label: 'Horário de funcionamento', tipo: TipoCampo.texto),
      Campo(chave: 'num_funcionarios', label: 'Número de funcionários', tipo: TipoCampo.numero),
      Campo(
        chave: 'areas_fisicas',
        label: 'Área física',
        tipo: TipoCampo.checkboxes,
        opcoes: ['Vendas', 'Estoque', 'Serviços Farmacêuticos', 'Copa', 'Gerência', 'Vestiário', 'Banheiros', 'Outros'],
      ),
    ]),
    Grupo(titulo: 'II – Documentos Apresentados', campos: [
      Campo(chave: 'afe_numero', label: 'AFE – Número', tipo: TipoCampo.texto),
      Campo(
        chave: 'afe_atividades',
        label: 'AFE – Atividades',
        tipo: TipoCampo.checkboxes,
        opcoes: ['Comércio', 'Dispensar Medicamento', 'Portaria 344', 'Prestação de Serviços'],
      ),
      Campo(chave: 'crf_numero', label: 'Certidão de Regularidade CRF – Nº', tipo: TipoCampo.texto),
      Campo(chave: 'crf_validade', label: 'Certidão de Regularidade CRF – Validade', tipo: TipoCampo.data),
      Campo(chave: 'avcb_numero', label: 'AVCB ou CLCB – Nº', tipo: TipoCampo.texto),
      Campo(chave: 'avcb_validade', label: 'AVCB ou CLCB – Validade', tipo: TipoCampo.data),
      Campo(chave: 'aso', label: 'ASO', tipo: TipoCampo.texto),
      Campo(chave: 'pcmso_pgr', label: 'PCMSO e PGR', tipo: TipoCampo.texto),
      Campo(chave: 'pragas_realizado', label: 'Controle de pragas – Realizado em', tipo: TipoCampo.data),
      Campo(chave: 'pragas_validade', label: 'Controle de pragas – Válido até', tipo: TipoCampo.data),
      Campo(chave: 'caixa_agua_realizado', label: 'Limpeza caixa d\'água – Realizado em', tipo: TipoCampo.data),
      Campo(chave: 'caixa_agua_validade', label: 'Limpeza caixa d\'água – Válido até', tipo: TipoCampo.data),
      Campo(chave: 'pgrss_atualizado', label: 'PGRSS – Atualizado em', tipo: TipoCampo.data),
      Campo(chave: 'pgrss_residuos', label: 'PGRSS – Tipos de resíduos', tipo: TipoCampo.texto),
      Campo(chave: 'pgrss_comprovantes', label: 'PGRSS – Comprovantes de recolha', tipo: TipoCampo.texto),
      Campo(chave: 'pmoc_elaborado', label: 'PMOC – Elaborado por', tipo: TipoCampo.texto),
      Campo(
        chave: 'pmoc_manutencao',
        label: 'Certificados de manutenção em acordo com o plano',
        tipo: TipoCampo.simNao,
        referencia: 'Lei Federal 13.589/2018 c/c Portaria 3.523/1998 c/c RE 09/2003',
      ),
    ]),
    Grupo(titulo: 'III – MBP', campos: [
      Campo(chave: 'mbp_revisado', label: 'Manual de Boas Práticas revisado em', tipo: TipoCampo.data),
    ]),
    Grupo(titulo: 'IV – POPs', campos: [
      Campo(chave: 'pop_atualizado', label: 'POP atualizado em', tipo: TipoCampo.data),
      Campo(chave: 'pop_lista_mestre', label: 'Lista mestre de POPs', tipo: TipoCampo.simNao),
      Campo(chave: 'pop_servicos', label: 'POPs para todos os serviços farmacêuticos', tipo: TipoCampo.simNao),
      Campo(chave: 'pop_limpeza_caixa_agua', label: 'POP – Limpeza da caixa d\'água (quando aplicável)', tipo: TipoCampo.simNaoNaNo, referencia: 'Art. 12'),
      Campo(chave: 'pop_limpeza_servicos', label: 'POP – Limpeza do espaço de serviços farmacêuticos', tipo: TipoCampo.simNaoNaNo, referencia: 'Art. 16'),
      Campo(chave: 'pop_aquisicao', label: 'POP – Aquisição de produtos', tipo: TipoCampo.simNaoNaNo, referencia: 'Inciso II do art. 86'),
      Campo(chave: 'pop_recebimento', label: 'POP – Recebimento de produtos', tipo: TipoCampo.simNaoNaNo, referencia: 'Art. 32 e inciso II do art. 86'),
      Campo(chave: 'pop_armazenamento', label: 'POP – Condições de armazenamento', tipo: TipoCampo.simNaoNaNo, referencia: '§4º do art. 35 e inciso II do art. 86'),
      Campo(chave: 'pop_exposicao', label: 'POP – Exposição e organização dos produtos', tipo: TipoCampo.simNaoNaNo, referencia: 'Inciso III do art. 86'),
      Campo(chave: 'pop_pre_vencidos', label: 'POP – Produtos com validade próxima ao vencimento', tipo: TipoCampo.simNaoNaNo, referencia: 'Art. 51 e inciso VI do art. 86'),
      Campo(chave: 'pop_vencidos', label: 'POP – Destino de produtos com validade vencida', tipo: TipoCampo.simNaoNaNo, referencia: 'Inciso V do art. 86'),
      Campo(chave: 'pop_remoto', label: 'POP – Comércio por meio remoto', tipo: TipoCampo.simNaoNaNo, referencia: '§3º do art. 56'),
      Campo(chave: 'pop_atencao_farm', label: 'POP – Atenção farmacêutica', tipo: TipoCampo.simNaoNaNo, referencia: 'Art. 65 parágrafo único'),
      Campo(chave: 'pop_pressao', label: 'POP – Aferição de pressão arterial (se aplicável)', tipo: TipoCampo.simNaoNaNo, referencia: 'Art. 72'),
      Campo(chave: 'pop_temperatura_corp', label: 'POP – Aferição de temperatura corporal (se aplicável)', tipo: TipoCampo.simNaoNaNo, referencia: 'Art. 72'),
      Campo(chave: 'pop_lobulo', label: 'POP – Perfuração de lóbulo auricular', tipo: TipoCampo.simNaoNaNo, referencia: 'Art. 80'),
      Campo(chave: 'pop_higiene', label: 'POP – Manutenção das condições higiênicas e sanitárias', tipo: TipoCampo.simNaoNaNo, referencia: 'Art. 83 e inciso I do art. 86'),
      Campo(chave: 'pop_dispensacao', label: 'POP – Dispensação de medicamentos', tipo: TipoCampo.simNaoNaNo, referencia: 'Inciso IV do art. 86'),
    ]),
    Grupo(titulo: 'V – Verificação dos Registros', campos: [
      Campo(chave: 'temp_geladeira', label: 'Temperatura da geladeira', tipo: TipoCampo.texto),
      Campo(chave: 'temp_ambiente', label: 'Temperatura ambiente', tipo: TipoCampo.texto),
      Campo(chave: 'umidade', label: 'Umidade relativa do ar', tipo: TipoCampo.texto),
      Campo(
        chave: 'registros_capacitacao',
        label: 'Registros de capacitação periódica dos funcionários?',
        tipo: TipoCampo.simNao,
        referencia: 'Art.24 a 28 da RDC 44/2009',
      ),
      Campo(chave: 'tabela_treinamentos', label: 'Tabela de treinamentos', tipo: TipoCampo.tabela),
    ]),
  ],
);

// ============================================================
// SEÇÃO D — Edificação e Instalações Físicas Gerais
// ============================================================
const secaoD = Secao(
  codigo: 'D',
  titulo: 'Edificação e Instalações Físicas Gerais',
  grupos: [
    Grupo(titulo: 'Placas', campos: [
      Campo(chave: 'placa_alvara', label: 'Mantém em local visível o Alvará Sanitário?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.2 § 1º e § 2º da RDC 44/2009'),
      Campo(chave: 'placa_crt', label: 'Mantém em local visível a CRT e cartaz complementar de identificação?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.2 § 1º e § 2º da RDC 44/2009'),
      Campo(chave: 'placa_fumigenos', label: 'Possui avisos de proibição de uso de produtos fumígenos?', tipo: TipoCampo.simNaoNaNo, referencia: 'Lei Estadual nº 13.541/09'),
      Campo(chave: 'placa_automedicacao', label: 'Possui cartaz "Medicamentos podem causar efeitos indesejados. Evite a automedicação"?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.41 da RDC 44/2009'),
      Campo(chave: 'placa_cpf', label: 'Possui aviso de proibição de exigência de CPF para promoções?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art. 135 da Lei 17.832/23'),
    ]),
    Grupo(titulo: 'Ambientes', campos: [
      Campo(chave: 'amb_guarda_pertences', label: 'Dispõe de local para guarda de pertences dos funcionários fora da área de vendas?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.10 da RDC 44/2009'),
      Campo(chave: 'amb_minimos', label: 'Possui os ambientes mínimos necessários à atividade?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.5 da RDC 44/2009'),
      Campo(chave: 'amb_estrutura', label: 'A estrutura é compatível com as atividades desenvolvidas?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.5 da RDC 44/2009'),
      Campo(chave: 'amb_acesso', label: 'O acesso é independente, sem comunicação com residências e outros estabelecimentos?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.23 da Lei Federal 5991/73 c/c Art.13 da RDC 44/2009'),
      Campo(chave: 'amb_higiene', label: 'As instalações estão em boas condições higiênicas e protegidas contra insetos e roedores?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.6 da RDC 44/2009'),
      Campo(chave: 'amb_piso', label: 'O piso, parede e teto são lisos, impermeáveis, sem rachaduras e de fácil higienização?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.6 da RDC 44/2009'),
      Campo(chave: 'amb_ventilacao', label: 'A ventilação e iluminação são compatíveis com as atividades?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.6 da RDC 44/2009'),
      Campo(chave: 'amb_exclusivo', label: 'As dependências são utilizadas exclusivamente para as atividades licenciadas?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.55 da Lei Federal 5991/73 c/c Art.90 da RDC 44/2009'),
      Campo(chave: 'amb_incendio', label: 'Possui equipamentos de combate a incêndios na validade, pressurizados e de fácil acesso?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.6 § 4º da RDC 44/2009'),
    ]),
    Grupo(titulo: 'DML', campos: [
      Campo(chave: 'dml_limpeza', label: 'Os materiais de limpeza são regularizados na ANVISA e armazenados em local designado?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.8 da RDC 44/2009'),
    ]),
    Grupo(titulo: 'Sanitários', campos: [
      Campo(chave: 'sanitario', label: 'O sanitário é de fácil acesso, com pia, água corrente, sabão líquido, lixeira e em boas condições?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.9 da RDC 44/2009'),
    ]),
  ],
);

// ============================================================
// SEÇÃO E — Armazenagem e Exposição
// ============================================================
const secaoE = Secao(
  codigo: 'E',
  titulo: 'Armazenagem e Exposição dos Produtos',
  grupos: [
    Grupo(campos: [
      Campo(chave: 'arm_prateleiras', label: 'Produtos armazenados em gavetas/prateleiras, afastados do piso, parede e teto?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.35 e Art.36 da RDC 44/2009'),
      Campo(chave: 'arm_prescricao', label: 'Medicamentos sujeitos a prescrição em local de acesso restrito a funcionários?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.40 § 1º da RDC 44/2009'),
      Campo(chave: 'arm_termometros_os', label: 'Termômetros calibrados em todas as áreas com estoque – Nº da OS e Data', tipo: TipoCampo.texto, referencia: 'Art.39 da RDC 44/2009'),
      Campo(chave: 'arm_registro_temp', label: 'A temperatura e umidade do ar são registradas diariamente?', tipo: TipoCampo.simNaoNaNo),
      Campo(chave: 'arm_refrigerados', label: 'Comercializa medicamentos com armazenagem entre 2ºC e 8ºC?', tipo: TipoCampo.simNaoNaNo),
      Campo(chave: 'arm_refrigerados_cond', label: 'Tais medicamentos encontram-se em condições adequadas?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.35 § 3º da RDC 44/2009'),
      Campo(chave: 'arm_termometros_geladeira_os', label: 'Termômetros calibrados nos refrigeradores – Nº da OS e Data', tipo: TipoCampo.texto, referencia: 'Art.35 § 3º da RDC 44/2009'),
      Campo(chave: 'arm_registro_geladeira', label: 'A temperatura do(s) refrigerador(es) é registrada diariamente?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.35 § 3º da RDC 44/2009'),
    ]),
  ],
);

// ============================================================
// SEÇÃO F — Produtos
// ============================================================
const secaoF = Secao(
  codigo: 'F',
  titulo: 'Produtos',
  grupos: [
    Grupo(campos: [
      Campo(chave: 'prod_pre_vencidos', label: 'Os produtos pré-vencidos possuem tratamento diferenciado?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.38 da RDC 44/2009'),
      Campo(chave: 'prod_segregados', label: 'Produtos violados/vencidos/não conformes estão segregados com destino adequado?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.38 da RDC 44/2009 c/c RDC 222/2018'),
      Campo(chave: 'prod_validade', label: 'Os produtos expostos para venda encontram-se na validade?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.8 da Lei Federal 5991/73 c/c Art.38 da RDC 44/2009'),
      Campo(chave: 'prod_embalagem_original', label: 'Os medicamentos estão em embalagens originais com registro no Ministério da Saúde?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.11 e Art.12 da Lei Federal 6360/76 c/c Art.30 da RDC 44/2009'),
      Campo(chave: 'prod_rotulagem', label: 'Os produtos possuem rotulagem adequada (lote, validade, fabricação, regularidade, nacionalização)?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.11 § 2º e Art.25 da Lei Federal 6360/76 c/c Art.30 e Art.34 da RDC 44/2009'),
      Campo(chave: 'prod_embalagem_hosp', label: 'Cumpre a proibição de vender medicamentos em embalagem hospitalar?', tipo: TipoCampo.simNaoNaNo, referencia: 'RDC 71/2009 e 768/2022'),
      Campo(chave: 'prod_captacao_receita', label: 'Cumpre a proibição de captar receitas médicas para manipular?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.1 da Lei Federal 11951/2009 c/c Art.50 da RDC 44/2009'),
      Campo(chave: 'prod_fornecedores', label: 'Só adquire medicamentos de fornecedores qualificados e legalizados?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.31 da RDC 44/2009'),
      Campo(chave: 'prod_permitidos', label: 'Todos os produtos expostos são permitidos ao ramo farmacêutico?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.5 § 1º da Lei Federal 5991/1973 c/c Art.29 da RDC 44/2009 c/c IN 09/2009'),
      Campo(chave: 'prod_plantas', label: 'As ervas e plantas medicinais estão rotuladas e acondicionadas adequadamente?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.7 da Lei Federal 5991/73'),
      Campo(chave: 'prod_observacoes', label: 'Observações', tipo: TipoCampo.texto),
    ]),
  ],
);

// ============================================================
// SEÇÃO G — Prestação de Serviços Farmacêuticos
// ============================================================
const secaoG = Secao(
  codigo: 'G',
  titulo: 'Prestação de Serviços Farmacêuticos',
  grupos: [
    Grupo(campos: [
      Campo(chave: 'serv_realiza', label: 'Realiza prestação de serviços farmacêuticos?', tipo: TipoCampo.simNao),
      Campo(
        chave: 'serv_quais',
        label: 'Quais serviços?',
        tipo: TipoCampo.checkboxes,
        opcoes: [
          'Atenção farmacêutica domiciliar',
          'Aferição de temperatura corporal',
          'Aferição de pressão arterial',
          'Perfuração de lóbulo auricular',
          'Injetáveis',
        ],
      ),
      Campo(chave: 'serv_declaracao', label: 'Possui declaração de prestação do serviço em duas vias?', tipo: TipoCampo.simNaoNaNo),
      Campo(chave: 'serv_local_especifico', label: 'Existe local específico para serviços farmacêuticos, diverso à dispensação?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.18 § 1º da Lei Federal 5991/1973 c/c Art.15 da RDC 44/2009'),
      Campo(chave: 'serv_sala_equipada', label: 'A sala possui pia, sabonete, toalhas descartáveis, álcool 70%, lixeira com pedal?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.15 § 2º da RDC 44/2009'),
      Campo(chave: 'serv_perfuro_cortantes', label: 'Os perfuro-cortantes e contaminados são descartados em local adequado?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.73 e Art.83 da RDC 44/2009'),
      Campo(chave: 'serv_assepsia', label: 'A assepsia dos acessórios e equipamentos está dentro das normas?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.80 e Art.83 da RDC 44/2009'),
      Campo(chave: 'serv_validade_insumos', label: 'As agulhas, seringas e brincos estão na validade?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.38 § 1º da RDC 44/2009'),
      Campo(chave: 'serv_profissional_hab', label: 'Possui profissional habilitado para aplicação de injetáveis?', tipo: TipoCampo.simNaoNaNo),
      Campo(chave: 'serv_higiene_local', label: 'O local possui condições higiênico-sanitárias satisfatórias?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.18 da Lei Federal 5991/1973 c/c Art.15 § 1º e Art.16 § 1º da RDC 44/2009'),
    ]),
  ],
);

// ============================================================
// SEÇÃO H — Medicamentos Sujeitos a Controle Especial
// ============================================================
const secaoH = Secao(
  codigo: 'H',
  titulo: 'Medicamentos Sujeitos a Controle Especial',
  grupos: [
    Grupo(titulo: 'Controle Especial', campos: [
      Campo(chave: 'ctrl_regularizado', label: 'O estabelecimento está regularizado para tal comércio?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.49 da RDC 44/2009 e RDC 22/2014 c/c Portaria 344/1998'),
      Campo(chave: 'ctrl_guarda', label: 'A guarda de medicamentos controlados atende à legislação?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.67 da Portaria 344/1998 c/c Art.37 da RDC 44/2009'),
      Campo(chave: 'ctrl_sngpc_atualizado', label: 'A escrituração está atualizada perante o SNGPC?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.10 da RDC 22/2014 e RDC 471/2021'),
      Campo(chave: 'ctrl_sngpc_transmissao', label: 'A transmissão de dados ao SNGPC é realizada nos intervalos estabelecidos (7 dias)?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.10 § 3º e 4°, Art 11 e Art 12 §1° e 2° da RDC 22/2014'),
      Campo(chave: 'ctrl_retencao_receita', label: 'Os medicamentos são dispensados mediante retenção de receita?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.25, Art.52–55 da Portaria 344/1998 e RDC 20/2011'),
      Campo(chave: 'ctrl_prescricoes', label: 'As prescrições e notificações obedecem às normas vigentes?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.35, 36, 52, 53 e 55 da Portaria 344/1998 c/c RDC 58/2007 c/c RDC 52/2011 e RDC 471/2021'),
      Campo(chave: 'ctrl_conferencia_farm', label: 'A conferência e dispensação das prescrições é feita pelo farmacêutico?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.37 da Resolução CFF nº 357/2001'),
      Campo(chave: 'ctrl_balanco_prazo', label: 'Os balanços são enviados nos prazos vigentes?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.69 da Portaria 344/1998'),
      Campo(chave: 'ctrl_estoque_confere', label: 'Os registros de entrada e saída conferem com o estoque físico?', tipo: TipoCampo.simNaoNaNo, referencia: 'Art.64 da Portaria 344/1998 c/c Art.15 e Art.16 da RDC 22/2014 e RDC 20/2011'),
      Campo(chave: 'ctrl_software', label: 'Possui escrituração digital? Qual?', tipo: TipoCampo.texto),
    ]),
    Grupo(titulo: 'Balanços / SNGPC', campos: [
      Campo(chave: 'sngpc_periodo', label: 'SNGPC – Período', tipo: TipoCampo.texto),
      Campo(chave: 'sngpc_data_transmissao', label: 'SNGPC – Data de transmissão', tipo: TipoCampo.data),
      Campo(chave: 'balanco_rmna', label: 'Balanço RMNA – Protocolado em', tipo: TipoCampo.data),
      Campo(chave: 'balanco_rmnb2', label: 'Balanço RMNB2 – Protocolado em', tipo: TipoCampo.data),
      Campo(chave: 'balanco_bmpo', label: 'Balanço BMPO – Protocolado em', tipo: TipoCampo.data),
    ]),
  ],
);

// ============================================================
// Lista ordenada de todas as seções
// ============================================================
const List<Secao> todasSecoes = [secaoA, secaoB, secaoC, secaoD, secaoE, secaoF, secaoG, secaoH];