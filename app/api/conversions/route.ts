// api/conversions/route.ts — Flight Check: Endpoint propio de registro de conversiones
// Fase 4.1: Almacena cada conversión para comparar contra GA4 (Double Check)
//
// NOTA: Actualmente solo loguea en consola del servidor (Vercel Functions logs).
// Para persistencia real, conectar a Supabase, PlanetScale, o Vercel KV.

import { NextRequest, NextResponse } from 'next/server';

interface ConversionPayload {
  type: 'form_submit' | 'phone_click' | 'whatsapp_click' | 'qualified_lead';
  label: string;
  source: string;
  medium: string;
  campaign?: string;
  domain: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ConversionPayload = await request.json();

    // Validación básica
    const validTypes = ['form_submit', 'phone_click', 'whatsapp_click', 'qualified_lead'];
    if (!body.type || !validTypes.includes(body.type)) {
      return NextResponse.json({ success: false, error: 'Invalid event type' }, { status: 400 });
    }

    if (!body.domain || !body.timestamp) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Log en servidor (visible en Vercel Functions logs)
    console.log('[Flight Check] Conversión registrada:', JSON.stringify({
      type: body.type,
      label: body.label,
      source: body.source,
      medium: body.medium,
      campaign: body.campaign || 'none',
      domain: body.domain,
      timestamp: body.timestamp,
    }));

    // TODO: Persistir en base de datos para reportes de conciliación semanal
    // Ejemplo con Supabase:
    // await supabase.from('conversions').insert(body);
    //
    // Ejemplo con Vercel KV:
    // const key = `conv:${body.domain}:${Date.now()}`;
    // await kv.set(key, JSON.stringify(body), { ex: 60 * 60 * 24 * 90 }); // 90 días

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Flight Check] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
