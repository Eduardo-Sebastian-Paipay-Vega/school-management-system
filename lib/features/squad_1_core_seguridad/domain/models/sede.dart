/// Entidad `instituciones` — raíz del aislamiento multi-tenant (RF-07).
/// Cada `Sede` es un `tenant_id` independiente; ningún repositorio debe
/// devolver datos de una sede distinta a la de la sesión activa.
class Sede {
  const Sede({
    required this.id,
    required this.codigoModular,
    required this.nombre,
    required this.nivelEducativo,
    required this.direccion,
    required this.telefono,
    required this.directorNombre,
    required this.activo,
    required this.createdAt,
  });

  final String id;
  final String codigoModular;
  final String nombre;
  final String nivelEducativo;
  final String direccion;
  final String telefono;
  final String directorNombre;
  final bool activo;
  final DateTime createdAt;

  Sede copyWith({
    String? nombre,
    String? nivelEducativo,
    String? direccion,
    String? telefono,
    String? directorNombre,
    bool? activo,
  }) {
    return Sede(
      id: id,
      codigoModular: codigoModular,
      nombre: nombre ?? this.nombre,
      nivelEducativo: nivelEducativo ?? this.nivelEducativo,
      direccion: direccion ?? this.direccion,
      telefono: telefono ?? this.telefono,
      directorNombre: directorNombre ?? this.directorNombre,
      activo: activo ?? this.activo,
      createdAt: createdAt,
    );
  }
}
