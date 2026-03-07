import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/inspecao.dart';
import '../services/auth_service.dart';

class InspecoesScreen extends StatefulWidget {
  const InspecoesScreen({Key? key}) : super(key: key);

  @override
  _InspecoesScreenState createState() => _InspecoesScreenState();
}

class _InspecoesScreenState extends State<InspecoesScreen> {
  List<Inspecao> _inspecoes = [];
  bool _carregando = true;
  String? _erro;

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<void> _carregar() async {
    setState(() { _carregando = true; _erro = null; });
    try {
      final api = context.read<AuthService>().apiService;
      final lista = await api.listarInspecoes();
      setState(() { _inspecoes = lista; _carregando = false; });
    } catch (e) {
      setState(() { _erro = e.toString(); _carregando = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_carregando) return const Center(child: CircularProgressIndicator());

    if (_erro != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 12),
            Text(_erro!, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _carregar,
              icon: const Icon(Icons.refresh),
              label: const Text('Tentar novamente'),
            ),
          ],
        ),
      );
    }

    if (_inspecoes.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.assignment_outlined, size: 64, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Text('Nenhuma inspeção realizada ainda.',
                style: TextStyle(color: Colors.grey.shade500, fontSize: 15)),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _carregar,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _inspecoes.length,
        itemBuilder: (context, i) => _card(_inspecoes[i]),
      ),
    );
  }

  Widget _card(Inspecao inspecao) {
    final theme = Theme.of(context);
    final cor = _corStatus(inspecao.status);
    final label = _labelStatus(inspecao.status);
    final icone = _iconeStatus(inspecao.status);
    final data = DateFormat('dd/MM/yyyy HH:mm').format(inspecao.criadoEm.toLocal());

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: cor.withOpacity(0.3)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                color: cor.withOpacity(0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icone, color: cor, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    inspecao.nomeExibicao,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  if (inspecao.cnpj != null)
                    Text(inspecao.cnpj!, style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: cor.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(label,
                            style: TextStyle(color: cor, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 8),
                      Text(data, style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
                    ],
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: Colors.grey.shade300),
          ],
        ),
      ),
    );
  }

  Color _corStatus(String status) {
    switch (status) {
      case 'FINALIZADA':    return Colors.green;
      case 'BLOQUEADA_B':   return Colors.red;
      case 'CANCELADA':     return Colors.grey;
      default:              return Colors.blue; // EM_ANDAMENTO
    }
  }

  String _labelStatus(String status) {
    switch (status) {
      case 'FINALIZADA':    return 'Finalizada';
      case 'BLOQUEADA_B':   return 'Bloqueada';
      case 'CANCELADA':     return 'Cancelada';
      default:              return 'Em andamento';
    }
  }

  IconData _iconeStatus(String status) {
    switch (status) {
      case 'FINALIZADA':    return Icons.check_circle_outline;
      case 'BLOQUEADA_B':   return Icons.block;
      case 'CANCELADA':     return Icons.cancel_outlined;
      default:              return Icons.pending_outlined;
    }
  }
}