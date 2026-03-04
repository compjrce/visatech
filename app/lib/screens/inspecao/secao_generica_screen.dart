import 'package:flutter/material.dart';
import '../../models/secao.dart';
import '../../models/pergunta.dart';
import '../../models/resposta.dart';
import 'widgets.dart';

class SecaoGenericaScreen extends StatefulWidget {
  final Secao secao;
  final bool isUltimaSecao;
  final Function(List<Resposta>) onAvancar;

  const SecaoGenericaScreen({
    Key? key,
    required this.secao,
    required this.isUltimaSecao,
    required this.onAvancar,
  }) : super(key: key);

  @override
  _SecaoGenericaScreenState createState() => _SecaoGenericaScreenState();
}

class _SecaoGenericaScreenState extends State<SecaoGenericaScreen> {
  final Map<int, TipoResposta?> _respostasOpcao = {};
  final Map<int, TextEditingController> _respostasTexto = {};
  final Map<int, TextEditingController> _observacoes = {};
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    for (final p in widget.secao.perguntas ?? []) {
      if (p.isTexto || p.isData || p.isNumero) {
        _respostasTexto[p.id] = TextEditingController();
      }
      _observacoes[p.id] = TextEditingController();
    }
  }

  @override
  void dispose() {
    for (final c in _respostasTexto.values) c.dispose();
    for (final c in _observacoes.values) c.dispose();
    super.dispose();
  }

  Color _corSecao() {
    switch (widget.secao.codigo) {
      case 'C': return Colors.purple;
      case 'D': return Colors.teal;
      case 'E': return Colors.indigo;
      case 'F': return Colors.deepOrange;
      case 'G': return Colors.cyan;
      case 'H': return Colors.brown;
      default:  return Colors.blue;
    }
  }

  void _avancar() {
    final perguntas = widget.secao.perguntas ?? [];

    for (final p in perguntas) {
      if (!p.obrigatoria) continue;
      if ((p.isSimNao || p.isSimNaoNaNo) && !_respostasOpcao.containsKey(p.id)) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Responda todas as perguntas obrigatórias antes de continuar.'),
            backgroundColor: Colors.orange,
          ),
        );
        return;
      }
    }

    if (!_formKey.currentState!.validate()) return;

    final respostas = perguntas.map((p) {
      final obs = _observacoes[p.id]?.text.trim();
      return Resposta(
        perguntaId: p.id,
        respostaOpcao: _respostasOpcao[p.id],
        respostaTexto: _respostasTexto[p.id]?.text.trim(),
        observacao: (obs != null && obs.isNotEmpty) ? obs : null,
      );
    }).toList();

    widget.onAvancar(respostas);
  }

  @override
  Widget build(BuildContext context) {
    final cor = _corSecao();
    final perguntas = widget.secao.perguntas ?? [];

    return Form(
      key: _formKey,
      child: Column(
        children: [
          // Header
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(16),
            color: cor.withOpacity(0.08),
            child: Row(
              children: [
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: cor, borderRadius: BorderRadius.circular(20)),
                  child: Text(widget.secao.codigo,
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
                SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(widget.secao.titulo,
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                      if (widget.secao.descricao != null)
                        Text(widget.secao.descricao!,
                            style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                    ],
                  ),
                ),
                Text(
                  '${perguntas.length} ${perguntas.length == 1 ? 'item' : 'itens'}',
                  style: TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
          ),
          Divider(height: 1),

          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.all(16),
              itemCount: perguntas.length,
              itemBuilder: (context, index) =>
                  _buildPerguntaCard(perguntas[index], cor, index),
            ),
          ),

          SafeArea(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _avancar,
                  icon: Icon(widget.isUltimaSecao ? Icons.check : Icons.arrow_forward),
                  label: Text(
                    widget.isUltimaSecao ? 'FINALIZAR INSPEÇÃO' : 'PRÓXIMA SEÇÃO',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    padding: EdgeInsets.symmetric(vertical: 14),
                    backgroundColor: widget.isUltimaSecao ? Colors.green : null,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPerguntaCard(Pergunta pergunta, Color cor, int index) {
    final isOpcao = pergunta.isSimNao || pergunta.isSimNaoNaNo;
    final isTextoLivre = pergunta.isTexto || pergunta.isData || pergunta.isNumero;
    final respostaSelecionada = _respostasOpcao[pergunta.id];

    return Card(
      margin: EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 24,
                  height: 24,
                  margin: EdgeInsets.only(right: 8, top: 1),
                  decoration:
                      BoxDecoration(color: cor.withOpacity(0.1), shape: BoxShape.circle),
                  child: Center(
                    child: Text('${index + 1}',
                        style: TextStyle(
                            color: cor, fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(pergunta.texto,
                          style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      if (pergunta.referenciaLegal != null) ...[
                        SizedBox(height: 3),
                        Text(pergunta.referenciaLegal!,
                            style: TextStyle(
                                color: Colors.grey[500],
                                fontSize: 11,
                                fontStyle: FontStyle.italic)),
                      ],
                    ],
                  ),
                ),
                if (pergunta.obrigatoria)
                  Text(' *', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
              ],
            ),
            SizedBox(height: 12),

            if (isOpcao)
              BotoesSimNao(
                valor: _respostasOpcao[pergunta.id],
                mostrarNa: pergunta.isSimNaoNaNo,
                mostrarNo: pergunta.isSimNaoNaNo,
                onChanged: (v) => setState(() => _respostasOpcao[pergunta.id] = v),
              ),

            if (isTextoLivre)
              TextFormField(
                controller: _respostasTexto[pergunta.id],
                maxLines: pergunta.isTexto ? 3 : 1,
                keyboardType: pergunta.isNumero
                    ? TextInputType.number
                    : pergunta.isData
                        ? TextInputType.datetime
                        : TextInputType.text,
                decoration: InputDecoration(
                  hintText: pergunta.isData ? 'DD/MM/AAAA' : 'Informe aqui...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                validator: pergunta.obrigatoria
                    ? (v) => (v == null || v.trim().isEmpty) ? 'Campo obrigatório' : null
                    : null,
              ),

            if (isOpcao && respostaSelecionada != null) ...[
              SizedBox(height: 10),
              TextFormField(
                controller: _observacoes[pergunta.id],
                maxLines: 2,
                decoration: InputDecoration(
                  hintText: 'Observação (opcional)...',
                  hintStyle: TextStyle(fontSize: 12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  isDense: true,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}