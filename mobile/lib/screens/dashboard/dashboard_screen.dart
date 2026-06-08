import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('BatikChain'),
        actions: [
          IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () {}),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {},
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _GreetingCard(user: user),
              const SizedBox(height: 20),
              if (user?.isUmkm == true || user?.isAdmin == true) ...[
                _SectionHeader(title: 'Ringkasan'),
                const SizedBox(height: 12),
                _StatGrid(),
                const SizedBox(height: 20),
              ],
              _SectionHeader(title: 'Fitur'),
              const SizedBox(height: 12),
              _FeatureGrid(),
            ],
          ),
        ),
      ),
    );
  }
}

class _GreetingCard extends StatelessWidget {
  final dynamic user;
  const _GreetingCard({this.user});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [BatikTheme.primary, BatikTheme.primaryLight]),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Halo, ${user?.name ?? 'Pengunjung'}!', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(user != null ? 'Selamat datang di BatikChain' : 'Scan QR untuk verifikasi produk batik', style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 14)),
          const SizedBox(height: 16),
          Row(
            children: [
              _Chip(label: user?.role ?? 'VISITOR', icon: Icons.badge_outlined),
              const SizedBox(width: 8),
              _Chip(label: 'BatikChain', icon: Icons.diamond),
            ],
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final IconData icon;
  const _Chip({required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(20)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [Icon(icon, size: 14, color: Colors.white), const SizedBox(width: 6), Text(label, style: const TextStyle(color: Colors.white, fontSize: 12))],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: BatikTheme.textPrimary));
  }
}

class _StatGrid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _StatCard(title: 'Produk', value: '0', icon: Icons.inventory_2, color: BatikTheme.primary),
        const SizedBox(width: 12),
        _StatCard(title: 'Sertifikat', value: '0', icon: Icons.verified, color: BatikTheme.accent),
        const SizedBox(width: 12),
        _StatCard(title: 'Scan', value: '0', icon: Icons.qr_code_scanner, color: BatikTheme.success),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title, value;
  final IconData icon;
  final Color color;
  const _StatCard({required this.title, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Icon(icon, color: color, size: 28),
              const SizedBox(height: 8),
              Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color)),
              const SizedBox(height: 4),
              Text(title, style: const TextStyle(color: BatikTheme.textSecondary, fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }
}

class _FeatureGrid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(child: _FeatureCard(title: 'Produk Saya', icon: Icons.inventory_2, color: BatikTheme.primary, onTap: () {})),
            const SizedBox(width: 12),
            Expanded(child: _FeatureCard(title: 'Sertifikat', icon: Icons.verified, color: BatikTheme.accent, onTap: () {})),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _FeatureCard(title: 'Scan QR', icon: Icons.qr_code_scanner, color: BatikTheme.success, onTap: () {})),
            const SizedBox(width: 12),
            Expanded(child: _FeatureCard(title: 'Verifikasi', icon: Icons.search, color: BatikTheme.primaryDark, onTap: () {})),
          ],
        ),
      ],
    );
  }
}

class _FeatureCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  const _FeatureCard({required this.title, required this.icon, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Icon(icon, color: color, size: 36),
              const SizedBox(height: 8),
              Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }
}
