enum TipoResposta { SIM, NAO, NA, NO }

class Resposta {
  final int perguntaId;
  final TipoResposta? respostaOpcao;
  final String? respostaTexto;
  final String? observacao;

  Resposta({
    required this.perguntaId,
    this.respostaOpcao,
    this.respostaTexto,
    this.observacao,
  });

  Map<String, dynamic> toJson() {
    return {
      'pergunta_id': perguntaId,
      'resposta_opcao': respostaOpcao?.name,
      'resposta_texto': respostaTexto,
      'observacao': observacao,
    };
  }

  factory Resposta.fromJson(Map<String, dynamic> json) {
    TipoResposta? opcao;
    if (json['resposta_opcao'] != null) {
      try {
        opcao = TipoResposta.values.firstWhere(
          (e) => e.name == json['resposta_opcao'],
        );
      } catch (e) {
        opcao = null;
      }
    }

    return Resposta(
      perguntaId: json['pergunta_id'] is int 
          ? json['pergunta_id'] 
          : int.parse(json['pergunta_id'].toString()),
      respostaOpcao: opcao,
      respostaTexto: json['resposta_texto'],
      observacao: json['observacao'],
    );
  }
}