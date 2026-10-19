'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Calendar,
  FileCheck2,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Phone,
  Check,
  Download,
  Building2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const steps = [
  {
    number: '01',
    title: 'Pre-Inscripción y Solicitud Virtual',
    period: 'Noviembre – Diciembre 2026',
    desc: 'Completa el formulario en línea con los datos del estudiante y el apoderado para registrar el interés y descargar la ficha de postulación.',
    requirements: ['DNI vigente del postulante y ambos padres', 'Constancia de nacimiento (solo Inicial)'],
  },
  {
    number: '02',
    title: 'Entrevista Psicopedagógica Orientativa',
    period: 'Diciembre 2026 – Enero 2027',
    desc: 'Sesión breve de diálogo con la familia y evaluación diagnóstica de competencias básicas según el nivel al que postula.',
    requirements: ['Libreta de notas o informe de progreso 2026', 'Entrevista con especialista del departamento de psicología'],
  },
  {
    number: '03',
    title: 'Publicación de Padrón y Vacantes',
    period: 'Enero 2027',
    desc: 'Publicación de los resultados oficiales autorizados por la Dirección General y emisión de la constancia de vacante asignada.',
    requirements: ['Recepción de la carta oficial de vacante', 'Firma del compromiso educativo institucional'],
  },
  {
    number: '04',
    title: 'Formalización de Matrícula en SIAGIE',
    period: 'Febrero 2027',
    desc: 'Presentación física del expediente en secretaría académica y registro oficial en la plataforma SIAGIE del MINEDU.',
    requirements: ['Ficha única de matrícula SIAGIE', 'Certificado oficial de estudios visado por UGEL Huamanga'],
  },
];

const faqs = [
  {
    q: '¿Los Planteles de Aplicación cobran mensualidad o pensión?',
    a: 'No. Como colegio experimental adscrito a la Universidad Nacional de San Cristóbal de Huamanga (UNSCH), es una institución educativa pública de gestión directa donde la educación es gratuita según la Constitución. Únicamente se coordina el aporte voluntario y consensuado acordado en asamblea general de la APAFA para el mantenimiento y actividades extracurriculares.',
  },
  {
    q: '¿Cuál es la edad requerida para ingresar al Nivel Inicial?',
    a: 'Conforme a la normativa oficial del MINEDU, el niño o niña debe tener 3, 4 o 5 años cumplidos al 31 de marzo del año lectivo 2027 para ser admitido en el aula correspondiente.',
  },
  {
    q: '¿Cómo es el proceso de traslado para estudiantes de Primaria y Secundaria?',
    a: 'Los apoderados deben solicitar la vacante en nuestra secretaría virtual o presencial. Una vez emitida la carta de aceptación de vacante, el colegio de origen libera la matrícula en el sistema SIAGIE y emite el Certificado Oficial de Estudios para su radicación.',
  },
  {
    q: '¿Qué beneficios tienen los estudiantes de secundaria para ingresar a la UNSCH?',
    a: 'Nuestros alumnos participan de círculos de estudio preuniversitarios intensivos con simulacros periódicos diseñados bajo los estándares de la comisión de admisión de la UNSCH, lo que se traduce en uno de los índices de ingreso preferencial más altos de Huamanga.',
  },
  {
    q: '¿Dónde se entregan los expedientes físicos de matrícula?',
    a: 'En la Secretaría General de los Planteles de Aplicación, ubicada en Pasaje San Joaquín 101, Ayacucho (junto a la ciudad universitaria de la UNSCH), en el horario de 8:00 AM a 1:00 PM.',
  },
];

export default function AdmisionPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nombreApoderado: '',
    telefono: '',
    email: '',
    nivel: 'Secundaria',
    grado: '',
    colegioOrigen: '',
    mensaje: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreApoderado || !formData.telefono) return;
    setFormSubmitted(true);
  };

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-brand-dark py-20 text-white hero-one">
        <div className="content-width relative z-10">
          <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-accent-cream/80">
            <Link href="/" className="hover:text-accent-gold transition">
              Inicio
            </Link>
            <ChevronRight size={14} />
            <span className="text-white">Admisión 2027</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-gold/40 bg-black/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-gold backdrop-blur">
              <Calendar size={14} />
              <span>Convocatoria y Matrícula Oficial 2027</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.03em] leading-tight text-white">
              Proceso de Admisión{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cream via-accent-gold to-white">
                Guamán Poma 2027
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-accent-cream/90 leading-relaxed">
              Asegura una vacante en Inicial, Primaria o Secundaria en la institución pública de mayor prestigio
              educativo de Ayacucho, adscrita a la UNSCH.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content: Steps & Application Form */}
      <section className="content-width py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left: 4-Step Roadmap */}
          <div className="lg:col-span-6">
            <span className="rounded-full bg-accent-gold/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-brand-dark">
              Itinerario de Admisión
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-brand-dark sm:text-4xl">
              Los 4 Pasos para Obtener tu Vacante
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Un proceso ordenado, transparente y orientado a acompañar a tu familia en todo momento.
            </p>

            <div className="mt-10 grid gap-6">
              {steps.map(st => (
                <div
                  key={st.number}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:border-brand transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xl font-black text-brand bg-brand/10 px-3 py-1 rounded-xl">
                      Paso {st.number}
                    </span>
                    <span className="text-xs font-bold text-accent-rouge font-mono">
                      {st.period}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-black text-gray-900">{st.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">{st.desc}</p>

                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                      Requisitos clave:
                    </p>
                    <ul className="grid gap-1.5 text-xs text-gray-600">
                      {st.requirements.map(req => (
                        <li key={req} className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-accent-gold shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Official Seal Badge */}
            <div className="mt-8 flex items-center gap-4 rounded-3xl border border-accent-cream bg-accent-ivory/60 p-5 shadow-sm">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border border-gray-200 p-2 shadow-sm">
                <img
                  src="/emblema-unsch-grabado.png"
                  alt="Sello UNSCH"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-accent-rouge">
                  Garantía Universitaria UNSCH
                </p>
                <p className="text-sm font-black text-brand-dark">
                  Resolución Rectoral N° 050101 · Ayacucho
                </p>
                <p className="text-xs text-gray-500">Mesa de atención: (066) 312510</p>
              </div>
            </div>
          </div>

          {/* Right: Registration Form */}
          <div className="lg:col-span-6">
            <div className="sticky top-28 rounded-3xl border border-accent-cream bg-white p-8 shadow-elevated md:p-10">
              <div className="border-b border-gray-100 pb-5">
                <span className="rounded-full bg-brand/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-brand">
                  Formulario Oficial de Pre-Inscripción
                </span>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-brand-dark">
                  Reserva de Vacante 2027
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Ingresa los datos para recibir las bases de postulación y la cita para la entrevista familiar.
                </p>
              </div>

              {formSubmitted ? (
                <div className="py-12 text-center fade-in">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-utility-success/15 text-utility-success">
                    <Check size={36} />
                  </div>
                  <h4 className="mt-4 text-xl font-black text-brand-dark">
                    ¡Solicitud de Admisión Registrada!
                  </h4>
                  <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                    Estimado/a <strong>{formData.nombreApoderado}</strong>, hemos registrado la postulación para el{' '}
                    <strong>Nivel {formData.nivel}</strong>. Nos comunicaremos al número{' '}
                    <strong>{formData.telefono}</strong> con el prospecto y cronograma oficial.
                  </p>
                  <div className="mt-4 inline-block rounded-xl bg-accent-ivory px-4 py-2 font-mono text-xs font-bold text-brand">
                    Código de Registro: ADM-2027-{Math.floor(1000 + Math.random() * 9000)}
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="rounded-full bg-brand px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-dark transition"
                    >
                      Registrar otra postulación
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                      Nombre Completo del Apoderado *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Ej. Carmen Quispe Morales"
                      value={formData.nombreApoderado}
                      onChange={e => setFormData({ ...formData, nombreApoderado: e.target.value })}
                      className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                        Teléfono / WhatsApp *
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="Ej. 966 987 654"
                        value={formData.telefono}
                        onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                        className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        placeholder="apoderado@gmail.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                        Nivel de Postulación *
                      </label>
                      <select
                        value={formData.nivel}
                        onChange={e => setFormData({ ...formData, nivel: e.target.value })}
                        className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
                      >
                        <option value="Inicial">Nivel Inicial (3, 4 y 5 años)</option>
                        <option value="Primaria">Nivel Primaria (1° a 6° grado)</option>
                        <option value="Secundaria">Nivel Secundaria (1° a 5° año)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                        Grado al que postula *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Ej. 1er Grado / 4 años"
                        value={formData.grado}
                        onChange={e => setFormData({ ...formData, grado: e.target.value })}
                        className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                      Colegio de Procedencia (si aplica)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. I.E. Mariscal Cáceres / Ninguno si ingresa a Inicial"
                      value={formData.colegioOrigen}
                      onChange={e => setFormData({ ...formData, colegioOrigen: e.target.value })}
                      className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                      Consultas sobre vacante o requisitos especiales
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Escribe tus dudas sobre vacantes, horarios o modalidad de matrícula..."
                      value={formData.mensaje}
                      onChange={e => setFormData({ ...formData, mensaje: e.target.value })}
                      className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-brand-dark active:scale-95 transition"
                  >
                    <Send size={15} />
                    <span>Enviar Solicitud de Postulación 2027</span>
                  </button>

                  <p className="text-center text-[11px] text-gray-400">
                    Proceso sujeto al cuadro oficial de vacantes autorizado por la UNSCH y MINEDU.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Accordion */}
      <section className="border-t border-gray-200 bg-accent-ivory/50 py-24">
        <div className="content-width">
          <div className="mx-auto max-w-3xl text-center">
            <span className="rounded-full bg-accent-gold/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-brand-dark">
              Resuelve tus Dudas
            </span>
            <h3 className="mt-3 text-3xl font-black text-brand-dark sm:text-4xl">
              Preguntas Frecuentes sobre la Admisión
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Conoce las respuestas a las interrogantes más comunes de las familias postulantes.
            </p>
          </div>

          <div className="mt-12 mx-auto max-w-3xl grid gap-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-6 text-left"
                  >
                    <span className="text-base font-extrabold text-gray-900">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={cn(
                        'text-brand transition-transform duration-200 shrink-0 ml-4',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
