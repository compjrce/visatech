import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import '../models/user.dart';
import 'api_service.dart';

class AuthService {
  final FlutterSecureStorage _storage = FlutterSecureStorage();
  final ApiService _apiService = ApiService();
  
  User? _currentUser;
  String? _token;

  User? get currentUser => _currentUser;
  bool get isAuthenticated => _token != null && _currentUser != null;

  // Login
  Future<void> login(String email, String password) async {
    try {
      final result = await _apiService.login(email, password);
      
      _token = result['token'];
      _currentUser = result['user'];
      
      // Salvar token e usuário
      await _storage.write(key: 'auth_token', value: _token);
      await _storage.write(key: 'user_data', value: jsonEncode(_currentUser!.toJson()));
      
      _apiService.setToken(_token!);
    } catch (e) {
      throw Exception('Erro ao fazer login: $e');
    }
  }

  // Logout
  Future<void> logout() async {
    _token = null;
    _currentUser = null;
    _apiService.clearToken();
    
    await _storage.delete(key: 'auth_token');
    await _storage.delete(key: 'user_data');
  }

  // Verificar se está autenticado
  Future<bool> checkAuth() async {
    try {
      final token = await _storage.read(key: 'auth_token');
      final userData = await _storage.read(key: 'user_data');
      
      if (token != null && userData != null) {
        _token = token;
        _currentUser = User.fromJson(jsonDecode(userData));
        _apiService.setToken(token);
        return true;
      }
      
      return false;
    } catch (e) {
      return false;
    }
  }

  ApiService get apiService => _apiService;
}