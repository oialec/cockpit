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
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Você é um assistente que analisa documentos de projeto e extrai um plano de execução estruturado.

Analise o documento do projeto "${projectName}" abaixo e extraia:

1. As ETAPAS/FASES do projeto (sprints, fases, marcos — qualquer agrupamento lógico)
2. Dentro de cada etapa, as TAREFAS concretas que precisam ser feitas

Para cada etapa, defina:
- phase: nome curto da etapa (ex: "Fundação", "Pesquisa de Mercado", "MVP", "Launch")
- order: número da ordem (1, 2, 3...)

Para cada tarefa dentro da etapa:
- title: o que fazer (frase curta e direta)
- description: contexto ou detalhe (1 frase, pode ser vazio)
- priority: "urgent" (bloqueia o resto), "high" (crítico pra funcionar), "medium" (melhora experiência), "low" (pode esperar)
- time_estimate: estimativa de tempo se mencionada no texto (ex: "30min", "2h", "1 dia"), ou null

Regras:
- Extraia APENAS coisas que precisam ser FEITAS (ações), não descrições ou conceitos
- Mantenha a ordem lógica de execução (o que vem antes, vem primeiro)
- Se o documento não tem fases explícitas, crie agrupamentos lógicos baseado no conteúdo
- Se não encontrar tarefas acionáveis, retorne []

Retorne APENAS JSON válido, sem markdown, sem backticks:
[
  {
    "phase": "Nome da Etapa",
    "order": 1,
    "tasks": [
      {"title": "...", "description": "...", "priority": "...", "time_estimate": "..."}
    ]
  }
]

Documento:
${text.slice(0, 8000)}`
        }]
      })
    })

    const data = await response.json()
    const raw = data.content?.map(i => i.text || '').join('') || '[]'
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const phases = JSON.parse(cleaned)
    return NextResponse.json({ phases })
  } catch (err) {
    console.error('AI extraction error:', err)
    return NextResponse.json({ error: 'Falha na extração' }, { status: 500 })
  }
}
