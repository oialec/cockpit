import { NextResponse } from 'next/server'

export async function POST(request) {
  const { text, projectName } = await request.json()
  const key = process.env.ANTHROPIC_API_KEY

  if (!key) {
    return NextResponse.json({ error: 'API key não configurada' }, { status: 500 })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Analise este documento do projeto "${projectName}" e extraia um plano de execução.

REGRAS OBRIGATÓRIAS:
1. Retorne SOMENTE um array JSON válido, nada mais
2. NÃO use backticks, NÃO escreva "json", NÃO adicione explicação
3. A primeira linha da sua resposta DEVE ser [
4. A última linha DEVE ser ]

Estrutura do JSON:
[
  {
    "phase": "Nome da Etapa",
    "order": 1,
    "tasks": [
      {"title": "O que fazer", "description": "Contexto curto", "priority": "high", "time_estimate": "2h"}
    ]
  }
]

Instruções:
- Identifique ETAPAS/FASES/SPRINTS do projeto
- Dentro de cada etapa, liste TAREFAS concretas (ações, não descrições)
- priority: "urgent", "high", "medium" ou "low"
- time_estimate: tempo mencionado no texto ou null
- Se o documento não tem fases explícitas, crie agrupamentos lógicos
- Mantenha a ordem de execução

Documento:
${text.slice(0, 10000)}`
        }]
      })
    })

    if (!response.ok) {
      const errData = await response.text()
      console.error('Anthropic API error:', response.status, errData)
      return NextResponse.json({ error: 'API error ' + response.status, debug: errData }, { status: 500 })
    }

    const data = await response.json()
    const raw = data.content?.map(i => i.text || '').join('') || ''

    if (!raw.trim()) {
      return NextResponse.json({ phases: [] })
    }

    // Robust JSON extraction
    let cleaned = raw.trim()
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '')

    const arrayStart = cleaned.indexOf('[')
    const arrayEnd = cleaned.lastIndexOf(']')

    if (arrayStart === -1 || arrayEnd === -1 || arrayEnd <= arrayStart) {
      return NextResponse.json({ phases: [] })
    }

    const jsonStr = cleaned.substring(arrayStart, arrayEnd + 1)

    try {
      const phases = JSON.parse(jsonStr)
      if (!Array.isArray(phases)) return NextResponse.json({ phases: [] })
      return NextResponse.json({ phases })
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr.message)
      return NextResponse.json({ phases: [] })
    }

  } catch (err) {
    console.error('Extract error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}