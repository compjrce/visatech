import 'pergunta.dart';

class Secao {
  final int id;
  final int questionarioId;
  final String codigo; // 'A', 'B', 'C'...
  final String titulo;
  final String? descricao;
  final int ordem;
  final String tipoSecao; // 'IDENTIFICACAO', 'VALIDACAO', 'DOCUMENTAL', 'OBJETIVA', 'MISTA'
  final bool bloqueante;
  final bool exigeFarmaceutico;
  final DateTime? criadoEm;
  List<Pergunta>? perguntas;

  Secao({
    required this.id,
    required this.questionarioId,
    required this.codigo,
    required this.titulo,
    this.descricao,
    required this.ordem,
    required this.tipoSecao,
    required this.bloqueante,
    required this.exigeFarmaceutico,
    this.criadoEm,
    this.perguntas,
  });

  factory Secao.fromJson(Map<String, dynamic> json) {
    return Secao(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      questionarioId: json['questionario_id'] is int 
          ? json['questionario_id'] 
          : int.parse(json['questionario_id'].toString()),
      codigo: json['codigo'],
      titulo: json['titulo'],
      descricao: json['descricao'],
      ordem: json['ordem'] is int ? json['ordem'] : int.parse(json['ordem'].toString()),
      tipoSecao: json['tipo_secao'],
      bloqueante: json['bloqueante'] == true || json['bloqueante'] == 1,
      exigeFarmaceutico: json['exige_farmaceutico'] == true || json['exige_farmaceutico'] == 1,
      criadoEm: json['criado_em'] != null 
          ? DateTime.parse(json['criado_em']) 
          : null,
      perguntas: json['perguntas'] != null
          ? (json['perguntas'] as List)
              .map((p) => Pergunta.fromJson(p))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'questionario_id': questionarioId,
      'codigo': codigo,
      'titulo': titulo,
      'descricao': descricao,
      'ordem': ordem,
      'tipo_secao': tipoSecao,
      'bloqueante': bloqueante,
      'exige_farmaceutico': exigeFarmaceutico,
      'criado_em': criadoEm?.toIso8601String(),
      'perguntas': perguntas?.map((p) => p.toJson()).toList(),
    };
  }

  bool get isIdentificacao => tipoSecao == 'IDENTIFICACAO';
  bool get isValidacao => tipoSecao == 'VALIDACAO';
  bool get isDocumental => tipoSecao == 'DOCUMENTAL';
  bool get isObjetiva => tipoSecao == 'OBJETIVA';
  bool get isMista => tipoSecao == 'MISTA';
}