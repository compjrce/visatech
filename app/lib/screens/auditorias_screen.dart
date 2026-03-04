import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import 'inspecao/resultado_screen.dart';

class AuditoriasScreen extends StatefulWidget {
  @override
  _AuditoriasScreenState createState() => _AuditoriasScreenState();
}

class _AuditoriasScreenState extends State<AuditoriasScreen> {
  List<dynamic> _auditorias = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = context.read<AuthService>().apiService;
      final list = await api.getAuditorias();
      setState(() { _auditorias = list; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_isLoading) return Center(child: CircularProgressIndicator());

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red),
            SizedBox(height: 16),
            Text('Erro ao carregar histórico'),
            SizedBox(height: 24),
            ElevatedButton.icon(onPressed: _load, icon: Icon(Icons.refresh), label: Text('Tentar novamente')),
          ],
        ),
      );
    }

    if (_auditorias.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.history, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Nenhuma inspeção realizada', style: TextStyle(color: Colors.grey, fontSize: 16)),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: EdgeInsets.all(16),
        itemCount: _auditorias.length,
        itemBuilder: (context, index) {
          final a = _auditorias[index];
          final status = a['status'] ?? 'FINALIZADA';
          final statusColor = _statusColor(status);
          final dataInicio = a['data_inicio'] != null
              ? DateTime.tryParse(a['data_inicio'])
              : null;

          return Card(
            margin: EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: () => Navigator.push(context, MaterialPageRoute(
                builder: (_) => ResultadoScreen(auditoriaId: a['id']),
              )),
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(_statusIcon(status), color: statusColor, size: 24),
                    ),
                    SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            a['questionario_titulo'] ?? 'Inspeção #${a['id']}',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          if (a['estabelecimento_nome'] != null) ...[
                            SizedBox(height: 2),
                            Text(a['estabelecimento_nome'], style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                          ],
                          SizedBox(height: 6),
                          Row(
                            children: [
                              Container(
                                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: statusColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  _statusLabel(status),
                                  style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ),
                              if (dataInicio != null) ...[
                                SizedBox(width: 8),
                                Text(
                                  '${dataInicio.day.toString().padLeft(2,'0')}/${dataInicio.month.toString().padLeft(2,'0')}/${dataInicio.year}',
                                  style: TextStyle(color: Colors.grey, fontSize: 12),
                                ),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                    Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'FINALIZADA': return Colors.green;
      case 'EM_ANDAMENTO': return Colors.blue;
      case 'CANCELADA': return Colors.red;
      case 'BLOQUEADA_B': return Colors.orange;
      default: return Colors.grey;
    }
  }

  IconData _statusIcon(String status) {
    switch (status) {
      case 'FINALIZADA': return Icons.check_circle;
      case 'EM_ANDAMENTO': return Icons.pending;
      case 'CANCELADA': return Icons.cancel;
      case 'BLOQUEADA_B': return Icons.block;
      default: return Icons.help;
    }
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'FINALIZADA': return 'Finalizada';
      case 'EM_ANDAMENTO': return 'Em andamento';
      case 'CANCELADA': return 'Cancelada';
      case 'BLOQUEADA_B': return 'Bloqueada';
      default: return status;
    }
  }
}
