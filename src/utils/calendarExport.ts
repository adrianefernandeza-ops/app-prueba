import { Appointment, Client, Service, Staff, BusinessConfig } from '../types';

function parseDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function formatLocalDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    'T' +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    '00'
  );
}

function formatDateToICS(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    'T' +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    '00'
  );
}

export function generateGoogleCalendarUrl(
  appointment: Appointment,
  client: Client,
  service: Service,
  staff: Staff | undefined,
  businessConfig: BusinessConfig
): string {
  const startDate = parseDateTime(appointment.date, appointment.startTime);
  const endDate = parseDateTime(appointment.date, appointment.endTime);

  const startFormatted = formatLocalDateTime(startDate);
  const endFormatted = formatLocalDateTime(endDate);

  let title = `${service.name} - ${client.name}`;
  if (service.type === 'multi' && appointment.sessionNumber) {
    title += ` (Sesión ${appointment.sessionNumber}/${appointment.totalSessions || service.totalSessions})`;
  }

  const details = [
    `Cliente: ${client.name} (${client.phone})`,
    `Servicio: ${service.name} (${service.duration} min)`,
    staff ? `Atendido por: ${staff.name} (${staff.role})` : '',
    appointment.notes ? `Notas: ${appointment.notes}` : '',
    `Lugar: ${businessConfig.name} - ${businessConfig.address}`,
  ]
    .filter(Boolean)
    .join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startFormatted}/${endFormatted}`,
    details: details,
    location: `${businessConfig.name}, ${businessConfig.address}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadICSFile(
  appointments: Array<{
    appointment: Appointment;
    client: Client;
    service: Service;
    staff?: Staff;
  }>,
  businessConfig: BusinessConfig,
  fileName = 'agenda-citas.ics'
): void {
  const now = formatDateToICS(new Date());

  const events = appointments.map(({ appointment, client, service, staff }) => {
    const startDate = parseDateTime(appointment.date, appointment.startTime);
    const endDate = parseDateTime(appointment.date, appointment.endTime);
    
    let summary = `${service.name} - ${client.name}`;
    if (service.type === 'multi' && appointment.sessionNumber) {
      summary += ` [Sesión ${appointment.sessionNumber}/${appointment.totalSessions || service.totalSessions}]`;
    }

    const description = [
      `Cliente: ${client.name} | Tel: ${client.phone}`,
      `Servicio: ${service.name} (${service.duration} min)`,
      staff ? `Atendido por: ${staff.name}` : '',
      appointment.notes ? `Notas: ${appointment.notes}` : '',
      `Estado: ${appointment.status}`,
    ]
      .filter(Boolean)
      .join('\\n');

    return [
      'BEGIN:VEVENT',
      `UID:apt-${appointment.id}-${Date.now()}@agendapro`,
      `DTSTAMP:${now}`,
      `DTSTART:${formatDateToICS(startDate)}`,
      `DTEND:${formatDateToICS(endDate)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${businessConfig.name}\\, ${businessConfig.address}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AgendaPro Recepcion//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
