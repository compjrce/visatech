import 'package:flutter/material.dart';
import '../../models/secao.dart';
import '../../models/pergunta.dart';
import '../../models/resposta.dart';
import 'widgets.dart';

class SecaoBScreen extends StatefulWidget {
  final Secao secao;
  final Function(List<Resposta>) onAvancar;
  final Function(String motivo) onCancelar;

  const SecaoBScreen({
    Key? key,
    required this.secao,
    required this.onAvancar,
    required this.onCancelar,
  }) : super(key: key);

  @override
  _SecaoBScreenState createState() => _SecaoBScreenState();
}

class _SecaoBScreenState extends State<SecaoBScreen> {
  final Map<int, TipoResposta?> _respostas = {};

  Pergunta? get _perguntaFarmaceutico {
    final perguntas = widget.secao.perguntas ?? [];
    try {
      return perguntas.firstWhere(
        (p) =>
            p.texto.toLowerCase().contains('farmacêutico') &&
            p.texto.toLowerCase().contains('presente'),
      );
    } catch (_) {
      return perguntas.isNotEmpty ? perguntas.first : null;
    }
  }

  void _responder(int perguntaId, TipoResposta opcao) {
    setState(() => _respostas[perguntaId] = opcao);
    final pf = _perguntaFarmaceutico;
    if (pf != null && perguntaId == pf.id && opcao == TipoResposta.NAO) {
      _mostrarDialogoCancelamento();
    }
  }

  void _mostrarDialogoCancelamento() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        icon: Icon(Icons.warning_amber_rounded, color: Colors.red, size: 48),
        title: Text('Inspeção Cancelada', style: TextStyle(color: Colors.red)),
        content: Text(
          'A inspeção não pode continuar sem a presença do farmacêutico responsável.\n\n'
          'Conforme Art.15 § 1º e 2º da Lei Federal 5991/73 c/c Art.3º da RDC 44/2009, '
          'o farmacêutico deve estar presente desde o início da inspeção.',
          textAlign: TextAlign.center,
        ),
        actions: [
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            icon: Icon(Icons.cancel, color: Colors.white),
            label: Text('Cancelar Inspeção', style: TextStyle(color: Colors.white)),
            onPressed: () {
              Navigator.pop(context);
              widget.onCancelar(
                'Farmacêutico responsável não estava presente no início da inspeção.',
              );
            },
          ),
        ],
      ),
    );
  }

  void _avancar() {
    final perguntas = widget.secao.perguntas ?? [];
    final naoRespondidas =
        perguntas.where((p) => p.obrigatoria && !_respostas.containsKey(p.id));

    if (naoRespondidas.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Responda todas as perguntas obrigatórias.'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    final respostas = perguntas
        .map((p) => Resposta(perguntaId: p.id, respostaOpcao: _respostas[p.id]))
        .toList();

    widget.onAvancar(respostas);
  }

  @override
  Widget build(BuildContext context) {
    final perguntas = widget.secao.perguntas ?? [];

    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: EdgeInsets.all(16),
          color: Colors.orange.withOpacity(0.1),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                        color: Colors.orange,
                        borderRadius: BorderRadius.circular(20)),
                    child: Text('B',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                  SizedBox(width: 10),
                  Expanded(
                      child: Text(widget.secao.titulo,
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold))),
                ],
              ),
              SizedBox(height: 8),
              Container(
                padding: EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.orange.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.orange.withOpacity(0.4)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.warning_amber, color: Colors.orange, size: 18),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Seção crítica: a inspeção será cancelada se o farmacêutico não estiver presente.',
                        style: TextStyle(
                            color: Colors.orange[800],
                            fontSize: 12,
                            fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: EdgeInsets.all(16),
            itemCount: perguntas.length,
            itemBuilder: (context, index) {
              final pergunta = perguntas[index];
              final isPf = pergunta.id == _perguntaFarmaceutico?.id;

              return Card(
                margin: EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: isPf
                      ? BorderSide(color: Colors.orange, width: 1.5)
                      : BorderSide.none,
                ),
                child: Padding(
                  padding: EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (pergunta.obrigatoria)
                            Text('* ', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                          Expanded(
                              child: Text(pergunta.texto,
                                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14))),
                        ],
                      ),
                      if (pergunta.referenciaLegal != null) ...[
                        SizedBox(height: 4),
                        Text(pergunta.referenciaLegal!,
                            style: TextStyle(color: Colors.grey, fontSize: 11)),
                      ],
                      SizedBox(height: 12),
                      BotoesSimNao(
                        valor: _respostas[pergunta.id],
                        mostrarNa: pergunta.isSimNaoNaNo,
                        mostrarNo: pergunta.isSimNaoNaNo,
                        onChanged: (v) => _responder(pergunta.id, v),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        SafeArea(
          child: Padding(
            padding: EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _avancar,
                icon: Icon(Icons.arrow_forward),
                label: Text('PRÓXIMA SEÇÃO',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                    padding: EdgeInsets.symmetric(vertical: 14)),
              ),
            ),
          ),
        ),
      ],
    );
  }
}