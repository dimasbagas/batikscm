class Certificate {
  final int id;
  final int productId;
  final String tokenId;
  final String productName;
  final String producerName;
  final String metadataHash;
  final String? qrDataUrl;
  final bool isValid;
  final String mintedAt;

  Certificate({
    required this.id,
    required this.productId,
    required this.tokenId,
    required this.productName,
    required this.producerName,
    required this.metadataHash,
    this.qrDataUrl,
    required this.isValid,
    required this.mintedAt,
  });

  factory Certificate.fromJson(Map<String, dynamic> json) => Certificate(
        id: json['id'],
        productId: json['productId'] ?? json['product_id'] ?? 0,
        tokenId: json['tokenId']?.toString() ?? json['token_id'] ?? '',
        productName: json['productName'] ?? json['name'] ?? '',
        producerName: json['producerName'] ?? json['producer'] ?? '',
        metadataHash: json['metadataHash'] ?? json['hash'] ?? '',
        qrDataUrl: json['qrDataUrl'] ?? json['qr_url'],
        isValid: json['isValid'] ?? json['is_valid'] ?? true,
        mintedAt: json['mintedAt'] ?? json['minted_at'] ?? DateTime.now().toIso8601String(),
      );
}

class VerificationResult {
  final bool isValid;
  final String productName;
  final String producerName;
  final String originRegion;
  final String status;
  final int totalScans;

  VerificationResult({
    required this.isValid,
    required this.productName,
    required this.producerName,
    required this.originRegion,
    required this.status,
    required this.totalScans,
  });

  factory VerificationResult.fromJson(Map<String, dynamic> json) =>
      VerificationResult(
        isValid: json['isValid'] ?? json['valid'] ?? false,
        productName: json['productName'] ?? '',
        producerName: json['producerName'] ?? '',
        originRegion: json['originRegion'] ?? '',
        status: json['status'] ?? '',
        totalScans: json['totalScans'] ?? json['scans'] ?? 0,
      );
}
