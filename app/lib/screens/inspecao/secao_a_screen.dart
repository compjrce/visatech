import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/secao.dart';
import '../../models/questionario.dart';
import '../../models/resposta.dart';

// Opções de objetivo conforme o roteiro
const _objetivosInspecao = [
  'Solicitação de licença sanitária',
  'Renovação de licença sanitária',
  'Ação programada',
  'Apuração de denúncia',
  'Outros/Especificar',
];

class SecaoAScreen extends StatefulWidget {
  final Secao secao;
  final Questionario questionario; // para pré-preencher dados do estabelecimento
  final Function(List<Resposta> respostas, Map<String, dynamic> dadosSecaoA) onAvancar;

  const SecaoAScreen({
    Key? key,
    required this.secao,
    required this.questionario,
    required this.onAvancar,
  }) : super(key: key);

  @override
  _SecaoAScreenState createState() => _SecaoAScreenState();
}

class _SecaoAScreenState extends State<SecaoAScreen> {
  final _formKey = GlobalKey<FormState>();

  // Campos fixos da Seção A
  String? _objetivoSelecionado;
  final _outroEspecificarCtrl = TextEditingController();
  final _dataInspecaoCtrl = TextEditingController();
  final _acompanhanteCtrl = TextEditingController();

  DateTime? _dataSelecionada;

  @override
  void initState() {
    super.initState();
    // Preenche data com hoje por padrão
    _dataSelecionada = DateTime.now();
    _dataInspecaoCtrl.text = DateFormat('dd/MM/yyyy').format(_dataSelecionada!);
  }

  @override
  void dispose() {
    _outroEspecificarCtrl.dispose();
    _dataInspecaoCtrl.dispose();
    _acompanhanteCtrl.dispose();
    super.dispose();
  }

  Future<void> _selecionarData() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _dataSelecionada ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      locale: const Locale('pt', 'BR'),
    );
    if (picked != null) {
      setState(() {
        _dataSelecionada = picked;
        _dataInspecaoCtrl.text = DateFormat('dd/MM/yyyy').format(picked);
      });
    }
  }

  void _avancar() {
    if (!_formKey.currentState!.validate()) return;

    if (_objetivoSelecionado == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Selecione o objetivo da inspeção.'), backgroundColor: Colors.orange),
      );
      return;
    }

    final objetivoFinal = _objetivoSelecionado == 'Outros/Especificar'
        ? 'Outros: ${_outroEspecificarCtrl.text.trim()}'
        : _objetivoSelecionado!;

    final dadosSecaoA = {
      'razao_social': widget.questionario.razaoSocial,
      'nome_fantasia': widget.questionario.nomeFantasia,
      'cnpj': widget.questionario.cnpj,
      'objetivo_inspecao': objetivoFinal,
      'data_inspecao': _dataSelecionada?.toIso8601String(),
      'acompanhante_vistoria': _acompanhanteCtrl.text.trim(),
    };

    // Respostas para o backend (compatível com o modelo existente)
    final respostas = <Resposta>[];

    widget.onAvancar(respostas, dadosSecaoA);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final q = widget.questionario;

    return Form(
      key: _formKey,
      child: Column(
        children: [
          // Header
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(16),
            color: theme.colorScheme.primary.withOpacity(0.08),
            child: Row(
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
                Expanded(
                  child: Text(widget.secao.titulo,
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),

          Expanded(
            child: ListView(
              padding: EdgeInsets.all(16),
              children: [

                // ── Dados do Estabelecimento (pré-preenchidos, somente leitura) ──
                Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  color: theme.colorScheme.primary.withOpacity(0.04),
                  child: Padding(
                    padding: EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.store, size: 16, color: theme.colorScheme.primary),
                            SizedBox(width: 6),
                            Text('Dados do Estabelecimento',
                                style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                    color: theme.colorScheme.primary)),
                          ],
                        ),
                        SizedBox(height: 10),
                        _infoRow('Razão Social', q.razaoSocial ?? '—'),
                        if (q.nomeFantasia != null) _infoRow('Nome Fantasia', q.nomeFantasia!),
                        _infoRow('CNPJ', q.cnpj ?? '—'),
                      ],
                    ),
                  ),
                ),
                SizedBox(height: 16),

                // ── Objetivo da Inspeção ──
                Text('Objetivo da Inspeção *',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                SizedBox(height: 8),
                ..._objetivosInspecao.map((obj) {
                  final selecionado = _objetivoSelecionado == obj;
                  return InkWell(
                    onTap: () => setState(() => _objetivoSelecionado = obj),
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      margin: EdgeInsets.only(bottom: 6),
                      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: selecionado
                              ? theme.colorScheme.primary
                              : Colors.grey.withOpacity(0.3),
                          width: selecionado ? 2 : 1,
                        ),
                        color: selecionado
                            ? theme.colorScheme.primary.withOpacity(0.08)
                            : Colors.transparent,
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 18,
                            height: 18,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: selecionado
                                    ? theme.colorScheme.primary
                                    : Colors.grey,
                                width: 2,
                              ),
                              color: selecionado
                                  ? theme.colorScheme.primary
                                  : Colors.transparent,
                            ),
                            child: selecionado
                                ? Icon(Icons.check, size: 12, color: Colors.white)
                                : null,
                          ),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(obj,
                                style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: selecionado
                                        ? FontWeight.w600
                                        : FontWeight.normal)),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),

                // Campo "Outros/Especificar"
                if (_objetivoSelecionado == 'Outros/Especificar') ...[
                  SizedBox(height: 8),
                  TextFormField(
                    controller: _outroEspecificarCtrl,
                    decoration: InputDecoration(
                      labelText: 'Especificar',
                      hintText: 'Descreva o objetivo...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    validator: (v) =>
                        (v == null || v.trim().isEmpty) ? 'Campo obrigatório' : null,
                  ),
                ],

                SizedBox(height: 20),

                // ── Data da Inspeção ──
                Text('Data da Inspeção *',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                SizedBox(height: 8),
                TextFormField(
                  controller: _dataInspecaoCtrl,
                  readOnly: true,
                  onTap: _selecionarData,
                  decoration: InputDecoration(
                    hintText: 'DD/MM/AAAA',
                    prefixIcon: Icon(Icons.calendar_today),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                  validator: (v) =>
                      (v == null || v.trim().isEmpty) ? 'Selecione a data' : null,
                ),

                SizedBox(height: 16),

                // ── Acompanhante da Vistoria ──
                Text('Acompanhante da Vistoria',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                SizedBox(height: 8),
                TextFormField(
                  controller: _acompanhanteCtrl,
                  decoration: InputDecoration(
                    hintText: 'Nome do acompanhante...',
                    prefixIcon: Icon(Icons.person_outline),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                ),

                SizedBox(height: 24),
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
                  label: Text('PRÓXIMA SEÇÃO',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                      padding: EdgeInsets.symmetric(vertical: 14)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text('$label:', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          ),
          Expanded(
            child: Text(value,
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          ),
        ],
      ),
    );
  }
}