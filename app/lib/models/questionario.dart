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
  final int? estabelecimentoId;

  // Dados do estabelecimento vinculado (retornados pelo /completo)
  final String? razaoSocial;
  final String? nomeFantasia;
  final String? cnpj;
  final String? endereco;
  final String? telefone;
  final String? email;

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
    this.estabelecimentoId,
    this.razaoSocial,
    this.nomeFantasia,
    this.cnpj,
    this.endereco,
    this.telefone,
    this.email,
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
      criadoEm: json['criado_em'] != null ? DateTime.parse(json['criado_em']) : null,
      totalSecoes: json['total_secoes'] is int
          ? json['total_secoes']
          : (json['total_secoes'] != null
              ? int.tryParse(json['total_secoes'].toString())
              : null),
      estabelecimentoId: json['estabelecimento_id'] is int
          ? json['estabelecimento_id']
          : (json['estabelecimento_id'] != null
              ? int.tryParse(json['estabelecimento_id'].toString())
              : null),
      razaoSocial: json['razao_social'],
      nomeFantasia: json['nome_fantasia'],
      cnpj: json['cnpj'],
      endereco: json['endereco'],
      telefone: json['telefone'],
      email: json['email'],
      secoes: json['secoes'] != null
          ? (json['secoes'] as List).map((s) => Secao.fromJson(s)).toList()
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
      'estabelecimento_id': estabelecimentoId,
      'razao_social': razaoSocial,
      'nome_fantasia': nomeFantasia,
      'cnpj': cnpj,
      'endereco': endereco,
      'telefone': telefone,
      'email': email,
      'secoes': secoes?.map((s) => s.toJson()).toList(),
    };
  }
}