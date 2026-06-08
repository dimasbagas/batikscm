import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(title: const Text('Profil')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const SizedBox(height: 20),
          CircleAvatar(
            radius: 48,
            backgroundColor: BatikTheme.primary,
            child: Text(
              (user?.name ?? 'U').substring(0, 1).toUpperCase(),
              style: const TextStyle(fontSize: 36, color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 12),
          Text(user?.name ?? 'Pengunjung', textAlign: TextAlign.center, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(user?.email ?? '', textAlign: TextAlign.center, style: const TextStyle(color: BatikTheme.textSecondary)),
          const SizedBox(height: 20),
          Card(
            child: Column(
              children: [
                _MenuItem(icon: Icons.person_outline, title: 'Edit Profil', onTap: () {}),
                const Divider(height: 1),
                _MenuItem(icon: Icons.settings_outlined, title: 'Pengaturan', onTap: () {}),
                const Divider(height: 1),
                _MenuItem(icon: Icons.info_outline, title: 'Tentang', onTap: () {}),
              ],
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () async {
                await auth.logout();
                if (context.mounted) Navigator.pushReplacementNamed(context, '/login');
              },
              icon: const Icon(Icons.logout, color: BatikTheme.error),
              label: const Text('Keluar', style: TextStyle(color: BatikTheme.error)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: BatikTheme.error),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  const _MenuItem({required this.icon, required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: BatikTheme.primary),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
