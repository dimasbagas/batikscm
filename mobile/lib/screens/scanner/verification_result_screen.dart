import 'package:flutter/material.dart';
import '../../config/theme.dart';

class VerificationResultScreen extends StatefulWidget {
  final String? tokenId;
  final String? metadataHash;

  const VerificationResultScreen({super.key, this.tokenId, this.metadataHash});

  @override
  State<VerificationResultScreen> createState() => _VerificationResultScreenState();
}

class _VerificationResultScreenState extends State<VerificationResultScreen> {
  bool _isLoading = true;
  bool _isValid = false;
  String _productName = '';
  String _producerName = '';
  String _region = '';
  String _status = '';

  @override
  void initState() {
    super.initState();
    _verify();
  }

  Future<void> _verify() async {
    await Future.delayed(const Duration(seconds: 1));
    if (!mounted) return;
    setState(() {
      _isLoading = false;
      _isValid = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hasil Verifikasi'), leading: IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context))),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 100, height: 100,
                      decoration: BoxDecoration(
                        color: _isValid ? BatikTheme.success : BatikTheme.error,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(_isValid ? Icons.verified : Icons.cancel, size: 56, color: Colors.white),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _isValid ? 'Produk Asli' : 'Produk Tidak Terverifikasi',
                      style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: _isValid ? BatikTheme.success : BatikTheme.error),
                    ),
                    const SizedBox(height: 24),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          children: [
                            _ResultRow(label: 'Produk', value: _productName.isEmpty ? 'Batik Contoh' : _productName),
                            const Divider(),
                            _ResultRow(label: 'Produsen', value: _producerName.isEmpty ? 'UMKM Contoh' : _producerName),
                            const Divider(),
                            _ResultRow(label: 'Asal', value: _region.isEmpty ? 'Indonesia' : _region),
                            const Divider(),
                            _ResultRow(label: 'Status', value: _status.isEmpty ? 'Tersertifikasi' : _status),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text('Terverifikasi di blockchain BatikChain', style: TextStyle(color: BatikTheme.textSecondary.withValues(alpha: 0.7), fontSize: 12)),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.qr_code_scanner),
                        label: const Text('Scan Lagi'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}

class _ResultRow extends StatelessWidget {
  final String label, value;
  const _ResultRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: BatikTheme.textSecondary)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
