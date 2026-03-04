import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../models/questionario.dart';
import 'inspecao/inspecao_screen.dart';

class QuestionariosScreen extends StatefulWidget {
  @override
  _QuestionariosScreenState createState() => _QuestionariosScreenState();
}

class _QuestionariosScreenState extends State<QuestionariosScreen> {
  List<Questionario> _questionarios = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadQuestionarios();
  }

  Future<void> _loadQuestionarios() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = context.read<AuthService>().apiService;
      final list = await api.getQuestionarios();
      setState(() { _questionarios = list; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_isLoading) {
      return Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: Colors.red),
              SizedBox(height: 16),
              Text('Erro ao carregar questionários', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              SizedBox(height: 8),
              Text(_error!, textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
              SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _loadQuestionarios,
                icon: Icon(Icons.refresh),
                label: Text('Tentar novamente'),
              ),
            ],
          ),
        ),
      );
    }

    if (_questionarios.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.assignment_outlined, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Nenhum questionário disponível', style: TextStyle(fontSize: 18, color: Colors.grey)),
            SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _loadQuestionarios,
              icon: Icon(Icons.refresh),
              label: Text('Atualizar'),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadQuestionarios,
      child: ListView.builder(
        padding: EdgeInsets.all(16),
        itemCount: _questionarios.length,
        itemBuilder: (context, index) {
          final q = _questionarios[index];
          return Card(
            margin: EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: () => _iniciarInspecao(q),
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(Icons.assignment, color: theme.colorScheme.primary, size: 28),
                    ),
                    SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(q.titulo, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          if (q.descricao != null) ...[
                            SizedBox(height: 4),
                            Text(q.descricao!, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                          ],
                          SizedBox(height: 6),
                          Row(
                            children: [
                              if (q.tipo != null)
                                _buildChip(q.tipo!, Colors.blue),
                              if (q.versao != null) ...[
                                SizedBox(width: 6),
                                _buildChip('v${q.versao}', Colors.green),
                              ],
                              if (q.totalSecoes != null) ...[
                                SizedBox(width: 6),
                                _buildChip('${q.totalSecoes} seções', Colors.orange),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                    Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildChip(String label, Color color) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }

  void _iniciarInspecao(Questionario q) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => InspecaoScreen(questionario: q)),
    );
  }
}
