import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/product_provider.dart';
import '../../providers/auth_provider.dart';
import 'product_detail_screen.dart';
import 'add_product_screen.dart';

class ProductListScreen extends StatefulWidget {
  const ProductListScreen({super.key});

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProductProvider>().loadProducts();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final prod = context.watch<ProductProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Produk')),
      body: RefreshIndicator(
        onRefresh: () => context.read<ProductProvider>().loadProducts(),
        child: prod.isLoading
            ? const Center(child: CircularProgressIndicator())
            : prod.products.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.inventory_2_outlined, size: 64, color: BatikTheme.textSecondary.withValues(alpha: 0.5)),
                        const SizedBox(height: 12),
                        const Text('Belum ada produk', style: TextStyle(color: BatikTheme.textSecondary)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: prod.products.length,
                    itemBuilder: (_, i) => _ProductCard(
                      product: prod.products[i],
                      onTap: () => Navigator.push(context, MaterialPageRoute(
                        builder: (_) => ProductDetailScreen(product: prod.products[i]),
                      )),
                    ),
                  ),
      ),
      floatingActionButton: auth.isLoggedIn
          ? FloatingActionButton(
              backgroundColor: BatikTheme.primary,
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddProductScreen())),
              child: const Icon(Icons.add, color: Colors.white),
            )
          : null,
    );
  }
}

class _ProductCard extends StatelessWidget {
  final dynamic product;
  final VoidCallback onTap;
  const _ProductCard({required this.product, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 60, height: 60,
                decoration: BoxDecoration(
                  color: BatikTheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  image: product.photoUrl != null
                      ? DecorationImage(image: NetworkImage(product.photoUrl!), fit: BoxFit.cover)
                      : null,
                ),
                child: product.photoUrl == null
                    ? const Icon(Icons.image_outlined, color: BatikTheme.textSecondary)
                    : null,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(product.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 4),
                    Text(product.producerName, style: const TextStyle(color: BatikTheme.textSecondary, fontSize: 13)),
                    const SizedBox(height: 4),
                    _StatusBadge(status: product.status),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: BatikTheme.textSecondary),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final colors = switch (status) {
      'CERTIFIED' => (BatikTheme.success, 'Tersertifikasi'),
      'REGISTERED' => (BatikTheme.accent, 'Terdaftar'),
      'REVOKED' => (BatikTheme.error, 'Dicabut'),
      _ => (BatikTheme.textSecondary, status),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(color: colors.$1.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
      child: Text(colors.$2, style: TextStyle(fontSize: 11, color: colors.$1, fontWeight: FontWeight.w600)),
    );
  }
}
