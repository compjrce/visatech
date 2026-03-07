// screens/inspecao_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/inspecao.dart';
import '../../models/campos.dart';
import '../../services/auth_service.dart';
import 'secao_screen.dart';
import 'resultado_screen.dart';

class InspecaoScreen extends StatefulWidget {
  final Inspecao inspecao;

  const InspecaoScreen({Key? key, required this.inspecao}) : super(key: key);

  @override
  _InspecaoScreenState createState() => _InspecaoScreenState();
}

class _InspecaoScreenState extends State<InspecaoScreen> {
  late int _inspecaoId;
  late int _secaoIndex;

  // Respostas acumuladas por seção (em memória até salvar)
  final Map<String, Map<String, String?>> _respostasPorSecao = {};

  static const List<Secao> _secoes = todasSecoes;

  @override
  void initState() {
    super.initState();
    _inspecaoId = widget.inspecao.id;

    // Começa da seção que o backend indicou
    final idx = _secoes.indexWhere((s) => s.codigo == widget.inspecao.secaoAtual);
    _secaoIndex = idx >= 0 ? idx : 0;
  }

  Secao get _secaoAtual => _secoes[_secaoIndex];
  double get _progresso => (_secaoIndex + 1) / _secoes.length;

  // ── Avança para próxima seção (chamado pelo SecaoScreen) ──
  Future<void> _avancar(Map<String, String?> respostas) async {
    final secao = _secaoAtual;
    _mostrarLoading('Salvando...');

    try {
      final api = context.read<AuthService>().apiService;
      final result = await api.salvarRespostas(_inspecaoId, secao.codigo, respostas);

      if (!mounted) return;
      Navigator.pop(context); // fecha loading

      final status = result['status'] as String?;

      // Seção B: verifica bloqueio
      if (secao.codigo == 'B' && status == 'BLOQUEADA_B') {
        _irParaResultado(cancelada: true, motivo: 'Farmacêutico responsável não estava presente no início da inspeção.');
        return;
      }

      // Última seção → finaliza
      if (_secaoIndex == _secoes.length - 1) {
        await _finalizar();
        return;
      }

      setState(() {
        _respostasPorSecao[secao.codigo] = respostas;
        _secaoIndex++;
      });
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        _mostrarErro('Erro ao salvar: $e');
      }
    }
  }

  Future<void> _finalizar() async {
    _mostrarLoading('Finalizando inspeção...');
    try {
      final api = context.read<AuthService>().apiService;
      await api.finalizarInspecao(_inspecaoId);
      if (!mounted) return;
      Navigator.pop(context);
      _irParaResultado(cancelada: false);
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        _mostrarErro('Erro ao finalizar: $e');
      }
    }
  }

  void _irParaResultado({required bool cancelada, String? motivo}) {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => ResultadoScreen(
          inspecaoId: _inspecaoId,
          cancelada: cancelada,
          motivoCancelamento: motivo,
        ),
      ),
    );
  }

  void _mostrarLoading(String msg) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        content: Row(children: [
          const CircularProgressIndicator(),
          const SizedBox(width: 16),
          Text(msg),
        ]),
      ),
    );
  }

  void _mostrarErro(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: Colors.red),
    );
  }

  Future<bool> _onWillPop() async {
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Sair da inspeção?'),
        content: const Text('As respostas já salvas serão mantidas. Você pode retomar depois.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Continuar')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Sair', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    return confirmar ?? false;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final secao = _secaoAtual;

    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        appBar: AppBar(
          title: Text(widget.inspecao.nomeExibicao, overflow: TextOverflow.ellipsis),
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(5),
            child: LinearProgressIndicator(
              value: _progresso,
              backgroundColor: theme.colorScheme.primary.withOpacity(0.25),
              valueColor: const AlwaysStoppedAnimation(Colors.white),
            ),
          ),
        ),
        body: Column(
          children: [
            // Indicador de seção
            Container(
              color: theme.colorScheme.surface,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  Container(
                    width: 28, height: 28,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Text(secao.codigo,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      '${_secaoIndex + 1} de ${_secoes.length}  •  ${secao.titulo}',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: theme.colorScheme.primary,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),

            // Conteúdo da seção
            Expanded(
              child: SecaoScreen(
                key: ValueKey(secao.codigo),
                secao: secao,
                inspecao: widget.inspecao,
                isUltimaSecao: _secaoIndex == _secoes.length - 1,
                respostasIniciais: _respostasPorSecao[secao.codigo],
                onAvancar: _avancar,
              ),
            ),
          ],
        ),
      ),
    );
  }
}