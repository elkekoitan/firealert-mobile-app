import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'app.dart';
import 'core/services/supabase_service.dart';
import 'shared/themes/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive for local storage
  await Hive.initFlutter();
  
  // Initialize Supabase with your credentials
  await Supabase.initialize(
    url: 'https://hddwvgvqxgbtajwhvqqs.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkZHd2Z3ZxeGdidGFqd2h2cXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0Nzc0NTIsImV4cCI6MjA3MDA1MzQ1Mn0.mODUafES0VmAhdPXKPTeGt2JspWOeHKxj79zXl1zERE',
  );
  
  runApp(const FireAlertApp());
}

class FireAlertApp extends StatelessWidget {
  const FireAlertApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<SupabaseService>(
          create: (context) => SupabaseService(),
        ),
      ],
      child: MaterialApp(
        title: 'FireAlert',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        home: const App(),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
