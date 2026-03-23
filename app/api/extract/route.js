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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        system: `Você extrai planos de execução de documentos de projeto. Retorne APENAS JSON puro — sem texto, sem explicação, sem backticks. Sua resposta inteira deve ser um array JSON válido.

FORMATO EXATO:
[{"phase":"Nome da Etapa","order":1,"tasks":[{"title":"Ação concreta","description":"Detalhe curto","priority":"high","time_estimate":"2h"}]}]

Prioridades: "urgent" (bloqueia tudo), "high" (crítico), "medium" (melhoria), "low" (pode esperar)

EXEMPLO — se o documento diz:
"Sprint 1: Configurar infra. Criar VPS (30min), instalar Docker (15min). Sprint 2: Banco de dados. Criar tabelas users e posts (1h), configurar RLS (30min)."

Você retorna:
[{"phase":"Configurar Infra","order":1,"tasks":[{"title":"Criar VPS","description":"Provisionar servidor","priority":"urgent","time_estimate":"30min"},{"title":"Instalar Docker","description":"Setup de containers","priority":"urgent","time_estimate":"15min"}]},{"phase":"Banco de Dados","order":2,"tasks":[{"title":"Criar tabelas users e posts","description":"Schema inicial","priority":"high","time_estimate":"1h"},{"title":"Configurar RLS","description":"Row Level Security","priority":"high","time_estimate":"30min"}]}]

REGRAS:
- Extraia APENAS ações (verbos: criar, configurar, montar, testar, instalar, escrever)
- Ignore descrições, conceitos e explicações — só o que precisa ser FEITO
- Se o documento tem sprints/fases, use esses nomes
- Se não tem fases, agrupe por tema (Infra, Backend, Frontend, Marketing, etc)
- time_estimate: use o tempo do documento ou null
- Cada tarefa deve ter título curto e direto (máx 10 palavras)`,
        messages: [{
          role: 'user',
          content: `Extraia o plano de execução deste documento do projeto "${projectName}":\n\n${text.slice(0, 10000)}`
        },
        {
          role: 'assistant',
          content: '['
        }]
      })
    })

    if (!response.ok) {
      const errData = await response.text()
      console.error('Anthropic error:', response.status, errData)
      return NextResponse.json({ error: 'API error ' + response.status }, { status: 500 })
    }

    const data = await response.json()
    let raw = data.content?.map(i => i.text || '').join('') || ''

    if (!raw.trim()) {
      return NextResponse.json({ phases: [] })
    }

    // We prefilled with '[', so prepend it back
    raw = '[' + raw.trim()

    // Clean up any markdown artifacts
    raw = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()

    // Find the JSON array boundaries
    const arrayEnd = raw.lastIndexOf(']')
    if (arrayEnd === -1) {
      return NextResponse.json({ phases: [] })
    }

    const jsonStr = raw.substring(0, arrayEnd + 1)

    try {
      const phases = JSON.parse(jsonStr)
      if (!Array.isArray(phases)) return NextResponse.json({ phases: [] })
      return NextResponse.json({ phases })
    } catch (parseErr) {
      // Try to fix common JSON issues
      try {
        // Sometimes trailing commas break parsing
        const fixed = jsonStr.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}')
        const phases = JSON.parse(fixed)
        if (Array.isArray(phases)) return NextResponse.json({ phases })
      } catch {}
      
      console.error('JSON parse failed:', parseErr.message, jsonStr.substring(0, 200))
      return NextResponse.json({ phases: [] })
    }

  } catch (err) {
    console.error('Extract error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}