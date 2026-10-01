import 'dart:math';

/// En un backend real, la IP y el User-Agent vienen del request HTTP
/// entrante. Este cliente Flutter no tiene backend: `ClientContext` genera
/// una IP de LAN escolar plausible y estable durante la sesión de la app,
/// únicamente para que la bitácora de auditoría (RF-65, RF-67) tenga un
/// valor representativo que mostrar en la UI de la demo.
class ClientContext {
  ClientContext._internal() : ipAddress = _randomLanIp();

  static final ClientContext instance = ClientContext._internal();

  final String ipAddress;
  static const String userAgent = 'FlutterClient/1.0 (Squad1-Demo; guamanpoma.unsch.edu.pe)';

  static String _randomLanIp() {
    final random = Random();
    return '192.168.1.${10 + random.nextInt(200)}';
  }
}
