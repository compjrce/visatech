import 'package:flutter/material.dart';
import '../../models/resposta.dart';

class BotoesSimNao extends StatelessWidget {
  final TipoResposta? valor;
  final bool mostrarNa;
  final bool mostrarNo;
  final Function(TipoResposta) onChanged;

  const BotoesSimNao({
    Key? key,
    required this.valor,
    required this.onChanged,
    this.mostrarNa = false,
    this.mostrarNo = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      children: [
        _btn(TipoResposta.SIM, 'SIM', Colors.green),
        _btn(TipoResposta.NAO, 'NÃO', Colors.red),
        if (mostrarNa) _btn(TipoResposta.NA, 'N/A', Colors.grey),
        if (mostrarNo) _btn(TipoResposta.NO, 'N/O', Colors.blueGrey),
      ],
    );
  }

  Widget _btn(TipoResposta opcao, String label, Color cor) {
    final selecionado = valor == opcao;
    return InkWell(
      onTap: () => onChanged(opcao),
      borderRadius: BorderRadius.circular(8),
      child: AnimatedContainer(
        duration: Duration(milliseconds: 150),
        padding: EdgeInsets.symmetric(horizontal: 18, vertical: 8),
        decoration: BoxDecoration(
          color: selecionado ? cor : cor.withOpacity(0.08),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: selecionado ? cor : cor.withOpacity(0.3), width: 1.5),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selecionado ? Colors.white : cor,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}