'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  QrCode,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Award,
} from 'lucide-react';
import { useCoreSession } from '../squad_1_core/SessionProvider';

interface IssuedDoc {
  id: string;
  tipo: string;
  estudiante_id: string;
  token_verificacion: string;
  hash_sha256: string;
  fecha_emision: string;
  estudiante_nombres: string | null;
  estudiante_apellido: string | null;
}

interface StudentOption {
  estudiante_id: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  grado: number;
  seccion: string;
}

export default function SecretariaModuleView() {
  const { request } = useCoreSession();
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState('');
  const [docs, setDocs] = useState<IssuedDoc[]>([]);
  const [message, setMessage] = useState('');
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Form states for new issuance
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedDocType, setSelectedDocType] = useState<string>('BOLETA_NOTAS');
  const [issueReason, setIssueReason] = useState<string>('Trámite regular de Secretaría 2026');

  const loadDocsAndStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [docsData, rankData] = await Promise.all([
        request<IssuedDoc[]>('/documents'),
        request<StudentOption[]>('/analytics/academic/merit-ranking'),
      ]);

      setDocs(docsData || []);
      setStudents(rankData || []);
      if (rankData && rankData.length > 0 && !selectedStudentId) {
        setSelectedStudentId(rankData[0].estudiante_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar documentos emitidos.');
    } finally {
      setLoading(false);
    }
  }, [request, selectedStudentId]);

  useEffect(() => {
    void loadDocsAndStudents();
  }, [loadDocsAndStudents]);

  // RF-59, RF-61: Emitir documento oficial con firma SHA-256 inmutable
  const handleIssueDoc = async () => {
    if (!selectedStudentId) {
      setError('Por favor seleccione un estudiante de la nómina.');
      return;
    }
    setIssuing(true);
    setError('');
    setMessage('');
    try {
      const res = await request<{
        id: string;
        tokenVerificacion: string;
        hashSha256: string;
        urlVerificacionPublica: string;
      }>('/documents/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: selectedDocType,
          estudianteId: selectedStudentId,
          metadataAdicional: {
            motivo: issueReason.trim(),
            plantel: 'Planteles de Aplicación Guamán Poma de Ayala - UNSCH',
          },
        }),
      });

      setMessage(`¡Documento oficial emitido con éxito! Token generado: ${res.tokenVerificacion.slice(0, 16)}...`);
      await loadDocsAndStudents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo emitir el documento.');
    } finally {
      setIssuing(false);
    }
  };

  const handleCopyLink = (tokenVerif: string) => {
    const url = `${window.location.origin}/verificar/${tokenVerif}`;
    void navigator.clipboard.writeText(url);
    setCopiedToken(tokenVerif);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/intranet"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 hover:text-brand hover:border-brand transition shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-brand/10 px-2 py-0.5 text-[10px] font-extrabold text-brand uppercase">
                Squad 5 · Secretaría y Portal Web
              </span>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs text-gray-500 font-mono">Emisión Oficial & Verificador QR</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-brand-dark">
              Emisión de Documentos Oficiales y Verificación SHA-256
            </h2>
          </div>
        </div>

        <button
          onClick={() => void loadDocsAndStudents()}
          className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:border-brand shadow-sm transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-brand' : ''} />
          <span>Actualizar Archivo</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      {/* Two Column Cards: Form & Info */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Issuance Form */}
        <div className="lg:col-span-7 rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-brand-dark">Generador Oficial de Documentos</h3>
              <p className="text-xs text-gray-500">
                Firma criptográfica SHA-256 inmutable y token QR según la Ley 29733.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Seleccionar Estudiante Matriculado:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 font-medium text-gray-800 focus:border-brand focus:ring-1 focus:ring-brand outline-hidden"
              >
                {students.map((st) => (
                  <option key={st.estudiante_id} value={st.estudiante_id}>
                    {st.apellido_paterno} {st.apellido_materno || ''}, {st.nombres} (Secundaria {st.grado}° &quot;{st.seccion}&quot;)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tipo de Documento Oficial:</label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 font-medium text-gray-800 focus:border-brand focus:ring-1 focus:ring-brand outline-hidden"
                >
                  <option value="BOLETA_NOTAS">Boleta de Notas</option>
                  <option value="CERTIFICADO_ESTUDIOS">Certificado de Estudios</option>
                  <option value="CONSTANCIA_MATRICULA">Constancia de Matrícula</option>
                  <option value="CONSTANCIA_CONDUCTA">Constancia de Conducta</option>
                  <option value="ACTA_OFICIAL">Acta Oficial</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Motivo / Trámite:</label>
                <input
                  type="text"
                  value={issueReason}
                  onChange={(e) => setIssueReason(e.target.value)}
                  placeholder="Ej. Matrícula universitaria, traslado..."
                  className="w-full rounded-xl border border-gray-300 p-2.5 font-medium text-gray-800 focus:border-brand focus:ring-1 focus:ring-brand outline-hidden"
                />
              </div>
            </div>

            <button
              onClick={() => void handleIssueDoc()}
              disabled={issuing}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-brand-dark transition disabled:opacity-50"
            >
              {issuing ? <RefreshCw size={14} className="animate-spin" /> : <Award size={14} />}
              <span>{issuing ? 'Firmando y Grabando en Supabase...' : 'Emitir y Firmar Criptográficamente'}</span>
            </button>
          </div>
        </div>

        {/* Public Verification Info Card */}
        <div className="lg:col-span-5 rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <QrCode size={20} />
            </div>
            <h3 className="text-base font-black text-brand-dark">Verificación Pública Desacoplada (RF-60)</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Cualquier universidad, institución o apoderado puede verificar la validez de los certificados emitidos escaneando el código QR impreso, sin necesidad de iniciar sesión en la intranet.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-2xl bg-accent-ivory p-4 border border-accent-cream flex items-start gap-3">
              <ShieldCheck size={20} className="text-utility-success shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-gray-800">Servicio Público Activo</span>
                <p className="text-gray-600 text-[11px]">
                  Ruta pública: <code>/verificar/:token</code> conectada a <code>GET /api/v1/public/verify/:token</code>.
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-[11px] text-gray-500 font-mono">
              Sello Criptográfico: SHA-256 inmutable auditado bajo el rol <code>sms_runtime</code> de Supabase.
            </div>
          </div>
        </div>
      </div>

      {/* Issued Documents List from Supabase */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-brand-dark flex items-center gap-2">
              <FileText size={18} className="text-brand" />
              <span>Archivo Histórico de Documentos Emitidos (Supabase DB)</span>
            </h3>
            <p className="text-xs text-gray-500">
              Registros inmutables con enlace de verificación y certificado en línea.
            </p>
          </div>
          <span className="text-xs font-mono text-gray-500 font-bold">
            Total en archivo: {docs.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-accent-ivory text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Estudiante Titular</th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-4">Firma Digital (SHA-256)</th>
                <th className="py-3 px-3 text-center">Emisión</th>
                <th className="py-3 px-4 text-center">Verificación Pública QR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    <RefreshCw size={20} className="mx-auto mb-2 animate-spin text-brand" />
                    Cargando archivo documental desde Supabase...
                  </td>
                </tr>
              ) : docs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No hay documentos emitidos aún. Seleccione un alumno y emita su documento arriba.
                  </td>
                </tr>
              ) : (
                docs.map((d, i) => (
                  <tr key={d.id} className="hover:bg-accent-ivory/20 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-gray-400">{i + 1}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {d.estudiante_apellido ? `${d.estudiante_apellido}, ${d.estudiante_nombres}` : 'Estudiante registrado'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded-md bg-brand/10 px-2 py-0.5 font-bold text-brand text-[11px]">
                        {d.tipo.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-gray-500">
                      {d.hash_sha256 ? `${d.hash_sha256.slice(0, 18)}...` : '-'}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-600 font-mono text-[11px]">
                      {d.fecha_emision ? d.fecha_emision.slice(0, 10) : 'Hoy'}
                    </td>
                    <td className="py-3 px-4 text-center space-x-2">
                      <Link
                        href={`/verificar/${d.token_verificacion}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-bold text-brand hover:border-brand hover:bg-brand/5 transition shadow-2xs"
                        title="Abrir página pública de verificación"
                      >
                        <ExternalLink size={12} />
                        <span>Ver Certificado</span>
                      </Link>

                      <button
                        onClick={() => handleCopyLink(d.token_verificacion)}
                        className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 hover:border-gray-400 transition shadow-2xs"
                        title="Copiar enlace público de verificación"
                      >
                        {copiedToken === d.token_verificacion ? (
                          <>
                            <Check size={12} className="text-utility-success" />
                            <span className="text-utility-success font-bold">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copiar Link</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
