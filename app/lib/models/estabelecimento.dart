class Estabelecimento {
  final int id;
  final String razaoSocial;
  final String? nomeFantasia;
  final String cnpj;
  final String? endereco;
  final String? telefone;
  final String? email;
  final bool ativo;
  final DateTime? criadoEm;

  Estabelecimento({
    required this.id,
    required this.razaoSocial,
    this.nomeFantasia,
    required this.cnpj,
    this.endereco,
    this.telefone,
    this.email,
    required this.ativo,
    this.criadoEm,
  });

  factory Estabelecimento.fromJson(Map<String, dynamic> json) {
    return Estabelecimento(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      razaoSocial: json['razao_social'],
      nomeFantasia: json['nome_fantasia'],
      cnpj: json['cnpj'],
      endereco: json['endereco'],
      telefone: json['telefone'],
      email: json['email'],
      ativo: json['ativo'] == true || json['ativo'] == 1,
      criadoEm: json['criado_em'] != null 
          ? DateTime.parse(json['criado_em']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'razao_social': razaoSocial,
      'nome_fantasia': nomeFantasia,
      'cnpj': cnpj,
      'endereco': endereco,
      'telefone': telefone,
      'email': email,
      'ativo': ativo,
      'criado_em': criadoEm?.toIso8601String(),
    };
  }
}