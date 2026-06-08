class Product {
  final int id;
  final String name;
  final String description;
  final String producerName;
  final String originRegion;
  final String status;
  final String? photoUrl;
  final String? metadataHash;
  final String? tokenId;
  final String createdAt;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.producerName,
    required this.originRegion,
    required this.status,
    this.photoUrl,
    this.metadataHash,
    this.tokenId,
    required this.createdAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json['id'],
        name: json['name'] ?? json['productName'] ?? '',
        description: json['description'] ?? '',
        producerName: json['producerName'] ?? json['producer'] ?? '',
        originRegion: json['originRegion'] ?? json['origin'] ?? '',
        status: json['status'] ?? 'DRAFT',
        photoUrl: json['photoUrl'],
        metadataHash: json['metadataHash'],
        tokenId: json['tokenId']?.toString(),
        createdAt: json['createdAt'] ?? DateTime.now().toIso8601String(),
      );

  Map<String, dynamic> toJson() => {
        'name': name,
        'description': description,
        'producerName': producerName,
        'originRegion': originRegion,
        'status': status,
        'photoUrl': photoUrl,
        'metadataHash': metadataHash,
      };

  String get statusLabel {
    switch (status) {
      case 'REGISTERED':
        return 'Terdaftar';
      case 'CERTIFIED':
        return 'Tersertifikasi';
      case 'REVOKED':
        return 'Dicabut';
      default:
        return status;
    }
  }
}

class ProductListResponse {
  final List<Product> products;
  final int total;

  ProductListResponse({required this.products, required this.total});

  factory ProductListResponse.fromJson(Map<String, dynamic> json) {
    final data = json['data'] ?? json;
    if (data is List) {
      return ProductListResponse(
        products: data.map((e) => Product.fromJson(e)).toList(),
        total: data.length,
      );
    }
    return ProductListResponse(
      products: (data['products'] ?? data['items'] ?? [])
          .map<Product>((e) => Product.fromJson(e))
          .toList(),
      total: data['total'] ?? 0,
    );
  }
}
