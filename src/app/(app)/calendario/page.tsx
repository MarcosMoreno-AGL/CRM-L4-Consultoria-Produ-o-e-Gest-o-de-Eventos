import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { STATUS_EVENTO_BADGE, STATUS_EVENTO_LABELS } from "@/lib/labels"
import { getFeriadosNacionais } from "@/lib/feriados"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>
}) {
  const params = await searchParams
  const today = new Date()
  const year = Number(params.ano) || today.getFullYear()
  const month = Number(params.mes) || today.getMonth() + 1 // 1-12

  const firstOfMonth = new Date(year, month - 1, 1)
  const lastOfMonth = new Date(year, month, 0)

  const gridStart = new Date(firstOfMonth)
  gridStart.setDate(gridStart.getDate() - gridStart.getDay())
  const gridEnd = new Date(lastOfMonth)
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()))

  const years = Array.from(
    new Set([gridStart.getFullYear(), gridEnd.getFullYear()])
  )

  const supabase = await createClient()
  const [feriadosPorAno, { data: eventos }] = await Promise.all([
    Promise.all(years.map((y) => getFeriadosNacionais(y))),
    supabase
      .from("eventos")
      .select("id, nome_evento, data_evento, status")
      .gte("data_evento", toISODate(gridStart))
      .lte("data_evento", toISODate(gridEnd))
      .order("data_evento", { ascending: true }),
  ])
  const feriados = feriadosPorAno.flat()
  const feriadosPorData = new Map(feriados.map((f) => [f.date, f.name]))

  const eventosPorData = new Map<string, typeof eventos>()
  for (const evento of eventos ?? []) {
    if (!evento.data_evento) continue
    const lista = eventosPorData.get(evento.data_evento) ?? []
    lista.push(evento)
    eventosPorData.set(evento.data_evento, lista)
  }

  const days: Date[] = []
  for (let d = new Date(gridStart); d <= gridEnd; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d))
  }

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendário</h1>
          <p className="text-muted-foreground">Eventos e feriados nacionais.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/calendario?ano=${prevYear}&mes=${prevMonth}`}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <span className="w-40 text-center text-sm font-medium">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <Button variant="outline" size="icon" asChild>
            <Link href={`/calendario?ano=${nextYear}&mes=${nextMonth}`}>
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {MONTH_NAMES[month - 1]} de {year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border text-xs">
            {WEEKDAYS.map((w) => (
              <div key={w} className="bg-muted/50 p-2 text-center font-medium text-muted-foreground">
                {w}
              </div>
            ))}
            {days.map((day) => {
              const iso = toISODate(day)
              const isCurrentMonth = day.getMonth() === month - 1
              const isToday = iso === toISODate(today)
              const holiday = feriadosPorData.get(iso)
              const dayEventos = eventosPorData.get(iso) ?? []

              return (
                <div
                  key={iso}
                  className={cn(
                    "min-h-[100px] bg-background p-1.5",
                    !isCurrentMonth && "bg-muted/20 text-muted-foreground"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full",
                        isToday && "bg-brand font-semibold text-brand-foreground"
                      )}
                    >
                      {day.getDate()}
                    </span>
                  </div>
                  {holiday && (
                    <p className="mt-1 truncate rounded bg-red-500/15 px-1 py-0.5 text-[10px] font-medium text-red-700 dark:text-red-400">
                      {holiday}
                    </p>
                  )}
                  <div className="mt-1 grid gap-0.5">
                    {dayEventos.slice(0, 3).map((evento) => (
                      <Link
                        key={evento.id}
                        href={`/eventos/${evento.id}`}
                        className="block truncate"
                        title={evento.nome_evento}
                      >
                        <Badge
                          className={cn(
                            "w-full justify-start truncate border-none px-1 py-0 text-[10px] font-normal",
                            STATUS_EVENTO_BADGE[evento.status]
                          )}
                        >
                          {evento.nome_evento}
                        </Badge>
                      </Link>
                    ))}
                    {dayEventos.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{dayEventos.length - 3} evento(s)
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {feriados.filter((f) => f.date.startsWith(String(year))).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Feriados nacionais de {year}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {feriados
              .filter((f) => f.date.startsWith(String(year)))
              .map((f) => (
                <div key={f.date} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
                  <span>{f.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("pt-BR").format(new Date(`${f.date}T00:00:00`))}
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
