import { Client, Service, Staff, Appointment, ClientPackage, BusinessConfig } from '../types';

export const INITIAL_BUSINESS_CONFIG: BusinessConfig = {
  name: 'Centro Estética & Fisioterapia Nova',
  phone: '+34 612 345 678',
  address: 'Calle Mayor 45, Planta 1',
  currency: '€',
  whatsappTemplate: 'Hola {cliente}, te recordamos tu cita para {servicio} el día {fecha} a las {hora} en {negocio}. ¡Te esperamos! Por favor responde para confirmar.',
};

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Limpieza Facial Profunda con Punta de Diamante',
    duration: 60,
    type: 'single',
    totalSessions: 1,
    price: 45,
    category: 'Estética Facial',
    color: 'emerald',
    description: 'Higiene facial completa, extracción suave y mascarilla descongestiva calmante.',
  },
  {
    id: 'srv-2',
    name: 'Tratamiento Reductivo & Cavitación (Bono 7 Sesiones)',
    duration: 50,
    type: 'multi',
    totalSessions: 7,
    price: 280,
    category: 'Estética Corporal',
    color: 'rose',
    description: 'Bono integral de 7 sesiones de aparatología y drenaje linfático.',
  },
  {
    id: 'srv-3',
    name: 'Fisioterapia & Rehabilitación Postural (Bono 5 Sesiones)',
    duration: 45,
    type: 'multi',
    totalSessions: 5,
    price: 195,
    category: 'Fisioterapia',
    color: 'indigo',
    description: 'Terapia manual individualizada, punción seca y reeducación funcional.',
  },
  {
    id: 'srv-4',
    name: 'Corte de Cabello, Brushing y Nutrición Capilar',
    duration: 75,
    type: 'single',
    totalSessions: 1,
    price: 55,
    category: 'Peluquería',
    color: 'amber',
    description: 'Diagnóstico capilar, tratamiento hidratante profundo y estilismo personalizado.',
  },
  {
    id: 'srv-5',
    name: 'Depilación Láser Diodo - Piernas Completas (Bono 6 Sesiones)',
    duration: 40,
    type: 'multi',
    totalSessions: 6,
    price: 240,
    category: 'Láser',
    color: 'sky',
    description: 'Bono de 6 sesiones con tecnología láser diodo indolora de alta potencia.',
  },
  {
    id: 'srv-6',
    name: 'Masaje Descontracturante & Terapéutico',
    duration: 60,
    type: 'single',
    totalSessions: 1,
    price: 50,
    category: 'Bienestar',
    color: 'teal',
    description: 'Alivio de tensiones musculares con aceites esenciales e infrarrojos.',
  },
];

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'stf-1',
    name: 'Dra. Elena Vega',
    role: 'Fisioterapeuta Colegiada',
    phone: '+34 600 111 222',
    color: '#4f46e5', // indigo-600
    active: true,
  },
  {
    id: 'stf-2',
    name: 'Sofía Rivas',
    role: 'Especialista en Cosmiatría',
    phone: '+34 600 333 444',
    color: '#e11d48', // rose-600
    active: true,
  },
  {
    id: 'stf-3',
    name: 'Carlos Mora',
    role: 'Estilista & Asesor de Imagen',
    phone: '+34 600 555 666',
    color: '#d97706', // amber-600
    active: true,
  },
  {
    id: 'stf-4',
    name: 'Mateo Castro',
    role: 'Kinesiólogo & Masoterapeuta',
    phone: '+34 600 777 888',
    color: '#0d9488', // teal-600
    active: true,
  },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Valeria Gómez Moreno',
    phone: '+34 677 889 900',
    email: 'valeria.gomez@example.com',
    notes: 'Piel reactiva a fragancias sintéticas. Prefiere citas en turno matutino.',
    createdAt: '2026-08-15',
  },
  {
    id: 'cli-2',
    name: 'Martín Alonso Herrera',
    phone: '+34 611 223 344',
    email: 'm.alonso@example.com',
    notes: 'Lesión lumbar L5-S1 en recuperación deportiva. Evitar cargas pesadas.',
    createdAt: '2026-09-02',
  },
  {
    id: 'cli-3',
    name: 'Camila Torres Ruiz',
    phone: '+34 655 443 322',
    email: 'camila.torres@example.com',
    notes: 'Realizando protocolo reductivo abdomen y flancos.',
    createdAt: '2026-09-10',
  },
  {
    id: 'cli-4',
    name: 'Diego Fernando Ramos',
    phone: '+34 699 001 122',
    email: 'diego.ramos@example.com',
    notes: 'Cliente habitual de corte y masaje mensual.',
    createdAt: '2026-07-20',
  },
  {
    id: 'cli-5',
    name: 'Lucía Mendoza Ortiz',
    phone: '+34 644 556 677',
    email: 'lucia.mendoza@example.com',
    notes: 'Bono láser diodo. Puntual siempre.',
    createdAt: '2026-08-30',
  },
  {
    id: 'cli-6',
    name: 'Andrés Gil Navarrete',
    phone: '+34 688 990 011',
    email: 'andres.gil@example.com',
    notes: 'Contractura cervical crónica por trabajo en escritorio.',
    createdAt: '2026-10-01',
  },
];

export const INITIAL_PACKAGES: ClientPackage[] = [
  {
    id: 'pkg-1',
    clientId: 'cli-3',
    serviceId: 'srv-2', // Reductivo (7 sesiones)
    totalSessions: 7,
    completedSessions: 3,
    scheduledSessions: 1, // sesión 4 agendada
    status: 'active',
    startDate: '2026-09-12',
    notes: 'Excelente respuesta en primeras 3 sesiones.',
  },
  {
    id: 'pkg-2',
    clientId: 'cli-2',
    serviceId: 'srv-3', // Fisioterapia (5 sesiones)
    totalSessions: 5,
    completedSessions: 2,
    scheduledSessions: 1, // sesión 3 agendada hoy
    status: 'active',
    startDate: '2026-09-20',
    notes: 'Evolución favorable, menor dolor matutino.',
  },
  {
    id: 'pkg-3',
    clientId: 'cli-5',
    serviceId: 'srv-5', // Láser diodo (6 sesiones)
    totalSessions: 6,
    completedSessions: 4,
    scheduledSessions: 1, // sesión 5 agendada esta semana
    status: 'active',
    startDate: '2026-08-30',
    notes: 'Disminución visible del 80% del vello.',
  },
];

// Helper to format date as YYYY-MM-DD
function getRelativeDateStr(dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateInitialAppointments(): Appointment[] {
  const today = getRelativeDateStr(0);
  const yesterday = getRelativeDateStr(-1);
  const tomorrow = getRelativeDateStr(1);
  const dayAfter = getRelativeDateStr(2);
  const in3Days = getRelativeDateStr(3);

  return [
    // --- HOY ---
    {
      id: 'apt-1',
      clientId: 'cli-1',
      serviceId: 'srv-1', // Limpieza facial
      staffId: 'stf-2', // Sofia
      date: today,
      startTime: '09:00',
      endTime: '10:00',
      status: 'completed',
      sessionNumber: 1,
      totalSessions: 1,
      notes: 'Tratamiento completado con éxito. Aplicado sérum de ácido hialurónico.',
      createdAt: yesterday,
    },
    {
      id: 'apt-2',
      clientId: 'cli-2',
      serviceId: 'srv-3', // Fisioterapia (sesión 3 de 5)
      staffId: 'stf-1', // Elena
      packageId: 'pkg-2',
      date: today,
      startTime: '10:30',
      endTime: '11:15',
      status: 'in_progress',
      sessionNumber: 3,
      totalSessions: 5,
      notes: 'Sesión enfocada en descompresión lumbar y estiramientos piramidales.',
      createdAt: yesterday,
    },
    {
      id: 'apt-3',
      clientId: 'cli-4',
      serviceId: 'srv-4', // Corte y peinado
      staffId: 'stf-3', // Carlos
      date: today,
      startTime: '12:00',
      endTime: '13:15',
      status: 'pending',
      sessionNumber: 1,
      totalSessions: 1,
      notes: 'Corte clásico degrafilado. Cliente solicitó café.',
      createdAt: yesterday,
    },
    {
      id: 'apt-4',
      clientId: 'cli-3',
      serviceId: 'srv-2', // Reductivo (sesión 4 de 7)
      staffId: 'stf-2', // Sofia
      packageId: 'pkg-1',
      date: today,
      startTime: '15:30',
      endTime: '16:20',
      status: 'pending',
      sessionNumber: 4,
      totalSessions: 7,
      notes: 'Medición perimetral previa y radiofrecuencia combinada.',
      createdAt: yesterday,
    },
    {
      id: 'apt-5',
      clientId: 'cli-6',
      serviceId: 'srv-6', // Masaje descontracturante
      staffId: 'stf-4', // Mateo
      date: today,
      startTime: '17:00',
      endTime: '18:00',
      status: 'pending',
      sessionNumber: 1,
      totalSessions: 1,
      notes: 'Primera sesión para aliviar dolor cervical.',
      createdAt: yesterday,
    },

    // --- AYER ---
    {
      id: 'apt-6',
      clientId: 'cli-5',
      serviceId: 'srv-5', // Láser
      staffId: 'stf-2',
      packageId: 'pkg-3',
      date: yesterday,
      startTime: '11:00',
      endTime: '11:40',
      status: 'completed',
      sessionNumber: 4,
      totalSessions: 6,
      notes: 'Sesión 4 completada sin molestias en piel.',
      createdAt: getRelativeDateStr(-3),
    },
    {
      id: 'apt-7',
      clientId: 'cli-1',
      serviceId: 'srv-6',
      staffId: 'stf-4',
      date: yesterday,
      startTime: '16:00',
      endTime: '17:00',
      status: 'no_show',
      notes: 'No asistió por imprevisto laboral. Avisó posteriormente.',
      createdAt: getRelativeDateStr(-3),
    },

    // --- MAÑANA ---
    {
      id: 'apt-8',
      clientId: 'cli-5',
      serviceId: 'srv-5', // Láser (sesión 5 de 6)
      staffId: 'stf-2',
      packageId: 'pkg-3',
      date: tomorrow,
      startTime: '10:00',
      endTime: '10:40',
      status: 'pending',
      sessionNumber: 5,
      totalSessions: 6,
      notes: 'Revisión de zonas sensibles.',
      createdAt: today,
    },
    {
      id: 'apt-9',
      clientId: 'cli-2',
      serviceId: 'srv-3',
      staffId: 'stf-1',
      packageId: 'pkg-2',
      date: tomorrow,
      startTime: '11:30',
      endTime: '12:15',
      status: 'pending',
      sessionNumber: 4,
      totalSessions: 5,
      notes: 'Seguimiento de ejercicios terapéuticos para casa.',
      createdAt: today,
    },
    {
      id: 'apt-10',
      clientId: 'cli-6',
      serviceId: 'srv-4',
      staffId: 'stf-3',
      date: tomorrow,
      startTime: '16:30',
      endTime: '17:45',
      status: 'pending',
      sessionNumber: 1,
      totalSessions: 1,
      notes: 'Mantenimiento de barba y corte degradado.',
      createdAt: today,
    },

    // --- PASADO MAÑANA & RESTO DE LA SEMANA ---
    {
      id: 'apt-11',
      clientId: 'cli-3',
      serviceId: 'srv-2',
      staffId: 'stf-2',
      packageId: 'pkg-1',
      date: dayAfter,
      startTime: '09:30',
      endTime: '10:20',
      status: 'pending',
      sessionNumber: 5,
      totalSessions: 7,
      notes: 'Continuación del ciclo reductivo.',
      createdAt: today,
    },
    {
      id: 'apt-12',
      clientId: 'cli-4',
      serviceId: 'srv-6',
      staffId: 'stf-4',
      date: in3Days,
      startTime: '11:00',
      endTime: '12:00',
      status: 'pending',
      sessionNumber: 1,
      totalSessions: 1,
      notes: 'Masaje relajante con piedras calientes.',
      createdAt: today,
    },
  ];
}
