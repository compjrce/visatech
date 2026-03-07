// models/estabelecimento.dart

class Estabelecimento {
  final int? id;
  final String razaoSocial;
  final String? nomeFantasia;
  final String cnpj;
  final String? endereco;
  final String? telefone;
  final String? email;

  Estabelecimento({
    this.id,
    required this.razaoSocial,
    this.nomeFantasia,
    required this.cnpj,
    this.endereco,
    this.telefone,
    this.email,
  });

  factory Estabelecimento.fromJson(Map<String, dynamic> json) {
    return Estabelecimento(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()),
      razaoSocial: json['razao_social'] ?? '',
      nomeFantasia: json['nome_fantasia'],
      cnpj: json['cnpj'] ?? '',
      endereco: json['endereco'],
      telefone: json['telefone'],
      email: json['email'],
    );
  }

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        'razao_social': razaoSocial,
        if (nomeFantasia != null) 'nome_fantasia': nomeFantasia,
        'cnpj': cnpj,
        if (endereco != null) 'endereco': endereco,
        if (telefone != null) 'telefone': telefone,
        if (email != null) 'email': email,
      };

  String get nomeExibicao =>
      nomeFantasia?.isNotEmpty == true ? nomeFantasia! : razaoSocial;
}