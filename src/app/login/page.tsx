import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/app/login/actions"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-svh items-center justify-center bg-neutral-950 p-4">
      <Card className="w-full max-w-sm border-neutral-800 bg-neutral-900 text-neutral-50">
        <CardHeader className="items-center gap-2 text-center">
          <Logo className="text-3xl" />
          <CardTitle className="text-neutral-50">Entrar</CardTitle>
          <CardDescription>Acesse o CRM da equipe L4 Consultoria</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="voce@l4consultoria.com"
                required
                className="border-neutral-700 bg-neutral-950"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="border-neutral-700 bg-neutral-950"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="mt-2 bg-brand text-brand-foreground hover:bg-brand/90">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
