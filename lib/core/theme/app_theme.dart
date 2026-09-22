import 'package:flutter/material.dart';

/// Sistema de Diseño y Tema Visual Institucional
/// Combina la identidad de la UNSCH y del Plantel Guamán Poma de Ayala
class AppTheme {
  // Colores Primarios Institucionales
  static const Color primary = Color(0xFF0B5345); // Verde botella institucional
  static const Color primaryLight = Color(0xFF16A085);
  static const Color unschBlue = Color(0xFF1B4F72); // Azul histórico UNSCH
  static const Color accentGold = Color(0xFFD4AC0D); // Dorado académico

  // Escala Oficial CNEB (MINEDU)
  static const Color cnebAD = Color(0xFF1B4F72); // AD: Logro Destacado (Azul)
  static const Color cnebA = Color(0xFF27AE60);  // A: Logro Esperado (Verde)
  static const Color cnebB = Color(0xFFF39C12);  // B: En Proceso (Amarillo/Ámbar)
  static const Color cnebC = Color(0xFFC0392B);  // C: En Inicio (Rojo)

  // Estados Asistencia
  static const Color attendancePresente = Color(0xFF27AE60);
  static const Color attendanceTardanza = Color(0xFFF39C12);
  static const Color attendanceFalta = Color(0xFFE74C3C);
  static const Color attendanceJustificada = Color(0xFF2980B9);

  // Fondos y Superficies
  static const Color backgroundLight = Color(0xFFF8F9FA);
  static const Color surfaceWhite = Color(0xFFFFFFFF);
  static const Color textDark = Color(0xFF2C3E50);
  static const Color textMuted = Color(0xFF7F8C8D);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        primary: primary,
        secondary: unschBlue,
        surface: surfaceWhite,
      ),
      scaffoldBackgroundColor: backgroundLight,
      appBarTheme: const AppBarTheme(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: surfaceWhite,
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        ),
      ),
    );
  }
}
