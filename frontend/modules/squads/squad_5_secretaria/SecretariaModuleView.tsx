'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  QrCode,
  Download,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
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

export default function SecretariaModuleView() {
  const { request } = useCoreSession();
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState('');
  const [docs, setDocs] = useState<IssuedDoc[]>([]);
  const [message, setMessage] = useState('');

  const loadDocs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await request<IssuedDoc[]>('/documents');
      setDocs(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar documentos emitidos.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    void loadDocs();
  }, [loadDocs]);

  const handleIssueSampleDoc = async () => {
    setIssuing(true);
    setError('');
    setMessage('');
    try {
      // Obtener el primer estudiante
      const ranking = await request<Array<{ estudiante_id: string }>>('/analytics/academic/merit-ranking');
      if (!ranking || ranking.length === 0) {
        throw new Error('No hay estudiantes disponibles para emitir documento.');
      }
      const stId = ranking[0].estudiante_id;

      const res = await request<{
        id: string;
        tokenVerificacion: string;
        hashSha256: string;
        urlVerificacionPublica: string;
      }>('/documents/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'BOLETA_NOTAS',
          estudianteId: stId,
          metadataAdicional: {
            motivo: 'Emisión oficial Bimestre I 2026',
            plantel: 'Planteles de Aplicación Guamán Poma de Ayala - UNSCH',
          },
        }),
      });

      setMessage(`Documento emitido con éxito. Token QR: ${res.tokenVerificacion.slice(0, 16)}...`);
      await loadDocs();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo emitir el documento.');
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="space-y-6">
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
                Squad 5 · Secretaría y Portal
              </span>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs text-gray-500 font-mono">Conexión Supabase PostgreSQL en Vivo</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-brand-dark">
              Emisión de Boletas Oficiales y Verificador QR SHA-256
            </h2>
          </div>
        </div>

        <button
          onClick={() => void loadDocs()}
          className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:border-brand shadow-sm transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-brand' : ''} />
          <span>Actualizar Lista</span>
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

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 text-brand">
            <FileText size={22} />
          </div>
          <h3 className="text-lg font-black text-brand-dark">Generador de Documentos Oficiales</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Emisión de boletas con membrete institucional de la UNSCH, firma criptográfica inmutable y código QR con token SHA-256 verificado en Supabase.
          </p>
          <button
            onClick={() => void handleIssueSampleDoc()}
            disabled={issuing}
            className="flex items-center gap-2 rounded-2xl bg-brand px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-brand-dark transition disabled:opacity-50"
          >
            {issuing ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
            <span>{issuing ? 'Firmando en Supabase...' : 'Emitir Boleta Oficial (Prueba)'}</span>
          </button>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 text-brand">
            <QrCode size={22} />
          </div>
          <h3 className="text-lg font-black text-brand-dark">Verificación Pública de Autenticidad</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Permite a apoderados y universidades verificar la autenticidad de un certificado escaneando su código QR único con resolución multi-tenant sin exponer datos privados.
          </p>
          <div className="rounded-2xl bg-accent-ivory p-4 border border-accent-cream text-xs flex items-center gap-3">
            <ShieldCheck size={20} className="text-utility-success shrink-0" />
            <span className="text-gray-700">Endpoint público activo: <code>GET /api/v1/public/verify/:token</code></span>
          </div>
        </div>
      </div>

      {/* Issued Documents List from Supabase */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-brand-dark flex items-center gap-2">
            <FileText size={18} className="text-brand" />
            <span>Documentos Oficiales Emitidos (Supabase DB)</span>
          </h3>
          <span className="text-xs font-mono text-gray-500 font-bold">
            Total en archivo: {docs.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-accent-ivory text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Estudiante</th>
                <th className="py-3 px-3">Tipo de Documento</th>
                <th className="py-3 px-4">Token QR de Verificación</th>
                <th className="py-3 px-4">Hash SHA-256</th>
                <th className="py-3 px-3 text-center">Fecha Emisión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    <RefreshCw size={20} className="mx-auto mb-2 animate-spin text-brand" />
                    Cargando archivo documental desde Supabase...
                  </td>
                </tr>
              ) : docs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No hay documentos emitidos aún. Haz clic en &quot;Emitir Boleta Oficial&quot; arriba.
                  </td>
                </tr>
              ) : (
                docs.map((d, i) => (
                  <tr key={d.id} className="hover:bg-accent-ivory/20 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-gray-400">{i + 1}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {d.estudiante_apellido ? `${d.estudiante_apellido}, ${d.estudiante_nombres}` : 'Estudiante registrado'}
                    </td>
                    <td className="py-3 px-3 font-semibold text-brand">
                      {d.tipo.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-gray-600">
                      <span className="rounded bg-gray-100 px-2 py-0.5 border">
                        {d.token_verificacion.slice(0, 20)}...
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-gray-400">
                      {d.hash_sha256 ? `${d.hash_sha256.slice(0, 16)}...` : '-'}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-600 font-mono">
                      {d.fecha_emision ? d.fecha_emision.slice(0, 10) : 'Hoy'}
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
