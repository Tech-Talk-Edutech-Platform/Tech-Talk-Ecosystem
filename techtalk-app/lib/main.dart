
import 'package:flutter/material.dart';
import 'package:logger/logger.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:techtalk/constants/app_theme.dart';
import 'package:techtalk/services/auth_gate.dart';
import 'package:techtalk/services/global_fcm_listener.dart';
import 'package:techtalk/services/user_router.dart';

final logger = Logger();

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
  url: 'https://iinwzibplknjqmofevpw.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpbnd6aWJwbGtuanFtb2ZldnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjgxODEsImV4cCI6MjA4NTcwNDE4MX0.6EJzg0Tbt4feUic5kGgP9Alnhtty2yuDZ7B47OZCeIA',
  authOptions: const FlutterAuthClientOptions(
    authFlowType: AuthFlowType.pkce,
    autoRefreshToken: true,
  ),
);

  final client = Supabase.instance.client;

  logger.i('Supabase initialized');

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GlobalFcmListener(
      child: MaterialApp(
        title: 'TechTal k',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const AuthGate(),
        
      ),
    );
  }
}