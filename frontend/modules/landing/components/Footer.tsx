import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUpRight,
  Facebook,
  Instagram,
  Youtube,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t-4 border-brand bg-brand-dark text-white">
      <div className="content-width grid gap-12 py-20 lg:grid-cols-12">
        {/* Col 1: Identity & Authorities */}
        <div className="lg:col-span-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-accent-gold/40 bg-white p-2 shadow-lg">
              <Image
                src="/emblema-unsch-grabado.png"
                alt="Emblema Heráldico Grabado de la UNSCH"
                width={56}
                height={56}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent-gold">
                UNSCH · Fundada en 1677 · Ayacucho
              </span>
              <h3 className="text-xl font-black text-white">Guamán Poma de Ayala</h3>
              <p className="text-xs text-accent-cream/80">Planteles de Aplicación de la UNSCH</p>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-gray-300">
            Institución educativa pública de gestión directa adscrita a la Universidad Nacional de San
            Cristóbal de Huamanga. Formación integral para los líderes, científicos y profesionales del mañana.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs">
            <p className="font-extrabold text-accent-gold">Autoridades Institucionales:</p>
            <p className="mt-1 text-gray-200">
              <strong>Director General:</strong> Mg. Yecid Ramírez Chipana
            </p>
            <p className="mt-0.5 text-gray-200">
              <strong>Rector de la UNSCH:</strong> Dr. Emilio Germán Ramírez Roca
            </p>
            <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-accent-cream/70 font-mono">
              <span>Cód. Geográfico: 050101</span>
              <span>Cód. Local: 073968</span>
            </div>
          </div>

          {/* Quick links to all 8 pages */}
          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-accent-gold mb-2">
              Distribución de Páginas:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <Link href="/" className="hover:text-accent-gold transition">
                • Inicio
              </Link>
              <Link href="/por-que-elegirnos" className="hover:text-accent-gold transition">
                • ¿Por qué elegirnos?
              </Link>
              <Link href="/niveles" className="hover:text-accent-gold transition">
                • Niveles (Inicial, Prim, Sec)
              </Link>
              <Link href="/servicios" className="hover:text-accent-gold transition">
                • Servicios y Laboratorios
              </Link>
              <Link href="/testimonios" className="hover:text-accent-gold transition">
                • Testimonios y Egresados
              </Link>
              <Link href="/admision" className="hover:text-accent-gold transition">
                • Admisión y Matrícula 2027
              </Link>
              <Link href="/noticias" className="hover:text-accent-gold transition">
                • Noticias y Actualidad
              </Link>
              <Link href="/contacto" className="hover:text-accent-gold transition">
                • Contacto y Mesa de Partes
              </Link>
              <Link href="/intranet" className="hover:text-accent-gold transition font-bold text-accent-cream">
                • Intranet / Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>

        {/* Col 2: Direct Contact & Location */}
        <div className="lg:col-span-4">
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-accent-gold">
            Sede y Canales Oficiales
          </h4>
          <div className="mt-4 grid gap-3.5 text-xs text-gray-200">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-accent-gold" />
              <div>
                <strong className="text-white">Dirección Oficial:</strong>
                <p>Pasaje San Joaquín 101, Ayacucho, Perú.</p>
                <p className="text-[11px] text-gray-400">Ref: Av. Universitaria / Pasaje Huamán Poma S/N</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="shrink-0 text-accent-gold" />
              <div>
                <strong className="text-white">Teléfono de Sede:</strong>
                <p>(066) 312510 / Central UNSCH: (066) 322510</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={18} className="shrink-0 text-accent-gold" />
              <div>
                <strong className="text-white">Correo Institucional:</strong>
                <p>admision@guamanpoma-unsch.edu.pe</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={18} className="shrink-0 text-accent-gold" />
              <div>
                <strong className="text-white">Horario de Atención:</strong>
                <p>Lunes a Viernes: 8:00 AM - 1:00 PM / 2:30 PM - 5:00 PM</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook Oficial"
              className="rounded-full bg-white/10 p-2.5 transition hover:bg-accent-gold hover:text-brand-dark"
            >
              <Facebook size={18} />
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram Oficial"
              className="rounded-full bg-white/10 p-2.5 transition hover:bg-accent-gold hover:text-brand-dark"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube Institucional"
              className="rounded-full bg-white/10 p-2.5 transition hover:bg-accent-gold hover:text-brand-dark"
            >
              <Youtube size={18} />
            </a>
          </div>
        </div>

        {/* Col 3: Map & Legal */}
        <div className="lg:col-span-3">
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-accent-gold">
            Ubicación en el Mapa
          </h4>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/15 bg-white/5">
            <iframe
              title="Ubicación Colegio Guamán Poma UNSCH"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.22858178822!2d-74.22591!3d-13.15041!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91127df9c8b7db2d%3A0x7d6a5c2d3ef0824!2sUniversidad%20Nacional%20de%20San%20Crist%C3%B3bal%20de%20Huamanga!5e0!3m2!1ses!2spe!4v1700000000000!5m2!1ses!2spe"
              className="h-36 w-full border-0 opacity-80 transition hover:opacity-100"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="mt-4 flex flex-col gap-2 text-xs text-accent-cream/80">
            <a
              href="https://goo.gl/maps/ayacucho"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-white"
            >
              <span>Abrir en Google Maps</span>
              <ArrowUpRight size={13} className="text-accent-gold" />
            </a>
            <Link href="/contacto" className="hover:text-white">
              Libro de Reclamaciones (Normativa MINEDU)
            </Link>
            <Link href="/contacto" className="hover:text-white">
              Términos y Políticas de Privacidad
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom copyright & attribution line */}
      <div className="border-t border-white/10 py-6">
        <div className="content-width flex flex-col items-center justify-between gap-4 text-center text-xs text-accent-cream/70 md:flex-row md:text-left">
          <div>
            <p>
              © 2026 Planteles de Aplicación &ldquo;Guamán Poma de Ayala&rdquo; · Universidad Nacional de San
              Cristóbal de Huamanga. Todos los derechos reservados.
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-accent-gold">
              Huamanga, Ayacucho · Perú
            </p>
          </div>

          {/* Creado con el apoyo de democra.pro */}
          <a
            href="https://democra.pro"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-1.5 pl-2 pr-3.5 text-xs text-accent-cream/80 backdrop-blur transition hover:border-accent-gold/50 hover:bg-white/10 hover:text-white active:scale-[0.98]"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 shadow-sm transition group-hover:scale-105">
              <Image
                src="/democra-emblema.png"
                alt="Emblema democra.pro"
                width={20}
                height={20}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-[11px] text-gray-300">Creado con el apoyo de</span>
              <span className="font-extrabold text-white group-hover:text-accent-gold transition">
                democra.pro
              </span>
              <ArrowUpRight
                size={12}
                className="text-accent-gold transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>
          </a>
        </div>
      </div>
    </footer>
  );
}
