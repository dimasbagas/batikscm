import 'package:flutter/material.dart';
import '../../config/theme.dart';

class ProductDetailScreen extends StatelessWidget {
  final dynamic product;
  const ProductDetailScreen({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(product.name ?? 'Detail Produk')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                color: BatikTheme.surface,
                borderRadius: BorderRadius.circular(16),
                image: product.photoUrl != null
                    ? DecorationImage(image: NetworkImage(product.photoUrl!), fit: BoxFit.cover)
                    : null,
              ),
              child: product.photoUrl == null
                  ? const Center(child: Icon(Icons.image_outlined, size: 64, color: BatikTheme.textSecondary))
                  : null,
            ),
            const SizedBox(height: 20),
            Text(product.name ?? '', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            _InfoRow(label: 'Produsen', value: product.producerName ?? '-'),
            _InfoRow(label: 'Asal', value: product.originRegion ?? '-'),
            _InfoRow(label: 'Status', value: product.statusLabel ?? product.status ?? '-'),
            if (product.metadataHash != null) _InfoRow(label: 'Hash', value: product.metadataHash, isHash: true),
            if (product.tokenId != null) _InfoRow(label: 'Token ID', value: product.tokenId.toString()),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label, value;
  final bool isHash;
  const _InfoRow({required this.label, required this.value, this.isHash = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 80, child: Text(label, style: const TextStyle(color: BatikTheme.textSecondary, fontWeight: FontWeight.w500))),
          const SizedBox(width: 12),
          Expanded(
            child: Text(value, style: TextStyle(fontSize: isHash ? 11 : 14, fontFamily: isHash ? 'monospace' : null)),
          ),
        ],
      ),
    );
  }
}
