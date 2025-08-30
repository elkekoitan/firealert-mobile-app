import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import 'shared/navigation/app_router.dart';
import 'shared/themes/app_theme.dart';
import 'features/auth/bloc/auth_bloc.dart';
import 'core/services/supabase_service.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<AuthBloc>(
          create: (context) => AuthBloc(
            supabaseService: context.read<SupabaseService>(),
          )..add(AuthCheckRequested()),
        ),
      ],
      child: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthUnauthenticated) {
            context.go('/login');
          } else if (state is AuthAuthenticated) {
            context.go('/home');
          }
        },
        child: MaterialApp.router(
          title: 'FireAlert',
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeMode.system,
          routerConfig: AppRouter.router,
          debugShowCheckedModeBanner: false,
        ),
      ),
    );
  }
}
