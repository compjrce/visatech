// screens/resultado_screen.dart
import 'package:flutter/material.dart';

class ResultadoScreen extends StatelessWidget {
  final int? inspecaoId;
  final bool cancelada;
  final String? motivoCancelamento;

  const ResultadoScreen({
    Key? key,
    this.inspecaoId,
    required this.cancelada,
    this.motivoCancelamento,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Ícone principal
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: cancelada ? Colors.red.shade50 : Colors.green.shade50,
                  ),
                  child: Icon(
                    cancelada ? Icons.cancel_outlined : Icons.check_circle_outline,
                    size: 64,
                    color: cancelada ? Colors.red : Colors.green,
                  ),
                ),
                const SizedBox(height: 28),

                Text(
                  cancelada ? 'Inspeção Encerrada' : 'Inspeção Finalizada',
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: cancelada ? Colors.red.shade700 : Colors.green.shade700,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),

                if (inspecaoId != null)
                  Text(
                    'Protocolo #$inspecaoId',
                    style: TextStyle(fontSize: 14, color: Colors.grey.shade500, fontWeight: FontWeight.w500),
                  ),
                const SizedBox(height: 16),

                // Motivo (se cancelada)
                if (cancelada && motivoCancelamento != null)
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.red.shade100),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.info_outline, color: Colors.red.shade400, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            motivoCancelamento!,
                            style: TextStyle(color: Colors.red.shade700, fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),

                // Mensagem de sucesso
                if (!cancelada)
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.green.shade100),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.check, color: Colors.green.shade600, size: 18),
                        const SizedBox(width: 8),
                        const Expanded(
                          child: Text(
                            'Todas as respostas foram salvas. O relatório estará disponível no painel administrativo.',
                            style: TextStyle(fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: 40),

                // Botão voltar ao início
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      // Volta para a raiz da navegação (HomeScreen)
                      Navigator.of(context).popUntil((route) => route.isFirst);
                    },
                    icon: const Icon(Icons.home),
                    label: const Text('VOLTAR AO INÍCIO',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: cancelada ? Colors.grey.shade700 : theme.colorScheme.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}