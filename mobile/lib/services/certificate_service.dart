import '../models/certificate.dart';
import 'api_service.dart';

class CertificateService {
  final ApiService _api = ApiService();

  Future<List<Certificate>> getCertificates() async {
    final res = await _api.get('/certificates');
    final data = res['data'] ?? res;
    if (data is List) {
      return data.map((e) => Certificate.fromJson(e)).toList();
    }
    return [];
  }

  Future<Certificate> mintCertificate(int productId) async {
    final res = await _api.post('/certificates/mint', {'productId': productId});
    return Certificate.fromJson(res['data'] ?? res);
  }

  Future<VerificationResult> verifyProduct(String tokenIdOrHash) async {
    final res = await _api.get('/verification/$tokenIdOrHash', auth: false);
    return VerificationResult.fromJson(res['data'] ?? res);
  }

  Future<VerificationResult> verifyByQr(String qrData) async {
    final res = await _api.post('/verification/qr', {'qrData': qrData}, auth: false);
    return VerificationResult.fromJson(res['data'] ?? res);
  }
}
