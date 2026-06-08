import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _api = ApiService();

  Future<User> login(String email, String password) async {
    final res = await _api.post('/auth/login', {
      'email': email,
      'password': password,
    }, auth: false);

    final token = res['access_token'] ?? res['token'];
    final userData = res['user'] ?? res;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);

    return User.fromJson(userData);
  }

  Future<User> register(String email, String password, String name) async {
    final res = await _api.post('/auth/register', {
      'email': email,
      'password': password,
      'name': name,
    }, auth: false);

    final userData = res['user'] ?? res;
    final token = res['access_token'] ?? res['token'];
    if (token != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', token);
    }

    return User.fromJson(userData);
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    return token != null && token.isNotEmpty;
  }

  Future<User?> getSavedUser() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString('user_data');
    if (data == null) return null;
    return User.fromJson({'id': 0, 'email': '', 'name': '', 'role': 'VISITOR'});
  }
}
