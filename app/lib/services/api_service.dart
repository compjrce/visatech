import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user.dart';
import '../models/questionario.dart';
import '../models/resposta.dart';

class ApiService {
  static const String baseUrl = 'https://visatech-backend.onrender.com/api';

  String? _token;

  void setToken(String token) => _token = token;
  void clearToken() => _token = null;

  Map<String, String> get _headers {
    final headers = {'Content-Type': 'application/json'};
    if (_token != null) headers['Authorization'] = 'Bearer $_token';
    return headers;
  }

  // ==================== AUTENTICAÇÃO ====================

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      _token = data['token'];
      return {'token': data['token'], 'user': User.fromJson(data['user'])};
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Erro ao fazer login');
    }
  }

  // ==================== QUESTIONÁRIOS ====================

  Future<List<Questionario>> getQuestionarios() async {
    final response = await http.get(
      Uri.parse('$baseUrl/questionarios'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body);
      return data.map((q) => Questionario.fromJson(q)).toList();
    } else {
      throw Exception('Erro ao buscar questionários');
    }
  }

  // Usa o endpoint /completo que retorna seções + perguntas
  Future<Questionario> getQuestionario(int id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/questionarios/$id/completo'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return Questionario.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Erro ao buscar questionário');
    }
  }

  // ==================== INSPEÇÕES ====================

  Future<Map<String, dynamic>> criarInspecao({
    required int questionarioId,
    required int estabelecimentoId,
    String? tipoInspecao,
    Map<String, dynamic>? dadosSecaoA,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/inspecoes'),
      headers: _headers,
      body: jsonEncode({
        'questionario_id': questionarioId,
        'estabelecimento_id': estabelecimentoId,
        'tipo_inspecao': tipoInspecao,
        'dados_secao_a': dadosSecaoA,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Erro ao criar inspeção');
    }
  }

  Future<Map<String, dynamic>> validarSecaoB(
    int inspecaoId,
    List<Resposta> respostas,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/inspecoes/$inspecaoId/validar-secao-b'),
      headers: _headers,
      body: jsonEncode({
        'respostas': respostas.map((r) => r.toJson()).toList(),
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Erro ao validar Seção B');
    }
  }

  Future<void> salvarRespostasSecao(
    int inspecaoId,
    String secaoCodigo,
    List<Resposta> respostas,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/inspecoes/$inspecaoId/secao/$secaoCodigo/respostas'),
      headers: _headers,
      body: jsonEncode({
        'respostas': respostas.map((r) => r.toJson()).toList(),
      }),
    );

    if (response.statusCode != 200) {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Erro ao salvar respostas');
    }
  }

  Future<Map<String, dynamic>> finalizarInspecao(
    int inspecaoId, {
    String? observacoesGerais,
  }) async {
    final response = await http.put(
      Uri.parse('$baseUrl/inspecoes/$inspecaoId/finalizar'),
      headers: _headers,
      body: jsonEncode({'observacoes_gerais': observacoesGerais}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Erro ao finalizar inspeção');
    }
  }

  Future<List<dynamic>> getAuditorias() async {
    final response = await http.get(
      Uri.parse('$baseUrl/inspecoes'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar inspeções');
    }
  }

  Future<Map<String, dynamic>> getAuditoria(int id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/inspecoes/$id'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar inspeção');
    }
  }

  // ==================== ESTABELECIMENTOS ====================

  Future<List<dynamic>> getEstabelecimentos() async {
    final response = await http.get(
      Uri.parse('$baseUrl/estabelecimentos'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar estabelecimentos');
    }
  }
}