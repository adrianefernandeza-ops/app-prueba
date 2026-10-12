import { Appointment, Client, Service, BusinessConfig } from '../types';

export function formatHumanDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  } catch {
    return dateStr;
  }
}

export function cleanPhoneNumber(phone: string): string {
  // Remove spaces, hyphens, brackets
  const cleaned = phone.replace(/[^\d+]/g, '');
  // If it starts with +, remove + for wa.me URL
  return cleaned.replace(/^\+/, '');
}

export function generateWhatsAppMessage(
  appointment: Appointment,
  client: Client,
  service: Service,
  businessConfig: BusinessConfig
): string {
  const dateFormatted = formatHumanDate(appointment.date);
  
  let serviceText = service.name;
  if (service.type === 'multi' && appointment.sessionNumber) {
    serviceText += ` (Sesión ${appointment.sessionNumber} de ${appointment.totalSessions || service.totalSessions})`;
  }

  let template = businessConfig.whatsappTemplate || 
    'Hola {cliente}, te recordamos tu cita para {servicio} el día {fecha} a las {hora} en {negocio}. ¡Te esperamos!';

  return template
    .replace('{cliente}', client.name.split(' ')[0] || client.name)
    .replace('{servicio}', serviceText)
    .replace('{fecha}', dateFormatted)
    .replace('{hora}', appointment.startTime)
    .replace('{negocio}', businessConfig.name);
}

export function getWhatsAppUrl(
  appointment: Appointment,
  client: Client,
  service: Service,
  businessConfig: BusinessConfig
): string {
  const cleanedPhone = cleanPhoneNumber(client.phone);
  const message = generateWhatsAppMessage(appointment, client, service, businessConfig);
  return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
}
