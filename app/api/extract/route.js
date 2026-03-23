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
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Extraia tarefas acionáveis do texto do projeto "${projectName}". Para cada: title (frase curta), description (1 frase), priority ("urgent"/"high"/"medium"/"low"), category (tema). Retorne APENAS JSON: [{"title":"...","description":"...","priority":"...","category":"..."}]\nSe não encontrar tarefas: []\n\nTexto:\n${text.slice(0, 6000)}`
        }]
      })
    })

    const data = await response.json()
    const raw = data.content?.map(i => i.text || '').join('') || '[]'
    const tasks = JSON.parse(raw.replace(/```json|```/g, '').trim())
    return NextResponse.json({ tasks })
  } catch (err) {
    return NextResponse.json({ error: 'Falha na extração' }, { status: 500 })
  }
}
