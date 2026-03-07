// services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/inspecao.dart';

class ApiService {
  static const String baseUrl = 'https://visatech-backend.onrender.com/api';

  String? _token;

  void setToken(String token) => _token = token;
  void clearToken() => _token = null;
  bool get hasToken => _token != null;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  // ── helper ──
  Map<String, dynamic> _parseResponse(http.Response res) {
    final body = jsonDecode(res.body);
    if (res.statusCode >= 400) {
      throw Exception(body['error'] ?? 'Erro ${res.statusCode}');
    }
    return body is Map<String, dynamic> ? body : {'data': body};
  }

  // ============================================================
  // AUTH
  // ============================================================

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    final data = _parseResponse(res);
    _token = data['token'];
    return data;
  }

  // ============================================================
  // ESTABELECIMENTOS
  // ============================================================

  // Busca estabelecimento pelo CNPJ (só dígitos ou formatado)
  Future<Estabelecimento?> buscarPorCnpj(String cnpj) async {
    final cnpjLimpo = cnpj.replaceAll(RegExp(r'\D'), '');
    final res = await http.get(
      Uri.parse('$baseUrl/estabelecimentos/cnpj/$cnpjLimpo'),
      headers: _headers,
    );
    if (res.statusCode == 404) return null;
    return Estabelecimento.fromJson(_parseResponse(res));
  }

  Future<List<Estabelecimento>> listarEstabelecimentos() async {
    final res = await http.get(
      Uri.parse('$baseUrl/estabelecimentos'),
      headers: _headers,
    );
    final List data = jsonDecode(res.body);
    return data.map((e) => Estabelecimento.fromJson(e)).toList();
  }

  // ============================================================
  // INSPEÇÕES
  // ============================================================

  Future<List<Inspecao>> listarInspecoes() async {
    final res = await http.get(
      Uri.parse('$baseUrl/inspecoes'),
      headers: _headers,
    );
    final List data = jsonDecode(res.body);
    return data.map((i) => Inspecao.fromJson(i)).toList();
  }

  Future<Inspecao> detalheInspecao(int id) async {
    final res = await http.get(
      Uri.parse('$baseUrl/inspecoes/$id'),
      headers: _headers,
    );
    return Inspecao.fromJson(_parseResponse(res));
  }

  // Cria inspeção.
  // Se o estabelecimento já existir no banco, passa só o estabelecimento_id.
  // Se for novo, passa os dados completos e o backend cria.
  Future<Inspecao> criarInspecao({
    int? estabelecimentoId,
    String? razaoSocial,
    String? nomeFantasia,
    required String cnpj,
    String? endereco,
    String? telefone,
    String? email,
  }) async {
    final body = <String, dynamic>{'cnpj': cnpj};
    if (estabelecimentoId != null) {
      body['estabelecimento_id'] = estabelecimentoId;
    } else {
      body['razao_social'] = razaoSocial;
      if (nomeFantasia != null) body['nome_fantasia'] = nomeFantasia;
      if (endereco != null) body['endereco'] = endereco;
      if (telefone != null) body['telefone'] = telefone;
      if (email != null) body['email'] = email;
    }

    final res = await http.post(
      Uri.parse('$baseUrl/inspecoes'),
      headers: _headers,
      body: jsonEncode(body),
    );
    return Inspecao.fromJson(_parseResponse(res));
  }

  // Salva respostas de uma seção (upsert).
  // Retorna o novo status e se seção B foi aprovada.
  Future<Map<String, dynamic>> salvarRespostas(
    int inspecaoId,
    String secao,
    Map<String, String?> respostas,
  ) async {
    final res = await http.post(
      Uri.parse('$baseUrl/inspecoes/$inspecaoId/respostas'),
      headers: _headers,
      body: jsonEncode({'secao': secao, 'respostas': respostas}),
    );
    return _parseResponse(res);
  }

  Future<Inspecao> finalizarInspecao(int id) async {
    final res = await http.put(
      Uri.parse('$baseUrl/inspecoes/$id/finalizar'),
      headers: _headers,
    );
    return Inspecao.fromJson(_parseResponse(res));
  }

  // ============================================================
  // INVENTÁRIO (Seção H)
  // ============================================================

  Future<void> salvarInventario(
    int inspecaoId,
    List<Map<String, dynamic>> itens,
  ) async {
    final res = await http.post(
      Uri.parse('$baseUrl/inspecoes/$inspecaoId/inventario'),
      headers: _headers,
      body: jsonEncode({'itens': itens}),
    );
    _parseResponse(res);
  }
}