// screens/nova_inspecao_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../models/inspecao.dart';
import '../../services/auth_service.dart';
import 'inspecao_screen.dart';

class NovaInspecaoScreen extends StatefulWidget {
  const NovaInspecaoScreen({Key? key}) : super(key: key);

  @override
  _NovaInspecaoScreenState createState() => _NovaInspecaoScreenState();
}

class _NovaInspecaoScreenState extends State<NovaInspecaoScreen> {
  final _formKey = GlobalKey<FormState>();

  final _cnpjCtrl         = TextEditingController();
  final _razaoCtrl        = TextEditingController();
  final _fantasiaCtrl     = TextEditingController();
  final _enderecoCtrl     = TextEditingController();
  final _telefoneCtrl     = TextEditingController();
  final _emailCtrl        = TextEditingController();

  Estabelecimento? _estabelecimentoEncontrado;
  bool _buscando = false;
  bool _cnpjNaoEncontrado = false;
  bool _criando = false;

  @override
  void dispose() {
    _cnpjCtrl.dispose();
    _razaoCtrl.dispose();
    _fantasiaCtrl.dispose();
    _enderecoCtrl.dispose();
    _telefoneCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  String _formatarCnpj(String v) {
    final d = v.replaceAll(RegExp(r'\D'), '');
    if (d.length <= 2) return d;
    if (d.length <= 5) return '${d.substring(0, 2)}.${d.substring(2)}';
    if (d.length <= 8) return '${d.substring(0, 2)}.${d.substring(2, 5)}.${d.substring(5)}';
    if (d.length <= 12) return '${d.substring(0, 2)}.${d.substring(2, 5)}.${d.substring(5, 8)}/${d.substring(8)}';
    return '${d.substring(0, 2)}.${d.substring(2, 5)}.${d.substring(5, 8)}/${d.substring(8, 12)}-${d.substring(12, 14)}';
  }

  Future<void> _buscarCnpj() async {
    final cnpj = _cnpjCtrl.text.replaceAll(RegExp(r'\D'), '');
    if (cnpj.length != 14) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Digite um CNPJ válido (14 dígitos)'), backgroundColor: Colors.orange),
      );
      return;
    }

    setState(() { _buscando = true; _cnpjNaoEncontrado = false; _estabelecimentoEncontrado = null; });

    try {
      final api = context.read<AuthService>().apiService;
      final estab = await api.buscarPorCnpj(cnpj);

      if (estab != null) {
        setState(() {
          _estabelecimentoEncontrado = estab;
          _razaoCtrl.text = estab.razaoSocial;
          _fantasiaCtrl.text = estab.nomeFantasia ?? '';
          _enderecoCtrl.text = estab.endereco ?? '';
          _telefoneCtrl.text = estab.telefone ?? '';
          _emailCtrl.text = estab.email ?? '';
          _cnpjNaoEncontrado = false;
        });
      } else {
        setState(() {
          _cnpjNaoEncontrado = true;
          _razaoCtrl.clear();
          _fantasiaCtrl.clear();
          _enderecoCtrl.clear();
          _telefoneCtrl.clear();
          _emailCtrl.clear();
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao buscar CNPJ: $e'), backgroundColor: Colors.red),
      );
    } finally {
      setState(() => _buscando = false);
    }
  }

  Future<void> _iniciarInspecao() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _criando = true);

    try {
      final api = context.read<AuthService>().apiService;

      final inspecao = await api.criarInspecao(
        estabelecimentoId: _estabelecimentoEncontrado?.id,
        cnpj: _cnpjCtrl.text,
        razaoSocial: _razaoCtrl.text.trim(),
        nomeFantasia: _fantasiaCtrl.text.trim().isEmpty ? null : _fantasiaCtrl.text.trim(),
        endereco: _enderecoCtrl.text.trim().isEmpty ? null : _enderecoCtrl.text.trim(),
        telefone: _telefoneCtrl.text.trim().isEmpty ? null : _telefoneCtrl.text.trim(),
        email: _emailCtrl.text.trim().isEmpty ? null : _emailCtrl.text.trim(),
      );

      if (!mounted) return;

      // Abre a tela de inspeção
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => InspecaoScreen(inspecao: inspecao),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao iniciar inspeção: $e'), backgroundColor: Colors.red),
      );
      setState(() => _criando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cnpjValido = _cnpjCtrl.text.replaceAll(RegExp(r'\D'), '').length == 14;
    final mostrarCampos = _estabelecimentoEncontrado != null || _cnpjNaoEncontrado;
    final camposEditaveis = _cnpjNaoEncontrado;

    return Scaffold(
      appBar: AppBar(title: const Text('Nova Inspeção')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [

            // ── CNPJ + Buscar ──
            Text('CNPJ do Estabelecimento', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: theme.colorScheme.primary)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _cnpjCtrl,
                    keyboardType: TextInputType.number,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      LengthLimitingTextInputFormatter(14),
                      _CnpjFormatter(),
                    ],
                    decoration: InputDecoration(
                      hintText: '00.000.000/0000-00',
                      prefixIcon: const Icon(Icons.business),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                    ),
                    validator: (v) {
                      if (v == null || v.replaceAll(RegExp(r'\D'), '').length != 14) return 'CNPJ inválido';
                      return null;
                    },
                    onChanged: (_) => setState(() {
                      _estabelecimentoEncontrado = null;
                      _cnpjNaoEncontrado = false;
                    }),
                  ),
                ),
                const SizedBox(width: 8),
                SizedBox(
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _buscando || !cnpjValido ? null : _buscarCnpj,
                    style: ElevatedButton.styleFrom(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                    ),
                    child: _buscando
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('Buscar'),
                  ),
                ),
              ],
            ),

            // ── Feedback da busca ──
            if (_estabelecimentoEncontrado != null) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, color: Colors.green.shade600, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Estabelecimento encontrado: ${_estabelecimentoEncontrado!.nomeExibicao}',
                        style: TextStyle(color: Colors.green.shade700, fontWeight: FontWeight.w600, fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            if (_cnpjNaoEncontrado) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.amber.shade200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: Colors.amber.shade700, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'CNPJ não cadastrado. Preencha os dados abaixo para cadastrar o estabelecimento.',
                        style: TextStyle(color: Colors.amber.shade800, fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // ── Campos do estabelecimento ──
            if (mostrarCampos) ...[
              const SizedBox(height: 20),
              const Divider(),
              const SizedBox(height: 8),

              Text('Dados do Estabelecimento',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: theme.colorScheme.primary)),
              const SizedBox(height: 12),

              _campo(
                ctrl: _razaoCtrl,
                label: 'Razão Social *',
                hint: 'Nome jurídico',
                icone: Icons.store,
                editavel: camposEditaveis,
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Obrigatório' : null,
              ),
              const SizedBox(height: 12),
              _campo(
                ctrl: _fantasiaCtrl,
                label: 'Nome Fantasia',
                hint: 'Nome comercial',
                icone: Icons.storefront,
                editavel: camposEditaveis,
              ),
              const SizedBox(height: 12),
              _campo(
                ctrl: _enderecoCtrl,
                label: 'Endereço',
                hint: 'Rua, número, bairro...',
                icone: Icons.location_on_outlined,
                editavel: camposEditaveis,
              ),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(
                  child: _campo(
                    ctrl: _telefoneCtrl,
                    label: 'Telefone',
                    hint: '(00) 00000-0000',
                    icone: Icons.phone_outlined,
                    editavel: camposEditaveis,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _campo(
                    ctrl: _emailCtrl,
                    label: 'Email',
                    hint: 'email@...',
                    icone: Icons.email_outlined,
                    editavel: camposEditaveis,
                    keyboardType: TextInputType.emailAddress,
                  ),
                ),
              ]),

              const SizedBox(height: 28),

              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: _criando ? null : _iniciarInspecao,
                  icon: _criando
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.assignment_turned_in),
                  label: Text(
                    _criando ? 'Iniciando...' : 'INICIAR INSPEÇÃO',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                ),
              ),
            ],

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _campo({
    required TextEditingController ctrl,
    required String label,
    required String hint,
    required IconData icone,
    required bool editavel,
    String? Function(String?)? validator,
    TextInputType? keyboardType,
  }) {
    return TextFormField(
      controller: ctrl,
      readOnly: !editavel,
      keyboardType: keyboardType,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icone),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        filled: !editavel,
        fillColor: !editavel ? Colors.grey.shade100 : null,
      ),
    );
  }
}

// Formatador de CNPJ
class _CnpjFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue old, TextEditingValue newVal) {
    final digits = newVal.text.replaceAll(RegExp(r'\D'), '');
    final buffer = StringBuffer();
    for (int i = 0; i < digits.length; i++) {
      if (i == 2 || i == 5) buffer.write('.');
      if (i == 8) buffer.write('/');
      if (i == 12) buffer.write('-');
      buffer.write(digits[i]);
    }
    final formatted = buffer.toString();
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}