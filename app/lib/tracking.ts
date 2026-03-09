// lib/tracking.ts — Sistema de Tracking: dataLayer (GTM) + Flight Check (verificación propia)

type ConversionType = 'form_submit' | 'phone_click' | 'whatsapp_click' | 'qualified_lead';

interface ConversionEvent {
  type: ConversionType;
  source: string;
  medium: string;
  campaign?: string;
  domain: string;
  timestamp: string;
}

// --- UTILIDAD: Leer parámetros UTM de la URL ---
export function getUTMParam(param: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return new URLSearchParams(window.location.search).get(param);
  } catch {
    return null;
  }
}

// --- FASE 3: Push al dataLayer para que GTM capture el evento ---
export function pushDataLayerEvent(
  event: string,
  params: Record<string, string>
) {
  if (typeof window === 'undefined') return;
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({
    event,
    ...params,
  });
}

// --- FASE 4: Flight Check — registro propio de conversión ---
export async function trackConversion(event: {
  type: ConversionType;
  label: string;
}) {
  if (typeof window === 'undefined') return;

  const payload: ConversionEvent = {
    type: event.type,
    source: getUTMParam('utm_source') || 'direct',
    medium: getUTMParam('utm_medium') || 'none',
    campaign: getUTMParam('utm_campaign') || undefined,
    domain: window.location.hostname,
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch('/api/conversions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, label: event.label }),
    });
  } catch (e) {
    // Silencioso: no bloquear la UX si falla el registro
    console.error('[Flight Check] Error registrando conversión:', e);
  }
}
