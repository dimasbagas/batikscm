import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._();
  factory ApiService() => _instance;
  ApiService._();

  String? _token;

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
  }

  Future<Map<String, String>> _headers({bool auth = true}) async {
    if (auth) await _loadToken();
    return {
      'Content-Type': 'application/json',
      if (auth && _token != null) 'Authorization': 'Bearer $_token',
    };
  }

  Future<dynamic> get(String endpoint, {bool auth = true}) async {
    final url = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    try {
      final response = await http.get(url, headers: await _headers(auth: auth))
          .timeout(ApiConfig.timeout);
      return _handleResponse(response);
    } catch (e) {
      throw ApiException('Koneksi gagal: $e');
    }
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> body,
      {bool auth = true}) async {
    final url = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    try {
      final response = await http
          .post(url, headers: await _headers(auth: auth), body: jsonEncode(body))
          .timeout(ApiConfig.timeout);
      return _handleResponse(response);
    } catch (e) {
      throw ApiException('Koneksi gagal: $e');
    }
  }

  Future<dynamic> put(String endpoint, Map<String, dynamic> body,
      {bool auth = true}) async {
    final url = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    try {
      final response = await http
          .put(url, headers: await _headers(auth: auth), body: jsonEncode(body))
          .timeout(ApiConfig.timeout);
      return _handleResponse(response);
    } catch (e) {
      throw ApiException('Koneksi gagal: $e');
    }
  }

  Future<dynamic> delete(String endpoint, {bool auth = true}) async {
    final url = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    try {
      final response =
          await http.delete(url, headers: await _headers(auth: auth))
              .timeout(ApiConfig.timeout);
      return _handleResponse(response);
    } catch (e) {
      throw ApiException('Koneksi gagal: $e');
    }
  }

  dynamic _handleResponse(http.Response response) {
    final body = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }
    final message = body['message'] ?? body['error'] ?? 'Terjadi kesalahan';
    throw ApiException(message, statusCode: response.statusCode);
  }
}

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, {this.statusCode});

  @override
  String toString() => message;
}
