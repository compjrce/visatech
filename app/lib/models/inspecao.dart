class Inspecao {
  final int id;
  final int questionarioId;
  final int estabelecimentoId;
  final int fiscalResponsavelId;
  final String? tipoInspecao;
  final DateTime dataInicio;
  final DateTime? dataFim;
  final String status; // 'EM_ANDAMENTO', 'BLOQUEADA_B', 'FINALIZADA', 'CANCELADA'
  final bool secaoBAprovada;
  final String? observacoesGerais;

  Inspecao({
    required this.id,
    required this.questionarioId,
    required this.estabelecimentoId,
    required this.fiscalResponsavelId,
    this.tipoInspecao,
    required this.dataInicio,
    this.dataFim,
    required this.status,
    required this.secaoBAprovada,
    this.observacoesGerais,
  });

  factory Inspecao.fromJson(Map<String, dynamic> json) {
    return Inspecao(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      questionarioId: json['questionario_id'] is int 
          ? json['questionario_id'] 
          : int.parse(json['questionario_id'].toString()),
      estabelecimentoId: json['estabelecimento_id'] is int 
          ? json['estabelecimento_id'] 
          : int.parse(json['estabelecimento_id'].toString()),
      fiscalResponsavelId: json['fiscal_responsavel_id'] is int 
          ? json['fiscal_responsavel_id'] 
          : int.parse(json['fiscal_responsavel_id'].toString()),
      tipoInspecao: json['tipo_inspecao'],
      dataInicio: DateTime.parse(json['data_inicio']),
      dataFim: json['data_fim'] != null ? DateTime.parse(json['data_fim']) : null,
      status: json['status'],
      secaoBAprovada: json['secao_b_aprovada'] == true || json['secao_b_aprovada'] == 1,
      observacoesGerais: json['observacoes_gerais'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'questionario_id': questionarioId,
      'estabelecimento_id': estabelecimentoId,
      'fiscal_responsavel_id': fiscalResponsavelId,
      'tipo_inspecao': tipoInspecao,
      'data_inicio': dataInicio.toIso8601String(),
      'data_fim': dataFim?.toIso8601String(),
      'status': status,
      'secao_b_aprovada': secaoBAprovada,
      'observacoes_gerais': observacoesGerais,
    };
  }

  bool get emAndamento => status == 'EM_ANDAMENTO';
  bool get bloqueada => status == 'BLOQUEADA_B';
  bool get finalizada => status == 'FINALIZADA';
  bool get cancelada => status == 'CANCELADA';
}