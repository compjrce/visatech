import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/questionario.dart';
import '../../models/secao.dart';
import '../../models/resposta.dart';
import '../../services/auth_service.dart';
import 'secao_a_screen.dart';
import 'secao_b_screen.dart';
import 'secao_generica_screen.dart';
import 'resultado_screen.dart';

class InspecaoScreen extends StatefulWidget {
  final Questionario questionario;

  const InspecaoScreen({Key? key, required this.questionario}) : super(key: key);

  @override
  _InspecaoScreenState createState() => _InspecaoScreenState();
}

class _InspecaoScreenState extends State<InspecaoScreen> {
  Questionario? _questionarioCompleto;
  bool _isLoading = true;
  String? _error;

  int _secaoAtual = 0;
  int? _inspecaoId; // ID criado no backend após seção A

  @override
  void initState() {
    super.initState();
    _carregarQuestionario();
  }

  Future<void> _carregarQuestionario() async {
    try {
      final api = context.read<AuthService>().apiService;
      final q = await api.getQuestionario(widget.questionario.id);
      setState(() { _questionarioCompleto = q; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  List<Secao> get _secoes => _questionarioCompleto?.secoes ?? [];

  double get _progresso =>
      _secoes.isEmpty ? 0 : (_secaoAtual + 1) / _secoes.length;

  // Seção A: cria a inspeção no backend com os dados de identificação
  Future<void> _avancarSecaoA(List<Resposta> respostas, Map<String, dynamic> dadosSecaoA) async {
    _mostrarLoading('Iniciando inspeção...');
    try {
      final api = context.read<AuthService>().apiService;

      final result = await api.criarInspecao(
        questionarioId: widget.questionario.id,
        estabelecimentoId: widget.questionario.estabelecimentoId ?? 1,
        tipoInspecao: dadosSecaoA['objetivo_inspecao'] ?? 'Rotina',
        dadosSecaoA: dadosSecaoA,
      );

      _inspecaoId = result['id'] is int
          ? result['id']
          : int.tryParse(result['id'].toString());

      Navigator.pop(context); // fecha loading
      setState(() => _secaoAtual++);
    } catch (e) {
      Navigator.pop(context);
      _mostrarErro('Erro ao iniciar inspeção: $e');
    }
  }

  // Seção B: valida farmacêutico
  Future<void> _avancarSecaoB(List<Resposta> respostas) async {
    if (_inspecaoId == null) {
      _mostrarErro('ID da inspeção não encontrado.');
      return;
    }
    _mostrarLoading('Validando Seção B...');
    try {
      final api = context.read<AuthService>().apiService;
      final result = await api.validarSecaoB(_inspecaoId!, respostas);
      Navigator.pop(context);

      if (result['aprovada'] == true) {
        setState(() => _secaoAtual++);
      } else {
        _cancelarInspecao('Farmacêutico responsável não estava presente no início da inspeção.');
      }
    } catch (e) {
      Navigator.pop(context);
      _mostrarErro('Erro ao validar Seção B: $e');
    }
  }

  // Seções C-H: salva respostas da seção
  Future<void> _avancarSecaoGenerica(Secao secao, List<Resposta> respostas) async {
    if (_inspecaoId == null) {
      _mostrarErro('ID da inspeção não encontrado.');
      return;
    }
    _mostrarLoading('Salvando respostas...');
    try {
      final api = context.read<AuthService>().apiService;
      await api.salvarRespostasSecao(_inspecaoId!, secao.codigo, respostas);
      Navigator.pop(context);

      if (_secaoAtual < _secoes.length - 1) {
        setState(() => _secaoAtual++);
      } else {
        await _finalizarInspecao();
      }
    } catch (e) {
      Navigator.pop(context);
      _mostrarErro('Erro ao salvar respostas: $e');
    }
  }

  Future<void> _finalizarInspecao() async {
    _mostrarLoading('Finalizando inspeção...');
    try {
      final api = context.read<AuthService>().apiService;
      await api.finalizarInspecao(_inspecaoId!);
      Navigator.pop(context);

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => ResultadoScreen(
            auditoriaId: _inspecaoId,
            cancelada: false,
          ),
        ),
      );
    } catch (e) {
      Navigator.pop(context);
      _mostrarErro('Erro ao finalizar: $e');
    }
  }

  void _cancelarInspecao(String motivo) {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => ResultadoScreen(
          auditoriaId: _inspecaoId,
          cancelada: true,
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
        content: Row(
          children: [
            CircularProgressIndicator(),
            SizedBox(width: 16),
            Text(msg),
          ],
        ),
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
        title: Text('Sair da inspeção?'),
        content: Text('O progresso não salvo será perdido.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: Text('Cancelar')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('Sair', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    return confirmar ?? false;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: Text(widget.questionario.titulo)),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null) {
      return Scaffold(
        appBar: AppBar(title: Text('Erro')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: Colors.red),
              SizedBox(height: 16),
              Text(_error!),
              SizedBox(height: 24),
              ElevatedButton(onPressed: _carregarQuestionario, child: Text('Tentar novamente')),
            ],
          ),
        ),
      );
    }

    final secoes = _secoes;
    if (secoes.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: Text(widget.questionario.titulo)),
        body: Center(child: Text('Nenhuma seção encontrada.')),
      );
    }

    final secaoAtual = secoes[_secaoAtual];

    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        appBar: AppBar(
          title: Text(widget.questionario.titulo, overflow: TextOverflow.ellipsis),
          bottom: PreferredSize(
            preferredSize: Size.fromHeight(6),
            child: LinearProgressIndicator(
              value: _progresso,
              backgroundColor: theme.colorScheme.primary.withOpacity(0.2),
              valueColor: AlwaysStoppedAnimation(Colors.white),
            ),
          ),
        ),
        body: Column(
          children: [
            Container(
              color: theme.colorScheme.surface,
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  Icon(Icons.layers, size: 16, color: theme.colorScheme.primary),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Seção ${_secaoAtual + 1} de ${secoes.length}  •  ${secaoAtual.codigo} – ${secaoAtual.titulo}',
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
            Divider(height: 1),
            Expanded(child: _buildSecaoAtual(secaoAtual)),
          ],
        ),
      ),
    );
  }

  Widget _buildSecaoAtual(Secao secao) {
    if (secao.codigo == 'A' || secao.isIdentificacao) {
      return SecaoAScreen(
        secao: secao,
        questionario: _questionarioCompleto!,
        onAvancar: _avancarSecaoA,
      );
    }

    if (secao.codigo == 'B' || secao.isValidacao || secao.bloqueante) {
      return SecaoBScreen(
        secao: secao,
        onAvancar: _avancarSecaoB,
        onCancelar: _cancelarInspecao,
      );
    }

    return SecaoGenericaScreen(
      secao: secao,
      isUltimaSecao: _secaoAtual == _secoes.length - 1,
      onAvancar: (respostas) => _avancarSecaoGenerica(secao, respostas),
    );
  }
}