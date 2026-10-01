import 'dart:typed_data';
import 'package:csv/csv.dart';
import 'package:excel/excel.dart' as xl;

import '../../domain/repositories/user_repository.dart';
import '../../shared/failures.dart';

/// Columnas reglamentarias de la plantilla de importación (RF-06):
/// `dni, nombres, apellidos, email, rol[, telefono]`.
class UserImportParser {
  const UserImportParser();

  static const List<String> requiredColumns = ['dni', 'nombres', 'apellidos', 'email', 'rol'];

  /// Parsea un archivo `.csv` (texto plano) a filas crudas, sin aplicar
  /// todavía las reglas de negocio (eso ocurre en `UserRepository.importUsers`).
  List<UserImportRow> parseCsv(String content) {
    const converter = CsvToListConverter(eol: '\n', shouldParseNumbers: false);
    final rows = converter.convert(content);
    return _mapRows(rows);
  }

  /// Parsea la primera hoja de un archivo `.xlsx` (paquete `excel` ^4.x,
  /// API basada en `CellValue` tipado por celda).
  List<UserImportRow> parseXlsx(Uint8List bytes) {
    final workbook = xl.Excel.decodeBytes(bytes);
    if (workbook.tables.isEmpty) {
      throw const ValidationFailure('El archivo Excel no contiene hojas de datos.');
    }
    final sheet = workbook.tables[workbook.tables.keys.first]!;
    final rows = sheet.rows
        .map((row) => row.map(_cellToString).toList())
        .toList();
    return _mapRows(rows);
  }

  String _cellToString(xl.Data? cell) {
    final value = cell?.value;
    if (value == null) return '';
    if (value is xl.TextCellValue) return value.value.toString();
    if (value is xl.IntCellValue) return value.value.toString();
    if (value is xl.DoubleCellValue) return value.value.toString();
    if (value is xl.BoolCellValue) return value.value.toString();
    return value.toString();
  }

  List<UserImportRow> _mapRows(List<List<dynamic>> rawRows) {
    if (rawRows.isEmpty) {
      throw const ValidationFailure('El archivo está vacío.');
    }

    var dataRows = rawRows;
    final header = rawRows.first.map((c) => c.toString().trim().toLowerCase()).toList();
    final looksLikeHeader = header.contains('dni') && header.contains('email');
    var columnIndex = {'dni': 0, 'nombres': 1, 'apellidos': 2, 'email': 3, 'rol': 4, 'telefono': 5};

    if (looksLikeHeader) {
      dataRows = rawRows.skip(1).toList();
      columnIndex = {
        for (final col in [...requiredColumns, 'telefono'])
          if (header.contains(col)) col: header.indexOf(col),
      };
      final missing = requiredColumns.where((c) => !columnIndex.containsKey(c));
      if (missing.isNotEmpty) {
        throw ValidationFailure(
          'Faltan columnas obligatorias en la plantilla: ${missing.join(", ")}.',
        );
      }
    }

    final result = <UserImportRow>[];
    for (var i = 0; i < dataRows.length; i++) {
      final row = dataRows[i];
      if (row.every((c) => c.toString().trim().isEmpty)) continue;
      String cell(String col) {
        final idx = columnIndex[col];
        if (idx == null || idx >= row.length) return '';
        return row[idx].toString().trim();
      }

      result.add(UserImportRow(
        rowNumber: i + (looksLikeHeader ? 2 : 1),
        dni: cell('dni'),
        nombres: cell('nombres'),
        apellidos: cell('apellidos'),
        email: cell('email'),
        rolCode: cell('rol'),
        telefono: columnIndex.containsKey('telefono') ? cell('telefono') : null,
      ));
    }
    return result;
  }
}
