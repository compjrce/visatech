// screens/secao_screen.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/campos.dart';
import '../../models/inspecao.dart';

class SecaoScreen extends StatefulWidget {
  final Secao secao;
  final Inspecao inspecao;
  final bool isUltimaSecao;
  final Map<String, String?>? respostasIniciais;
  final Future<void> Function(Map<String, String?> respostas) onAvancar;

  const SecaoScreen({
    Key? key,
    required this.secao,
    required this.inspecao,
    required this.isUltimaSecao,
    required this.onAvancar,
    this.respostasIniciais,
  }) : super(key: key);

  @override
  _SecaoScreenState createState() => _SecaoScreenState();
}

class _SecaoScreenState extends State<SecaoScreen> {
  // Mapa campo.chave → valor (String?)
  late Map<String, String?> _respostas;

  // Controladores de texto
  final Map<String, TextEditingController> _ctrls = {};

  // Tabela de treinamentos (seção C, campo 'tabela_treinamentos')
  final List<Map<String, TextEditingController>> _linhasTabela = [];

  @override
  void initState() {
    super.initState();
    _respostas = Map<String, String?>.from(widget.respostasIniciais ?? {});

    // Seção A: pré-preenche data com hoje
    if (widget.secao.codigo == 'A' && !_respostas.containsKey('data_inspecao')) {
      _respostas['data_inspecao'] = DateFormat('yyyy-MM-dd').format(DateTime.now());
    }

    // Cria TextControllers para campos de texto
    for (final grupo in widget.secao.grupos) {
      for (final campo in grupo.campos) {
        if (campo.tipo == TipoCampo.texto || campo.tipo == TipoCampo.numero) {
          _ctrls[campo.chave] = TextEditingController(text: _respostas[campo.chave] ?? '');
        }
      }
    }

    // Inicializa tabela de treinamentos com 1 linha vazia
    if (widget.secao.codigo == 'C') _adicionarLinhaTabela();
  }

  @override
  void dispose() {
    for (final c in _ctrls.values) c.dispose();
    for (final linha in _linhasTabela) {
      for (final c in linha.values) c.dispose();
    }
    super.dispose();
  }

  void _adicionarLinhaTabela() {
    setState(() {
      _linhasTabela.add({
        'data': TextEditingController(),
        'legislacao': TextEditingController(),
        'carga': TextEditingController(),
        'ministrante': TextEditingController(),
      });
    });
  }

  void _setResposta(String chave, String? valor) {
    setState(() => _respostas[chave] = valor);
  }

  // Serializa tabela para string JSON simples
  String _serializarTabela() {
    final linhas = _linhasTabela.map((l) => {
      'data': l['data']!.text,
      'legislacao': l['legislacao']!.text,
      'carga': l['carga']!.text,
      'ministrante': l['ministrante']!.text,
    }).where((l) => l.values.any((v) => v.isNotEmpty)).toList();
    return linhas.toString();
  }

  Future<void> _avancar() async {
    // Validação: campos obrigatórios
    final faltando = <String>[];
    for (final grupo in widget.secao.grupos) {
      for (final campo in grupo.campos) {
        if (!campo.obrigatorio) continue;
        // objetivo_outros_texto só obrigatório se "Outros/Especificar" selecionado
        if (campo.chave == 'objetivo_outros_texto') {
          if (_respostas['objetivo_inspecao'] == 'Outros/Especificar') {
            final v = _ctrls[campo.chave]?.text ?? '';
            if (v.trim().isEmpty) faltando.add(campo.label);
          }
          continue;
        }
        final v = _respostas[campo.chave];
        if (v == null || v.trim().isEmpty) faltando.add(campo.label);
      }
    }

    if (faltando.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Preencha os campos obrigatórios: ${faltando.join(', ')}'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    // Sincroniza TextControllers com o mapa
    for (final e in _ctrls.entries) {
      _respostas[e.key] = e.value.text.trim().isEmpty ? null : e.value.text.trim();
    }

    // Serializa tabela
    if (widget.secao.codigo == 'C') {
      _respostas['tabela_treinamentos'] = _serializarTabela();
    }

    // Seção A: trata "Outros/Especificar"
    if (widget.secao.codigo == 'A') {
      if (_respostas['objetivo_inspecao'] == 'Outros/Especificar') {
        final texto = _ctrls['objetivo_outros_texto']?.text.trim() ?? '';
        _respostas['objetivo_inspecao'] = 'Outros: $texto';
        _respostas.remove('objetivo_outros_texto');
      }
    }

    await widget.onAvancar(Map<String, String?>.from(_respostas));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isBloqueante = widget.secao.codigo == 'B';

    return Column(
      children: [
        // Aviso seção B
        if (isBloqueante)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: Colors.orange.shade50,
            child: Row(
              children: [
                Icon(Icons.warning_amber_rounded, color: Colors.orange.shade700, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Seção crítica: "NÃO" em qualquer pergunta encerra a inspeção.',
                    style: TextStyle(color: Colors.orange.shade800, fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),

        // Cabeçalho seção A: título do roteiro + dados do estabelecimento
        if (widget.secao.codigo == 'A') ...[
          _cabecalhoRoteiro(theme),
          _cabecalhoEstabelecimento(theme),
        ],

        // Campos
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: widget.secao.grupos.length,
            itemBuilder: (context, gi) {
              final grupo = widget.secao.grupos[gi];
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (grupo.titulo != null) ...[
                    if (gi > 0) const SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        grupo.titulo!,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                  ],
                  ...grupo.campos.map((campo) => _buildCampo(campo, theme)),
                ],
              );
            },
          ),
        ),

        // Botão avançar
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _avancar,
                icon: Icon(widget.isUltimaSecao ? Icons.check_circle : Icons.arrow_forward),
                label: Text(
                  widget.isUltimaSecao ? 'FINALIZAR INSPEÇÃO' : 'PRÓXIMA SEÇÃO',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  backgroundColor: widget.isUltimaSecao ? Colors.green : null,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _cabecalhoRoteiro(ThemeData theme) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: theme.colorScheme.primary.withOpacity(0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.colorScheme.primary.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'ROTEIRO DE INSPEÇÃO EM ESTABELECIMENTOS FARMACÊUTICOS DE COMÉRCIO VAREJISTA (Drogarias)',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 13,
              color: theme.colorScheme.primary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'baseado na RDC 44/2009 – Boas Práticas Farmacêuticas',
            style: TextStyle(
              fontSize: 11,
              color: theme.colorScheme.onSurface.withOpacity(0.6),
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }

  Widget _cabecalhoEstabelecimento(ThemeData theme) {
    final i = widget.inspecao;
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: theme.colorScheme.primary.withOpacity(0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.colorScheme.primary.withOpacity(0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _infoLinha('Razão Social', i.razaoSocial?.isNotEmpty == true ? i.razaoSocial! : '—'),
          _infoLinha('Nome Fantasia', i.nomeFantasia?.isNotEmpty == true ? i.nomeFantasia! : '—'),
          _infoLinha('CNPJ', i.cnpj?.isNotEmpty == true ? i.cnpj! : '—'),
        ],
      ),
    );
  }

  Widget _infoLinha(String label, String valor) => Padding(
        padding: const EdgeInsets.only(bottom: 4),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(width: 100, child: Text('$label:', style: TextStyle(color: Colors.grey[600], fontSize: 13))),
            Expanded(child: Text(valor, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
          ],
        ),
      );

  // ── Renderização de cada campo ──
  Widget _buildCampo(Campo campo, ThemeData theme) {
    // "objetivo_outros_texto" só aparece se Outros selecionado
    if (campo.chave == 'objetivo_outros_texto') {
      if (_respostas['objetivo_inspecao'] != 'Outros/Especificar') return const SizedBox.shrink();
    }

    Widget conteudo;

    switch (campo.tipo) {
      case TipoCampo.texto:
      case TipoCampo.numero:
        conteudo = _campoTexto(campo);
        break;
      case TipoCampo.data:
        conteudo = _campoData(campo, theme);
        break;
      case TipoCampo.opcoes:
        conteudo = _campoOpcoes(campo, theme);
        break;
      case TipoCampo.simNao:
        conteudo = _botoesBinarios(campo, theme, showNa: false, showNo: false);
        break;
      case TipoCampo.simNaoNaNo:
        conteudo = _botoesBinarios(campo, theme, showNa: true, showNo: true);
        break;
      case TipoCampo.checkboxes:
        conteudo = _campoCheckboxes(campo, theme);
        break;
      case TipoCampo.tabela:
        conteudo = _tabelaTreinamentos(theme);
        break;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            if (campo.obrigatorio)
              const Text('* ', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
            Expanded(
              child: Text(campo.label,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            ),
          ]),
          if (campo.referencia != null)
            Padding(
              padding: const EdgeInsets.only(top: 2, bottom: 6),
              child: Text(campo.referencia!, style: TextStyle(color: Colors.grey[500], fontSize: 11)),
            )
          else
            const SizedBox(height: 6),
          conteudo,
        ],
      ),
    );
  }

  Widget _campoTexto(Campo campo) {
    return TextFormField(
      controller: _ctrls[campo.chave],
      keyboardType: campo.tipo == TipoCampo.numero ? TextInputType.number : TextInputType.multiline,
      maxLines: campo.tipo == TipoCampo.numero ? 1 : null,
      minLines: 1,
      decoration: InputDecoration(
        hintText: 'Digite aqui...',
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        isDense: true,
      ),
    );
  }

  Widget _campoData(Campo campo, ThemeData theme) {
    final valor = _respostas[campo.chave];
    String display = 'Selecionar data';
    if (valor != null && valor.isNotEmpty) {
      try {
        display = DateFormat('dd/MM/yyyy').format(DateTime.parse(valor));
      } catch (_) {
        display = valor;
      }
    }

    return InkWell(
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: valor != null ? DateTime.tryParse(valor) ?? DateTime.now() : DateTime.now(),
          firstDate: DateTime(2000),
          lastDate: DateTime(2100),
          locale: const Locale('pt', 'BR'),
        );
        if (picked != null) {
          _setResposta(campo.chave, DateFormat('yyyy-MM-dd').format(picked));
        }
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 13),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade400),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(Icons.calendar_today, size: 18, color: theme.colorScheme.primary),
            const SizedBox(width: 8),
            Text(display, style: TextStyle(fontSize: 14, color: valor == null ? Colors.grey : theme.colorScheme.onSurface)),
          ],
        ),
      ),
    );
  }

  Widget _campoOpcoes(Campo campo, ThemeData theme) {
    final opcoes = campo.opcoes ?? [];
    return Column(
      children: opcoes.map((op) {
        final sel = _respostas[campo.chave] == op;
        return InkWell(
          onTap: () => _setResposta(campo.chave, op),
          borderRadius: BorderRadius.circular(8),
          child: Container(
            margin: const EdgeInsets.only(bottom: 6),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: sel ? theme.colorScheme.primary : Colors.grey.shade300,
                width: sel ? 2 : 1,
              ),
              color: sel ? theme.colorScheme.primary.withOpacity(0.08) : Colors.transparent,
            ),
            child: Row(
              children: [
                Container(
                  width: 18, height: 18,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: sel ? theme.colorScheme.primary : Colors.grey, width: 2),
                    color: sel ? theme.colorScheme.primary : Colors.transparent,
                  ),
                  child: sel ? const Icon(Icons.check, size: 12, color: Colors.white) : null,
                ),
                const SizedBox(width: 10),
                Expanded(child: Text(op, style: TextStyle(fontSize: 14, fontWeight: sel ? FontWeight.w600 : FontWeight.normal))),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _botoesBinarios(Campo campo, ThemeData theme, {required bool showNa, required bool showNo}) {
    final opcoes = ['SIM', 'NAO', if (showNa) 'NA', if (showNo) 'NO'];
    final labels = {'SIM': 'Sim', 'NAO': 'Não', 'NA': 'N/A', 'NO': 'N/O'};
    final cores = {
      'SIM': Colors.green,
      'NAO': Colors.red,
      'NA': Colors.orange,
      'NO': Colors.blueGrey,
    };
    final atual = _respostas[campo.chave];

    return Row(
      children: opcoes.map((op) {
        final sel = atual == op;
        final cor = cores[op]!;
        return Expanded(
          child: GestureDetector(
            onTap: () => _setResposta(campo.chave, op),
            child: Container(
              margin: const EdgeInsets.only(right: 6),
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: sel ? cor : cor.withOpacity(0.08),
                border: Border.all(color: sel ? cor : cor.withOpacity(0.3), width: sel ? 2 : 1),
              ),
              child: Center(
                child: Text(
                  labels[op]!,
                  style: TextStyle(
                    color: sel ? Colors.white : cor,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _campoCheckboxes(Campo campo, ThemeData theme) {
    final opcoes = campo.opcoes ?? [];
    // Valor salvo como lista separada por '|'
    final selecionados = (_respostas[campo.chave] ?? '').split('|').where((v) => v.isNotEmpty).toSet();

    return Wrap(
      spacing: 6,
      runSpacing: 6,
      children: opcoes.map((op) {
        final sel = selecionados.contains(op);
        return FilterChip(
          label: Text(op, style: const TextStyle(fontSize: 12)),
          selected: sel,
          onSelected: (v) {
            final novo = Set<String>.from(selecionados);
            if (v) novo.add(op); else novo.remove(op);
            _setResposta(campo.chave, novo.join('|'));
          },
          selectedColor: theme.colorScheme.primary.withOpacity(0.2),
          checkmarkColor: theme.colorScheme.primary,
          labelStyle: TextStyle(color: sel ? theme.colorScheme.primary : Colors.black87),
        );
      }).toList(),
    );
  }

  Widget _tabelaTreinamentos(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ...List.generate(_linhasTabela.length, (i) {
          final l = _linhasTabela[i];
          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                children: [
                  Row(children: [
                    Text('Treinamento ${i + 1}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    const Spacer(),
                    if (i > 0)
                      IconButton(
                        icon: const Icon(Icons.remove_circle_outline, color: Colors.red, size: 20),
                        onPressed: () => setState(() {
                          final linha = _linhasTabela.removeAt(i);
                          for (final c in linha.values) c.dispose();
                        }),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                  ]),
                  const SizedBox(height: 6),
                  Row(children: [
                    Expanded(child: _miniInput(l['data']!, 'Data')),
                    const SizedBox(width: 6),
                    Expanded(child: _miniInput(l['carga']!, 'C/H')),
                  ]),
                  const SizedBox(height: 6),
                  _miniInput(l['legislacao']!, 'Tema/Legislação'),
                  const SizedBox(height: 6),
                  _miniInput(l['ministrante']!, 'Ministrante'),
                ],
              ),
            ),
          );
        }),
        TextButton.icon(
          onPressed: _adicionarLinhaTabela,
          icon: const Icon(Icons.add_circle_outline, size: 18),
          label: const Text('Adicionar treinamento'),
        ),
      ],
    );
  }

  Widget _miniInput(TextEditingController ctrl, String hint) {
    return TextField(
      controller: ctrl,
      style: const TextStyle(fontSize: 13),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(fontSize: 12),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(6)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        isDense: true,
      ),
    );
  }
}