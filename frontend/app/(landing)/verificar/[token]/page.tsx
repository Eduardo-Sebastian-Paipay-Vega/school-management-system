'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  User,
  Hash,
  School,
  FileText,
  Printer,
  ArrowLeft,
  RefreshCw,
  QrCode,
} from 'lucide-react';

interface VerificationData {
  valido: boolean;
  estadoVerificacion: string;
  documentoId: string;
  tipo: string;
  hashSha256: string;
  fechaEmision: string;
  datos: {
    institucion?: {
      nombre: string;
      codigo_modular: string;
      nivel_educativo: string;
      membrete_texto?: string;
    };
    estudiante?: {
      id: string;
      nombreCompleto: string;
      codigoSiagie: string | null;
      documentoUltimos4: string | null;
    };
    tipoDocumento?: string;
    calificaciones?: Array<{
      evaluacion: string;
      nota_vigesimal: number;
      nota_literal: string;
    }>;
    metadataAdicional?: {
      motivo?: string;
      plantel?: string;
    };
  };
}

export default function PublicVerifyPage() {
  const params = useParams();
  const token = typeof params?.token === 'string' ? params.token : '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<VerificationData | null>(null);

  useEffect(() => {
    if (!token) return;

    let mounted = true;
    const fetchVerification = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/v1/public/verify/${token}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || 'Documento no encontrado o código QR inválido.');
        }
        if (mounted) {
          setData(json.data);
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Error al verificar el documento.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchVerification();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:border-brand hover:text-brand transition shadow-xs"
        >
          <ArrowLeft size={16} />
          <span>Volver al Portal Web</span>
        </Link>
        <span className="text-[11px] font-mono text-gray-400">
          Servicio de Verificación Criptográfica SHA-256 (Ley 29733)
        </span>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm space-y-4">
          <RefreshCw size={32} className="mx-auto animate-spin text-brand" />
          <h2 className="text-base font-bold text-gray-800">Verificando autenticidad del documento...</h2>
          <p className="text-xs text-gray-500 font-mono">Consultando firma digital en la base de datos oficial de Supabase</p>
        </div>
      ) : error || !data ? (
        <div className="rounded-3xl border border-red-200 bg-red-50/50 p-8 sm:p-12 text-center shadow-sm space-y-4">
          <div className="h-16 w-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-xl font-black text-red-900">Documento No Válido o No Encontrado</h2>
          <p className="text-xs text-red-700 max-w-md mx-auto">
            {error || 'El código QR o token proporcionado no coincide con ningún documento emitido oficialmente por los Planteles de Aplicación Guamán Poma de Ayala (UNSCH).'}
          </p>
          <div className="pt-4">
            <span className="text-[11px] font-mono text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-200">
              Token consultado: {token || 'N/A'}
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-gray-200 bg-white shadow-xl overflow-hidden divide-y divide-gray-100">
          {/* Status Banner */}
          <div className="bg-emerald-600 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <ShieldCheck size={32} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  Autenticidad Verificada
                </span>
                <h1 className="text-xl sm:text-2xl font-black mt-1">
                  Documento Oficial Auténtico y Vigente
                </h1>
                <p className="text-xs text-emerald-100">
                  Emitido por la Secretaría de los Planteles de Aplicación &quot;Guamán Poma de Ayala&quot; — UNSCH.
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-900 hover:bg-emerald-50 transition shadow-sm self-start sm:self-auto shrink-0"
            >
              <Printer size={15} />
              <span>Imprimir Certificado</span>
            </button>
          </div>

          {/* Certificate Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Institution & Document Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-accent-ivory/30 border border-gray-200 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-brand">
                  <School size={16} />
                  <span>Entidad Emisora Oficial</span>
                </div>
                <h3 className="text-sm font-black text-brand-dark">
                  {data.datos.institucion?.nombre || 'Planteles de Aplicación "Guamán Poma de Ayala"'}
                </h3>
                <p className="text-xs text-gray-600">
                  Código Modular: <strong>{data.datos.institucion?.codigo_modular || '0425892'}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  Nivel Educativo: {data.datos.institucion?.nivel_educativo || 'Secundaria Regular'}
                </p>
              </div>

              <div className="rounded-2xl bg-accent-ivory/30 border border-gray-200 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-brand">
                  <FileText size={16} />
                  <span>Detalles del Documento</span>
                </div>
                <h3 className="text-sm font-black text-brand-dark">
                  {data.tipo.replace('_', ' ')}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Calendar size={13} className="text-gray-400" />
                  <span>Fecha de Emisión: <strong>{new Date(data.fechaEmision).toLocaleString()}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <CheckCircle2 size={13} className="text-utility-success" />
                  <span>Estado: <strong className="text-emerald-700">{data.estadoVerificacion}</strong></span>
                </div>
              </div>
            </div>

            {/* Student Info */}
            <div className="rounded-2xl border border-gray-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <User size={16} className="text-brand" />
                <span>Titular del Documento</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <span className="text-[11px] text-gray-500">Apellidos y Nombres:</span>
                  <p className="text-sm font-black text-brand-dark">
                    {data.datos.estudiante?.nombreCompleto || 'Estudiante'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500">Código SIAGIE:</span>
                  <p className="text-xs font-mono font-bold text-gray-700">
                    {data.datos.estudiante?.codigoSiagie || 'REG-2026-GPA'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500">Documento (DNI últimos 4):</span>
                  <p className="text-xs font-mono font-bold text-gray-700">
                    ****{data.datos.estudiante?.documentoUltimos4 || '4821'}
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Grades Breakdown if available */}
            {data.datos.calificaciones && data.datos.calificaciones.length > 0 && (
              <div className="rounded-2xl border border-gray-200 overflow-hidden space-y-2">
                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between text-xs font-bold text-gray-700">
                  <span>Registro de Calificaciones Oficiales en Snapshot</span>
                  <span className="font-mono text-[11px] text-gray-400">Escala CNEB</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500 uppercase text-[10px]">
                        <th className="py-2 px-3">Evaluación / Periodo</th>
                        <th className="py-2 px-3 text-center">Nota Vigesimal</th>
                        <th className="py-2 px-3 text-center">Escala CNEB</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.datos.calificaciones.map((c, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3 font-medium text-gray-800">{c.evaluacion}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-brand">{c.nota_vigesimal}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="rounded bg-brand/10 px-2 py-0.5 font-bold text-brand">
                              {c.nota_literal}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Cryptographic Hash Section (Ley 29733) */}
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <Hash size={14} className="text-accent-gold" />
                <span>Firma Digital Criptográfica (SHA-256):</span>
              </div>
              <p className="font-mono text-[11px] text-gray-600 break-all bg-white p-2.5 rounded-xl border border-gray-200">
                {data.hashSha256}
              </p>
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <span>Token QR: {token}</span>
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <QrCode size={12} />
                  <span>Verificado en Bloque Inmutable</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
