// models/inspecao.dart
import 'estabelecimento.dart';

export 'estabelecimento.dart';

class Inspecao {
  final int id;
  final int? estabelecimentoId;
  final String status;
  final String secaoAtual;
  final bool secaoBAprovada;
  final DateTime criadoEm;
  final DateTime? finalizadoEm;

  // Dados desnormalizados do JOIN
  final String? razaoSocial;
  final String? nomeFantasia;
  final String? cnpj;
  final String? fiscalNome;

  // Respostas organizadas por seção (só no detalhe)
  final Map<String, Map<String, String>>? respostas;

  Inspecao({
    required this.id,
    this.estabelecimentoId,
    required this.status,
    required this.secaoAtual,
    required this.secaoBAprovada,
    required this.criadoEm,
    this.finalizadoEm,
    this.razaoSocial,
    this.nomeFantasia,
    this.cnpj,
    this.fiscalNome,
    this.respostas,
  });

  factory Inspecao.fromJson(Map<String, dynamic> json) {
    Map<String, Map<String, String>>? respostas;
    if (json['respostas'] != null) {
      respostas = {};
      (json['respostas'] as Map<String, dynamic>).forEach((secao, campos) {
        respostas![secao] = Map<String, String>.from(
          (campos as Map<String, dynamic>).map((k, v) => MapEntry(k, v?.toString() ?? '')),
        );
      });
    }

    return Inspecao(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      estabelecimentoId: json['estabelecimento_id'] is int
          ? json['estabelecimento_id']
          : int.tryParse(json['estabelecimento_id']?.toString() ?? ''),
      status: json['status'] ?? 'EM_ANDAMENTO',
      secaoAtual: json['secao_atual'] ?? 'A',
      secaoBAprovada: json['secao_b_aprovada'] == true,
      criadoEm: DateTime.parse(json['criado_em']),
      finalizadoEm: json['finalizado_em'] != null ? DateTime.parse(json['finalizado_em']) : null,
      razaoSocial: json['razao_social'],
      nomeFantasia: json['nome_fantasia'],
      cnpj: json['cnpj'],
      fiscalNome: json['fiscal_nome'],
      respostas: respostas,
    );
  }

  String get nomeExibicao =>
      nomeFantasia?.isNotEmpty == true ? nomeFantasia! : razaoSocial ?? 'Inspeção #$id';
}