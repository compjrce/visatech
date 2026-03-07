import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../providers/theme_provider.dart';
import 'nova_inspecao_screen.dart';
import 'inspecoes_screen.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    InspecoesScreen(),
    NovaInspecaoScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final authService = context.watch<AuthService>();
    final themeProvider = context.watch<ThemeProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text('VISATech'),
        actions: [
          IconButton(
            icon: Icon(_getThemeIcon(themeProvider.themeMode)),
            onPressed: _showThemeDialog,
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert),
            itemBuilder: (context) => <PopupMenuEntry<String>>[
              const PopupMenuItem<String>(
                enabled: false,
                child: ListTile(
                  leading: Icon(Icons.person),
                  title: Text(''),
                ),
              ),
              const PopupMenuDivider(),
              PopupMenuItem<String>(
                value: 'tema',
                child: const ListTile(
                  leading: Icon(Icons.palette),
                  title: Text('Tema'),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
              PopupMenuItem<String>(
                value: 'logout',
                child: const ListTile(
                  leading: Icon(Icons.logout, color: Colors.red),
                  title: Text('Sair', style: TextStyle(color: Colors.red)),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            ],
            onSelected: (value) {
              if (value == 'tema') {
                _showThemeDialog();
              } else if (value == 'logout') {
                _logout(context);
              }
            },
          ),
        ],
      ),
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.history),
            label: 'Inspeções',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.add_circle_outline),
            label: 'Nova Inspeção',
          ),
        ],
      ),
    );
  }

  IconData _getThemeIcon(AppThemeMode mode) {
    switch (mode) {
      case AppThemeMode.light:
        return Icons.wb_sunny;
      case AppThemeMode.dark:
        return Icons.nightlight_round;
      case AppThemeMode.feminine:
        return Icons.favorite;
    }
  }

  void _showThemeDialog() {
    final themeProvider = context.read<ThemeProvider>();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Escolher Tema'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildThemeOption('Claro (Azul)', Icons.wb_sunny, AppThemeMode.light, Color(0xFF2196F3), themeProvider),
            _buildThemeOption('Escuro (Laranja)', Icons.nightlight_round, AppThemeMode.dark, Color(0xFFFF9800), themeProvider),
            _buildThemeOption('Feminino (Rosa)', Icons.favorite, AppThemeMode.feminine, Color(0xFFE91E63), themeProvider),
          ],
        ),
      ),
    );
  }

  Widget _buildThemeOption(String title, IconData icon, AppThemeMode mode, Color color, ThemeProvider themeProvider) {
    final isSelected = themeProvider.themeMode == mode;
    return ListTile(
      leading: Icon(icon, color: color),
      title: Text(title),
      trailing: isSelected ? Icon(Icons.check, color: color) : null,
      onTap: () {
        themeProvider.setTheme(mode);
        Navigator.pop(context);
      },
    );
  }

  Future<void> _logout(BuildContext context) async {
    final authService = context.read<AuthService>();
    await authService.logout();

    if (mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => LoginScreen()),
        (route) => false,
      );
    }
  }
}