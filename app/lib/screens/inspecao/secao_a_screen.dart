import 'package:flutter/material.dart';
import '../../models/secao.dart';
import '../../models/resposta.dart';

class SecaoAScreen extends StatefulWidget {
  final Secao secao;
  final Function(List<Resposta>) onAvancar;

  const SecaoAScreen({Key? key, required this.secao, required this.onAvancar}) : super(key: key);

  @override
  _SecaoAScreenState createState() => _SecaoAScreenState();
}

class _SecaoAScreenState extends State<SecaoAScreen> {
  final Map<int, TextEditingController> _controllers = {};
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    for (final pergunta in widget.secao.perguntas ?? []) {
      _controllers[pergunta.id] = TextEditingController();
    }
  }

  @override
  void dispose() {
    for (final c in _controllers.values) c.dispose();
    super.dispose();
  }

  void _avancar() {
    if (!_formKey.currentState!.validate()) return;

    final respostas = (widget.secao.perguntas ?? []).map((p) {
      return Resposta(
        perguntaId: p.id,
        respostaTexto: _controllers[p.id]?.text.trim(),
      );
    }).toList();

    widget.onAvancar(respostas);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final perguntas = widget.secao.perguntas ?? [];

    return Form(
      key: _formKey,
      child: Column(
        children: [
          // Header
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(16),
            color: theme.colorScheme.primary.withOpacity(0.08),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text('A', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                    SizedBox(width: 10),
                    Text(widget.secao.titulo, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ],
                ),
                if (widget.secao.descricao != null) ...[
                  SizedBox(height: 6),
                  Text(widget.secao.descricao!, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                ],
              ],
            ),
          ),

          Expanded(
            child: ListView(
              padding: EdgeInsets.all(16),
              children: [
                ...perguntas.map((pergunta) {
                  return Padding(
                    padding: EdgeInsets.only(bottom: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          pergunta.texto,
                          style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                        ),
                        if (pergunta.referenciaLegal != null) ...[
                          SizedBox(height: 2),
                          Text(pergunta.referenciaLegal!, style: TextStyle(color: Colors.grey, fontSize: 11)),
                        ],
                        SizedBox(height: 8),
                        TextFormField(
                          controller: _controllers[pergunta.id],
                          maxLines: pergunta.isTexto ? 3 : 1,
                          keyboardType: pergunta.isNumero
                              ? TextInputType.number
                              : pergunta.isData
                                  ? TextInputType.datetime
                                  : TextInputType.text,
                          decoration: InputDecoration(
                            hintText: pergunta.isData ? 'DD/MM/AAAA' : 'Digite aqui...',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          ),
                          validator: pergunta.obrigatoria
                              ? (v) => (v == null || v.trim().isEmpty) ? 'Campo obrigatório' : null
                              : null,
                        ),
                      ],
                    ),
                  );
                }).toList(),

                SizedBox(height: 8),
              ],
            ),
          ),

          // Botão avançar
          SafeArea(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _avancar,
                  icon: Icon(Icons.arrow_forward),
                  label: Text('PRÓXIMA SEÇÃO', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(padding: EdgeInsets.symmetric(vertical: 14)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
