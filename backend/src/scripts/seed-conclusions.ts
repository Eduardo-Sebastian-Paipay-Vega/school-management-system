import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });
import { pool } from '../config/database';

async function seedConclusions() {
  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT count(*)::int AS count FROM banco_conclusiones_cneb');
    if (existing.rows[0].count > 0) {
      console.log('Banco de conclusiones ya poblado:', existing.rows[0].count);
      return;
    }

    const items = [
      // MATEMATICA
      {
        area: 'Matemática',
        competencia: 'Resuelve problemas de cantidad',
        nivel: 'AD',
        texto: 'Demuestra dominio sobresaliente al modelar situaciones complejas con expresiones numéricas racionales e irracionales, justificando rigurosamente sus procedimientos y proponiendo estrategias innovadoras.'
      },
      {
        area: 'Matemática',
        competencia: 'Resuelve problemas de cantidad',
        nivel: 'A',
        texto: 'Alcanza el nivel esperado. Selecciona y combina con fluidez estrategias de cálculo y estimación para resolver problemas con números enteros y racionales.'
      },
      {
        area: 'Matemática',
        competencia: 'Resuelve problemas de cantidad',
        nivel: 'B',
        texto: 'En proceso. Emplea algoritmos básicos pero requiere consolidar la justificación de propiedades numéricas y el control de errores en operaciones con fracciones y decimales.'
      },
      {
        area: 'Matemática',
        competencia: 'Resuelve problemas de cantidad',
        nivel: 'C',
        texto: 'En inicio. Requiere acompañamiento prioritario para interpretar enunciados problemáticos e identificar la operación aritmética adecuada.'
      },
      // COMUNICACION
      {
        area: 'Comunicación',
        competencia: 'Lee diversos tipos de textos escritos',
        nivel: 'AD',
        texto: 'Interpreta el sentido global del texto explicando la intención del autor, posturas críticas e intertextualidad con elevado juicio valorativo.'
      },
      {
        area: 'Comunicación',
        competencia: 'Lee diversos tipos de textos escritos',
        nivel: 'A',
        texto: 'Identifica información explícita e infiere relaciones de causa-efecto y conclusiones pertinentes a partir de los textos leídos.'
      },
      {
        area: 'Comunicación',
        competencia: 'Lee diversos tipos de textos escritos',
        nivel: 'B',
        texto: 'Reconoce ideas principales pero presenta dificultad al inferir sentidos implícitos o contraponer posturas en textos argumentativos.'
      },
      {
        area: 'Comunicación',
        competencia: 'Lee diversos tipos de textos escritos',
        nivel: 'C',
        texto: 'Requiere apoyo continuo para localizar información evidente y formular hipótesis iniciales de lectura.'
      },
      // CIENCIA Y TECNOLOGIA
      {
        area: 'Ciencia y Tecnología',
        competencia: 'Explica el mundo físico basándose en conocimientos científicos',
        nivel: 'AD',
        texto: 'Argumenta con solidez científica el impacto de la energía y la materia en los sistemas vivos y el medio ambiente, formulando soluciones sostenibles.'
      },
      {
        area: 'Ciencia y Tecnología',
        competencia: 'Explica el mundo físico basándose en conocimientos científicos',
        nivel: 'A',
        texto: 'Describe cuantitativa y cualitativamente los conceptos de leyes físicas y químicas aplicando modelos a situaciones cotidianas.'
      },
      {
        area: 'Ciencia y Tecnología',
        competencia: 'Explica el mundo físico basándose en conocimientos científicos',
        nivel: 'B',
        texto: 'Describe hechos naturales pero le cuesta interrelacionar conceptos teóricos con evidencias experimentales.'
      },
      {
        area: 'Ciencia y Tecnología',
        competencia: 'Explica el mundo físico basándose en conocimientos científicos',
        nivel: 'C',
        texto: 'Muestra dificultad para diferenciar hipótesis de conclusiones científicas; necesita refuerzo en el método indagatorio.'
      }
    ];

    for (const item of items) {
      await client.query(
        `INSERT INTO banco_conclusiones_cneb (area_curricular, competencia, nivel_logro, texto_plantilla)
         VALUES ($1, $2, $3::nivel_logro_cneb_enum, $4)`,
        [item.area, item.competencia, item.nivel, item.texto]
      );
    }

    console.log(`Pobladas ${items.length} conclusiones pedagógicas CNEB exitosamente.`);
  } finally {
    client.release();
    await pool.end();
  }
}

seedConclusions().catch(console.error);
