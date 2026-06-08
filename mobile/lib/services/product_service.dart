import '../models/product.dart';
import 'api_service.dart';

class ProductService {
  final ApiService _api = ApiService();

  Future<ProductListResponse> getProducts({int page = 1, int limit = 20}) async {
    final res = await _api.get('/products?page=$page&limit=$limit');
    return ProductListResponse.fromJson(res);
  }

  Future<Product> getProduct(int id) async {
    final res = await _api.get('/products/$id');
    return Product.fromJson(res['data'] ?? res);
  }

  Future<Product> createProduct(Map<String, dynamic> data) async {
    final res = await _api.post('/products', data);
    return Product.fromJson(res['data'] ?? res);
  }

  Future<Product> updateProduct(int id, Map<String, dynamic> data) async {
    final res = await _api.put('/products/$id', data);
    return Product.fromJson(res['data'] ?? res);
  }

  Future<void> deleteProduct(int id) async {
    await _api.delete('/products/$id');
  }
}
