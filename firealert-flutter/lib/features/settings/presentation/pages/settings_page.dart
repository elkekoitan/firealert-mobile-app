import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../auth/bloc/auth_bloc.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ayarlar'),
      ),
      body: ListView(
        children: [
          // Kullanıcı profili
          BlocBuilder<AuthBloc, AuthState>(
            builder: (context, state) {
              if (state is AuthAuthenticated) {
                return Card(
                  margin: const EdgeInsets.all(16),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.red,
                      child: Text(
                        state.user.name[0].toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    title: Text(state.user.name),
                    subtitle: Text(state.user.email),
                    trailing: const Icon(Icons.edit),
                    onTap: () {
                      // TODO: Navigate to profile edit
                    },
                  ),
                );
              }
              return const SizedBox.shrink();
            },
          ),

          // Bildirim ayarları
          const ListTile(
            leading: Icon(Icons.notifications),
            title: Text('Bildirim Ayarları'),
            subtitle: Text('Push bildirimleri ve uyarılar'),
            trailing: Icon(Icons.chevron_right),
          ),

          // Konum ayarları
          const ListTile(
            leading: Icon(Icons.location_on),
            title: Text('Konum Ayarları'),
            subtitle: Text('Konum izinleri ve hassasiyet'),
            trailing: Icon(Icons.chevron_right),
          ),

          // Uygulama bilgileri
          const ListTile(
            leading: Icon(Icons.info),
            title: Text('Uygulama Hakkında'),
            subtitle: Text('Versiyon ve lisans bilgileri'),
            trailing: Icon(Icons.chevron_right),
          ),

          // Gizlilik politikası
          const ListTile(
            leading: Icon(Icons.privacy_tip),
            title: Text('Gizlilik Politikası'),
            subtitle: Text('Veri kullanımı ve gizlilik'),
            trailing: Icon(Icons.chevron_right),
          ),

          // Yardım ve destek
          const ListTile(
            leading: Icon(Icons.help),
            title: Text('Yardım ve Destek'),
            subtitle: Text('SSS ve iletişim'),
            trailing: Icon(Icons.chevron_right),
          ),

          const Divider(),

          // Çıkış yap
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text(
              'Çıkış Yap',
              style: TextStyle(color: Colors.red),
            ),
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Çıkış Yap'),
                  content: const Text('Hesabınızdan çıkmak istediğinizden emin misiniz?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('İptal'),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.of(context).pop();
                        context.read<AuthBloc>().add(AuthLogoutRequested());
                      },
                      child: const Text(
                        'Çıkış Yap',
                        style: TextStyle(color: Colors.red),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
