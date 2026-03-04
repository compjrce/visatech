import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';

class ResultadoScreen extends StatefulWidget {
  final dynamic auditoriaId;
  final bool cancelada;
  final String? motivoCancelamento;

  const ResultadoScreen({
    Key? key,
    this.auditoriaId,
    this.cancelada = false,
    this.motivoCancelamento,
  }) : super(key: key);

  @override
  _ResultadoScreenState createState() => _ResultadoScreenState();
}

class _ResultadoScreenState extends State<ResultadoScreen> {
  Map<String, dynamic>? _auditoria;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    if (widget.auditoriaId != null) {
      _carregarAuditoria();
    } else {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _carregarAuditoria() async {
    try {
      final api = context.read<AuthService>().apiService;
      final id = widget.auditoriaId is int
          ? widget.auditoriaId
          : int.tryParse(widget.auditoriaId.toString());
      if (id != null) {
        final data = await api.getAuditoria(id);
        setState(() { _auditoria = data; _isLoading = false; });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cancelada = widget.cancelada;

    return Scaffold(
      body: SafeArea(
        child: _isLoading
            ? Center(child: CircularProgressIndicator())
            : Column(
                children: [
                  Expanded(
                    child: SingleChildScrollView(
                      padding: EdgeInsets.all(24),
                      child: Column(
                        children: [
                          SizedBox(height: 32),

                          // Ícone de status
                          Container(
                            padding: EdgeInsets.all(28),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: cancelada
                                  ? Colors.red.withOpacity(0.1)
                                  : Colors.green.withOpacity(0.1),
                            ),
                            child: Icon(
                              cancelada ? Icons.cancel : Icons.check_circle,
                              size: 80,
                              color: cancelada ? Colors.red : Colors.green,
                            ),
                          ),
                          SizedBox(height: 24),

                          Text(
                            cancelada ? 'Inspeção Cancelada' : 'Inspeção Concluída!',
                            style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                              color: cancelada ? Colors.red : Colors.green,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          SizedBox(height: 12),

                          Text(
                            cancelada
                                ? 'A inspeção foi cancelada e registrada no sistema.'
                                : 'Todas as seções foram respondidas e a inspeção foi salva com sucesso.',
                            style: TextStyle(color: Colors.grey[600], fontSize: 15),
                            textAlign: TextAlign.center,
                          ),

                          if (cancelada && widget.motivoCancelamento != null) ...[
                            SizedBox(height: 20),
                            Container(
                              padding: EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: Colors.red.withOpacity(0.05),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: Colors.red.withOpacity(0.2)),
                              ),
                              child: Column(
                                children: [
                                  Row(
                                    children: [
                                      Icon(Icons.info_outline, color: Colors.red, size: 18),
                                      SizedBox(width: 8),
                                      Text('Motivo do cancelamento', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
                                    ],
                                  ),
                                  SizedBox(height: 8),
                                  Text(widget.motivoCancelamento!, style: TextStyle(color: Colors.grey[700])),
                                ],
                              ),
                            ),
                          ],

                          if (_auditoria != null) ...[
                            SizedBox(height: 24),
                            _buildInfoCard(),
                          ],

                          if (widget.auditoriaId != null) ...[
                            SizedBox(height: 16),
                            Container(
                              padding: EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: theme.colorScheme.primary.withOpacity(0.08),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.tag, size: 16, color: theme.colorScheme.primary),
                                  SizedBox(width: 6),
                                  Text(
                                    'Protocolo: #${widget.auditoriaId}',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: theme.colorScheme.primary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),

                  // Botões de ação
                  Padding(
                    padding: EdgeInsets.all(16),
                    child: Column(
                      children: [
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () => Navigator.of(context).popUntil((r) => r.isFirst),
                            icon: Icon(Icons.home),
                            label: Text('VOLTAR AO INÍCIO', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(padding: EdgeInsets.symmetric(vertical: 14)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildInfoCard() {
    final a = _auditoria!;
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Detalhes da Inspeção', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            Divider(),
            if (a['estabelecimento_nome'] != null)
              _infoRow(Icons.store, 'Estabelecimento', a['estabelecimento_nome']),
            if (a['questionario_titulo'] != null)
              _infoRow(Icons.assignment, 'Questionário', a['questionario_titulo']),
            if (a['data_inicio'] != null) ...[
              _infoRow(Icons.calendar_today, 'Data',
                _formatarData(a['data_inicio'])),
            ],
            if (a['total_respostas'] != null)
              _infoRow(Icons.check_box, 'Respostas', '${a['total_respostas']} perguntas respondidas'),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.grey),
          SizedBox(width: 10),
          Text('$label: ', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          Expanded(child: Text(value, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
        ],
      ),
    );
  }

  String _formatarData(String iso) {
    try {
      final d = DateTime.parse(iso);
      return '${d.day.toString().padLeft(2,'0')}/${d.month.toString().padLeft(2,'0')}/${d.year}  ${d.hour.toString().padLeft(2,'0')}:${d.minute.toString().padLeft(2,'0')}';
    } catch (_) {
      return iso;
    }
  }
}
