import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { email, workspaceId, workspaceName } = await req.json()

  if (!email || !workspaceId || !workspaceName) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  // Verificar que el usuario es dueño del workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name, slug')
    .eq('id', workspaceId)
    .eq('owner_id', user.id)
    .single()

  if (!workspace) {
    return NextResponse.json({ error: 'No tenés permiso para invitar a este workspace' }, { status: 403 })
  }

  // Verificar si ya existe una invitación pendiente
  const { data: existing } = await supabase
    .from('invitations')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('email', email.trim().toLowerCase())
    .eq('accepted', false)
    .single()

  if (existing) {
    return NextResponse.json(
      { error: 'Ya existe una invitación pendiente para este email.' },
      { status: 400 }
    )
  }

  // Generar token y fecha de expiración
  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  // Guardar invitación en la DB
  const { error: dbError } = await supabase
    .from('invitations')
    .insert({
      workspace_id: workspaceId,
      email: email.trim().toLowerCase(),
      token,
      expires_at: expiresAt.toISOString(),
      accepted: false,
      invited_by: user.id,
    })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  // Solo enviar email si el usuario NO está registrado en la app
  const { data: existingUser } = await supabase.rpc('find_user_by_email', {
    search_email: email.trim().toLowerCase()
  })

  if (!existingUser || existingUser.length === 0) {
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`

    const { error: emailError } = await resend.emails.send({
      from: 'TaskDeck <onboarding@resend.dev>',
      to: email,
      subject: `Te invitaron a unirte a ${workspaceName} en TaskDeck`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Fuiste invitado a <strong>${workspaceName}</strong></h2>
          <p>Hacé clic en el botón para unirte al workspace:</p>
          <a href="${inviteUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Unirse al workspace
          </a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
            Este link expira en 7 días.
          </p>
        </div>
      `,
    })

    if (emailError) {
      return NextResponse.json({ error: emailError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}