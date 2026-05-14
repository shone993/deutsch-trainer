'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

const LoginSchema = z.object({
  email: z.string().email('Nevažeća email adresa'),
  password: z.string().min(6, 'Lozinka mora imati najmanje 6 karaktera'),
})

const RegisterSchema = z.object({
  email: z.string().email('Nevažeća email adresa'),
  password: z.string().min(6, 'Lozinka mora imati najmanje 6 karaktera'),
  name: z.string().min(2, 'Ime mora imati najmanje 2 karaktera'),
  surname: z.string().min(2, 'Prezime mora imati najmanje 2 karaktera'),
  displayName: z.string().min(2, 'Korisničko ime mora imati najmanje 2 karaktera'),
  verificationCode: z.string().min(4, 'Unesite verifikacioni kod'),
})

export type AuthState = {
  error?: string
  success?: boolean
}

export async function login(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const result = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(result.data)

  if (error) {
    return { error: 'Pogrešan email ili lozinka.' }
  }

  redirect('/profile')
}

const VALID_CODES = new Set(['VTS-2025-A1', 'VTS-2025-B2', 'VTS-2025-C3'])

export async function register(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const result = RegisterSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
    surname: formData.get('surname'),
    displayName: formData.get('displayName'),
    verificationCode: formData.get('verificationCode'),
  })

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { email, password, name, surname, displayName, verificationCode } = result.data

  if (!VALID_CODES.has(verificationCode.trim().toUpperCase())) {
    return { error: 'Nevažeći verifikacioni kod. Obratite se administratoru.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error || !data.user) {
    return { error: error?.message ?? 'Registracija nije uspela.' }
  }

  await prisma.user.create({
    data: {
      id: data.user.id,
      email,
      name,
      surname,
      displayName,
      isVerified: true,
      role: 'STUDENT',
    },
  })

  await prisma.streak.create({ data: { userId: data.user.id } })

  redirect('/profile')
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
