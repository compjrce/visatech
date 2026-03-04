import 'secao.dart';

class Questionario {
  final int id;
  final String titulo;
  final String? descricao;
  final String? tipo;
  final String? versao;
  final bool ativo;
  final DateTime? criadoEm;
  final int? totalSecoes;
  List<Secao>? secoes;

  Questionario({
    required this.id,
    required this.titulo,
    this.descricao,
    this.tipo,
    this.versao,
    required this.ativo,
    this.criadoEm,
    this.totalSecoes,
    this.secoes,
  });

  factory Questionario.fromJson(Map<String, dynamic> json) {
    return Questionario(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      titulo: json['titulo'],
      descricao: json['descricao'],
      tipo: json['tipo'],
      versao: json['versao'],
      ativo: json['ativo'] == true || json['ativo'] == 1,
      criadoEm: json['criado_em'] != null 
          ? DateTime.parse(json['criado_em']) 
          : null,
      totalSecoes: json['total_secoes'] is int
          ? json['total_secoes']
          : (json['total_secoes'] != null ? int.tryParse(json['total_secoes'].toString()) : null),
      secoes: json['secoes'] != null
          ? (json['secoes'] as List)
              .map((s) => Secao.fromJson(s))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'titulo': titulo,
      'descricao': descricao,
      'tipo': tipo,
      'versao': versao,
      'ativo': ativo,
      'criado_em': criadoEm?.toIso8601String(),
      'total_secoes': totalSecoes,
      'secoes': secoes?.map((s) => s.toJson()).toList(),
    };
  }
}