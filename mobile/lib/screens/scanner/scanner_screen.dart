import 'package:flutter/material.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import '../../config/theme.dart';
import '../../services/certificate_service.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final GlobalKey _qrKey = GlobalKey(debugLabel: 'QR');
  QRViewController? _controller;
  bool _isProcessing = false;

  @override
  void reassemble() {
    super.reassemble();
    _controller?.resumeCamera();
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  void _onQRViewCreated(QRViewController controller) {
    _controller = controller;
    controller.scannedDataStream.listen((barcode) {
      if (_isProcessing || barcode.code == null) return;
      _isProcessing = true;
      controller.pauseCamera();
      _verifyQr(barcode.code!);
    });
  }

  Future<void> _verifyQr(String qrData) async {
    try {
      final certService = CertificateService();
      await certService.verifyByQr(qrData);
      if (!mounted) return;
      Navigator.pushNamed(context, '/verification', arguments: {
        'tokenId': qrData,
        'metadataHash': '',
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Verifikasi gagal: $e'), backgroundColor: Colors.red),
      );
    } finally {
      _isProcessing = false;
      _controller?.resumeCamera();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scan QR')),
      body: Column(
        children: [
          Expanded(
            flex: 4,
            child: Stack(
              children: [
                QRView(key: _qrKey, onQRViewCreated: _onQRViewCreated),
                Center(
                  child: Container(
                    width: 250, height: 250,
                    decoration: BoxDecoration(
                      border: Border.all(color: BatikTheme.accent, width: 3),
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 1,
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.qr_code_scanner, size: 40, color: BatikTheme.primary),
                  const SizedBox(height: 8),
                  const Text('Arahkan kamera ke QR Code', style: TextStyle(color: BatikTheme.textSecondary)),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () => _controller?.resumeCamera(),
                    icon: const Icon(Icons.refresh),
                    label: const Text('Scan Ulang'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
