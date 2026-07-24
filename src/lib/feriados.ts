export type Feriado = {
  date: string
  name: string
  type: string
}

export async function getFeriadosNacionais(ano: number): Promise<Feriado[]> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`, {
      next: { revalidate: 60 * 60 * 24 },
    })
    if (!res.ok) return []
    return (await res.json()) as Feriado[]
  } catch {
    return []
  }
}
