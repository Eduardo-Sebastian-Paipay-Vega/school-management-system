'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Building2,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  UserCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ContactoPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [contactData, setContactData] = useState({
    nombre: '',
    dni: '',
    telefono: '',
    email: '',
    tipoTramite: 'Consulta de Admisión',
    asunto: '',
    mensaje: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactData.nombre || !contactData.telefono) return;
    const generatedTicket = `MPV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setTicketNumber(generatedTicket);
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
            <span className="text-white">Contacto y Mesa de Partes</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-gold/40 bg-black/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-gold backdrop-blur">
              <Building2 size={14} />
              <span>Atención al Ciudadano y Comunidad Educativa</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.03em] leading-tight text-white">
              Contacto y{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cream via-accent-gold to-white">
                Mesa de Partes
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-accent-cream/90 leading-relaxed">
              Estamos a tu disposición para orientarte en trámites académicos, consultas de admisión y comunicación
              directa con las autoridades de los Planteles de Aplicación de la UNSCH.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Cards Grid */}
      <section className="content-width py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Ubicación */}
          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-card hover:border-brand transition">
            <div className="inline-flex rounded-2xl bg-brand/10 p-3.5 text-brand">
              <MapPin size={26} />
            </div>
            <h2 className="mt-5 text-lg font-black text-brand-dark">Sede Institucional</h2>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              Pasaje San Joaquín 101, Ayacucho, Perú.
            </p>
            <div className="mt-3 text-[11px] font-semibold text-accent-rouge">
              Ref: Av. Universitaria / Campus UNSCH
            </div>
            <div className="mt-4 border-t border-gray-100 pt-3 text-[11px] text-gray-400 font-mono">
              Cód. MINEDU: 050101
            </div>
          </div>

          {/* Card 2: Teléfonos */}
          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-card hover:border-brand transition">
            <div className="inline-flex rounded-2xl bg-accent-gold/20 p-3.5 text-brand-dark">
              <Phone size={26} />
            </div>
            <h2 className="mt-5 text-lg font-black text-brand-dark">Central y Teléfonos</h2>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              <strong>Sede Colegial:</strong> (066) 312510
            </p>
            <p className="mt-1 text-xs text-gray-600 leading-relaxed">
              <strong>Central UNSCH:</strong> (066) 322510 (Anx. 142)
            </p>
            <div className="mt-4 border-t border-gray-100 pt-3 text-[11px] font-bold text-brand">
              WhatsApp Admisión: 966 312 510
            </div>
          </div>

          {/* Card 3: Correos */}
          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-card hover:border-brand transition">
            <div className="inline-flex rounded-2xl bg-brand/10 p-3.5 text-brand">
              <Mail size={26} />
            </div>
            <h2 className="mt-5 text-lg font-black text-brand-dark">Correos Oficiales</h2>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed break-all">
              <strong>Admisión:</strong> admision@guamanpoma-unsch.edu.pe
            </p>
            <p className="mt-1 text-xs text-gray-600 leading-relaxed break-all">
              <strong>Mesa de Partes:</strong> mesadepartes@guamanpoma-unsch.edu.pe
            </p>
            <div className="mt-4 border-t border-gray-100 pt-3 text-[11px] text-gray-400">
              Respuesta en 24 a 48 hrs hábiles
            </div>
          </div>

          {/* Card 4: Horarios */}
          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-card hover:border-brand transition">
            <div className="inline-flex rounded-2xl bg-accent-ivory p-3.5 text-brand">
              <Clock size={26} />
            </div>
            <h2 className="mt-5 text-lg font-black text-brand-dark">Horario de Atención</h2>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              <strong>Lunes a Viernes:</strong>
            </p>
            <p className="mt-0.5 text-xs text-gray-600">8:00 AM – 1:00 PM</p>
            <p className="mt-0.5 text-xs text-gray-600">2:30 PM – 5:00 PM</p>
            <div className="mt-4 border-t border-gray-100 pt-3 text-[11px] font-bold text-accent-rouge">
              Sábados y Domingos: Cerrado
            </div>
          </div>
        </div>
      </section>

      {/* Main Form & Map Section */}
      <section className="border-t border-gray-200 bg-accent-ivory/50 py-20">
        <div className="content-width">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Left: Mesa de Partes Virtual Form */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-accent-cream bg-white p-8 sm:p-10 shadow-elevated">
                <div className="border-b border-gray-100 pb-5">
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-brand">
                    Mesa de Partes Digital
                  </span>
                  <h3 className="mt-2 text-2xl font-black text-brand-dark sm:text-3xl">
                    Envío de Trámites y Consultas
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Registra tu documento oficial, solicitud de constancia o consulta institucional.
                  </p>
                </div>

                {formSubmitted ? (
                  <div className="py-12 text-center fade-in">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-utility-success/15 text-utility-success">
                      <CheckCircle2 size={38} />
                    </div>
                    <h4 className="mt-4 text-xl font-black text-brand-dark">
                      ¡Trámite Ingresado con Éxito!
                    </h4>
                    <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                      Estimado/a <strong>{contactData.nombre}</strong>, tu solicitud ha sido derivada a la Secretaría General.
                    </p>

                    <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-accent-ivory border border-accent-cream px-5 py-3 shadow-sm">
                      <FileText size={18} className="text-brand" />
                      <div className="text-left">
                        <div className="text-[10px] font-bold uppercase text-gray-500">Número de Expediente:</div>
                        <div className="font-mono text-sm font-black text-brand">{ticketNumber}</div>
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-gray-400">
                      Guarda este número para realizar el seguimiento en Mesa de Partes.
                    </p>

                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="mt-6 rounded-full bg-brand px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
                    >
                      Ingresar otro trámite
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                          Nombre y Apellidos *
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="Ej. Juan Pérez Huamán"
                          value={contactData.nombre}
                          onChange={e => setContactData({ ...contactData, nombre: e.target.value })}
                          className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                          DNI o Carné de Extranjería *
                        </label>
                        <input
                          required
                          type="text"
                          maxLength={12}
                          placeholder="Ej. 45892134"
                          value={contactData.dni}
                          onChange={e => setContactData({ ...contactData, dni: e.target.value })}
                          className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                          Teléfono de Contacto *
                        </label>
                        <input
                          required
                          type="tel"
                          placeholder="Ej. 966 123 456"
                          value={contactData.telefono}
                          onChange={e => setContactData({ ...contactData, telefono: e.target.value })}
                          className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          placeholder="usuario@correo.com"
                          value={contactData.email}
                          onChange={e => setContactData({ ...contactData, email: e.target.value })}
                          className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                        Tipo de Trámite o Solicitud *
                      </label>
                      <select
                        value={contactData.tipoTramite}
                        onChange={e => setContactData({ ...contactData, tipoTramite: e.target.value })}
                        className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white"
                      >
                        <option value="Consulta de Admisión">Consulta sobre Proceso de Admisión 2027</option>
                        <option value="Solicitud de Traslado">Solicitud de Traslado de Matrícula (Primaria / Secundaria)</option>
                        <option value="Certificado de Estudios">Emisión de Certificado Oficial de Estudios</option>
                        <option value="Constancia de Vacante">Emisión de Constancia de Vacante SIAGIE</option>
                        <option value="Solicitud General">Solicitud Administrativa General (FUT)</option>
                        <option value="Otro">Otro Asunto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                        Asunto del Trámite *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Ej. Solicitud de constancia de no adeudo / Traslado"
                        value={contactData.asunto}
                        onChange={e => setContactData({ ...contactData, asunto: e.target.value })}
                        className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                        Detalle del Mensaje o Solicitud *
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Describe detalladamente el requerimiento..."
                        value={contactData.mensaje}
                        onChange={e => setContactData({ ...contactData, mensaje: e.target.value })}
                        className="mt-1.5 w-full rounded-2xl border border-gray-300 bg-accent-ivory/50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-brand-dark active:scale-95 transition"
                    >
                      <Send size={15} />
                      <span>Ingresar Documento a Mesa de Partes</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right: Map & Authorities Directory */}
            <div className="lg:col-span-5 space-y-8">
              {/* Interactive Google Maps */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-extrabold text-brand-dark flex items-center gap-2">
                  <MapPin size={18} className="text-accent-gold" />
                  <span>Ubicación Satelital en Ayacucho</span>
                </h3>
                <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
                  <iframe
                    title="Ubicación Detallada Colegio Guamán Poma UNSCH"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.22858178822!2d-74.22591!3d-13.15041!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91127df9c8b7db2d%3A0x7d6a5c2d3ef0824!2sUniversidad%20Nacional%20de%20San%20Crist%C3%B3bal%20de%20Huamanga!5e0!3m2!1ses!2spe!4v1700000000000!5m2!1ses!2spe"
                    className="h-64 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="mt-4">
                  <a
                    href="https://goo.gl/maps/ayacucho"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand hover:underline"
                  >
                    <span>Ver ruta en Google Maps</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>

              {/* Directoria de Autoridades */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-extrabold text-brand-dark flex items-center gap-2">
                  <UserCheck size={18} className="text-accent-rouge" />
                  <span>Directorio de Autoridades</span>
                </h3>
                <div className="mt-4 divide-y divide-gray-100 text-xs">
                  <div className="py-2.5">
                    <div className="font-extrabold text-gray-900">Dr. Emilio Germán Ramírez Roca</div>
                    <div className="text-accent-gold font-medium">Rector de la UNSCH</div>
                  </div>
                  <div className="py-2.5">
                    <div className="font-extrabold text-gray-900">Mg. Yecid Ramírez Chipana</div>
                    <div className="text-brand font-medium">Director General de los Planteles de Aplicación</div>
                  </div>
                  <div className="py-2.5">
                    <div className="font-extrabold text-gray-900">Prof. Alberto Alfredo Palomino Rivera</div>
                    <div className="text-gray-500 font-medium">Responsable Nivel Inicial</div>
                  </div>
                  <div className="py-2.5">
                    <div className="font-extrabold text-gray-900">Secretaría Académica General</div>
                    <div className="text-gray-500 font-medium">Atención de Certificados y SIAGIE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
