import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/product_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/dashboard/main_shell.dart';
import 'screens/scanner/scanner_screen.dart';
import 'screens/scanner/verification_result_screen.dart';

void main() {
  runApp(const BatikChainApp());
}

class BatikChainApp extends StatelessWidget {
  const BatikChainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ProductProvider()),
      ],
      child: MaterialApp(
        title: 'BatikChain',
        debugShowCheckedModeBanner: false,
        theme: BatikTheme.lightTheme,
        initialRoute: '/login',
        routes: {
          '/login': (_) => const LoginScreen(),
          '/register': (_) => const RegisterScreen(),
          '/home': (_) => const MainShell(),
          '/scanner': (_) => const ScannerScreen(),
        },
        onGenerateRoute: (settings) {
          if (settings.name == '/verification') {
            final args = settings.arguments as Map<String, dynamic>;
            return MaterialPageRoute(
              builder: (_) => VerificationResultScreen(
                tokenId: args['tokenId'],
                metadataHash: args['metadataHash'],
              ),
            );
          }
          return null;
        },
      ),
    );
  }
}
