import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/map/presentation/pages/map_page.dart';
import '../../features/reports/presentation/pages/reports_page.dart';
import '../../features/alerts/presentation/pages/alerts_page.dart';
import '../../features/settings/presentation/pages/settings_page.dart';
import '../../features/reports/presentation/pages/create_report_page.dart';

class AppRouter {
  static final router = GoRouter(
    initialLocation: '/',
    routes: [
      // Auth routes
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterPage(),
      ),
      
      // Main app routes
      ShellRoute(
        builder: (context, state, child) => MainLayout(child: child),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const MapPage(),
          ),
          GoRoute(
            path: '/reports',
            builder: (context, state) => const ReportsPage(),
          ),
          GoRoute(
            path: '/alerts',
            builder: (context, state) => const AlertsPage(),
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsPage(),
          ),
        ],
      ),
      
      // Modal routes
      GoRoute(
        path: '/create-report',
        builder: (context, state) => const CreateReportPage(),
      ),
    ],
  );
}

class MainLayout extends StatelessWidget {
  final Widget child;

  const MainLayout({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _getCurrentIndex(context),
        onTap: (index) => _onTabTapped(context, index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.map),
            label: 'Harita',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.report),
            label: 'Raporlar',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.notifications),
            label: 'Uyarılar',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Ayarlar',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/create-report'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        child: const Icon(Icons.add),
      ),
    );
  }

  int _getCurrentIndex(BuildContext context) {
    final location = GoRouterState.of(context).location;
    switch (location) {
      case '/home':
        return 0;
      case '/reports':
        return 1;
      case '/alerts':
        return 2;
      case '/settings':
        return 3;
      default:
        return 0;
    }
  }

  void _onTabTapped(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/home');
        break;
      case 1:
        context.go('/reports');
        break;
      case 2:
        context.go('/alerts');
        break;
      case 3:
        context.go('/settings');
        break;
    }
  }
}
