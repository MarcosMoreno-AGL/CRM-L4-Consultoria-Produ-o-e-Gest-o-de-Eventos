export function whatsappLink(telefone: string, mensagem?: string) {
  const digits = telefone.replace(/\D/g, "")
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`
  const params = mensagem ? `?text=${encodeURIComponent(mensagem)}` : ""
  return `https://wa.me/${withCountry}${params}`
}

export function mailtoLink(email: string, assunto?: string, corpo?: string) {
  const params = new URLSearchParams()
  if (assunto) params.set("subject", assunto)
  if (corpo) params.set("body", corpo)
  const query = params.toString()
  return `mailto:${email}${query ? `?${query}` : ""}`
}
