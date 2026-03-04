class User {
  final int id;
  final String email;
  final String? nome;
  final String role;
  final int? estabelecimentoId;

  User({
    required this.id,
    required this.email,
    this.nome,
    required this.role,
    this.estabelecimentoId,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      email: json['email'],
      nome: json['nome'],
      role: json['role'],
      estabelecimentoId: json['estabelecimento_id'] is int
          ? json['estabelecimento_id']
          : (json['estabelecimento_id'] != null ? int.tryParse(json['estabelecimento_id'].toString()) : null),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'nome': nome,
      'role': role,
      'estabelecimento_id': estabelecimentoId,
    };
  }

  bool get isAdmin => role == 'admin';
  bool get isAuditor => role == 'auditor';
  bool get isFiscal => role == 'fiscal';
}