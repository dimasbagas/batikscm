import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/product_provider.dart';

class AddProductScreen extends StatefulWidget {
  const AddProductScreen({super.key});

  @override
  State<AddProductScreen> createState() => _AddProductScreenState();
}

class _AddProductScreenState extends State<AddProductScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _producerCtrl = TextEditingController();
  final _regionCtrl = TextEditingController();

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _producerCtrl.dispose();
    _regionCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final prod = context.read<ProductProvider>();
    final ok = await prod.createProduct({
      'name': _nameCtrl.text.trim(),
      'description': _descCtrl.text.trim(),
      'producerName': _producerCtrl.text.trim(),
      'originRegion': _regionCtrl.text.trim(),
      'status': 'REGISTERED',
    });
    if (!mounted) return;
    if (ok) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Produk berhasil ditambahkan'), backgroundColor: BatikTheme.success),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(prod.error ?? 'Gagal menambahkan produk'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tambah Produk')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Nama Produk'), validator: (v) => v == null || v.isEmpty ? 'Wajib diisi' : null),
              const SizedBox(height: 16),
              TextFormField(controller: _descCtrl, decoration: const InputDecoration(labelText: 'Deskripsi'), maxLines: 3),
              const SizedBox(height: 16),
              TextFormField(controller: _producerCtrl, decoration: const InputDecoration(labelText: 'Nama Produsen'), validator: (v) => v == null || v.isEmpty ? 'Wajib diisi' : null),
              const SizedBox(height: 16),
              TextFormField(controller: _regionCtrl, decoration: const InputDecoration(labelText: 'Asal Daerah'), validator: (v) => v == null || v.isEmpty ? 'Wajib diisi' : null),
              const SizedBox(height: 24),
              Consumer<ProductProvider>(
                builder: (_, prod, __) => SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: prod.isLoading ? null : _submit,
                    child: prod.isLoading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('Simpan'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
