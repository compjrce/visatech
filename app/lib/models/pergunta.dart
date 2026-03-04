class Pergunta {
  final int id;
  final int secaoId;
  final String texto;
  final int ordem;
  final bool obrigatoria;
  final String tipoResposta; // 'SIM_NAO', 'SIM_NAO_NA_NO', 'TEXTO', 'DATA', 'NUMERO'
  final String? referenciaLegal;
  final DateTime? criadoEm;

  Pergunta({
    required this.id,
    required this.secaoId,
    required this.texto,
    required this.ordem,
    required this.obrigatoria,
    required this.tipoResposta,
    this.referenciaLegal,
    this.criadoEm,
  });

  factory Pergunta.fromJson(Map<String, dynamic> json) {
    return Pergunta(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      secaoId: json['secao_id'] is int 
          ? json['secao_id'] 
          : int.parse(json['secao_id'].toString()),
      texto: json['texto'],
      ordem: json['ordem'] is int ? json['ordem'] : int.parse(json['ordem'].toString()),
      obrigatoria: json['obrigatoria'] == true || json['obrigatoria'] == 1,
      tipoResposta: json['tipo_resposta'],
      referenciaLegal: json['referencia_legal'],
      criadoEm: json['criado_em'] != null 
          ? DateTime.parse(json['criado_em']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'secao_id': secaoId,
      'texto': texto,
      'ordem': ordem,
      'obrigatoria': obrigatoria,
      'tipo_resposta': tipoResposta,
      'referencia_legal': referenciaLegal,
      'criado_em': criadoEm?.toIso8601String(),
    };
  }

  bool get isSimNao => tipoResposta == 'SIM_NAO';
  bool get isSimNaoNaNo => tipoResposta == 'SIM_NAO_NA_NO';
  bool get isTexto => tipoResposta == 'TEXTO';
  bool get isData => tipoResposta == 'DATA';
  bool get isNumero => tipoResposta == 'NUMERO';
}