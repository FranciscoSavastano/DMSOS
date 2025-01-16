//import OpenAI from "openai";

export async function gptCorrection() {
  const openai = new OpenAI({
    apiKey:
      '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',
  })

  const completion = openai.chat.completions.create({
    model: 'gpt-4o-mini',
    store: true,
    messages: [
      {
        role: 'user',
        content:
          'Melhore o texto a seguir e deixe mais profissional: Hoje as 10 da manha foi notado que um carro foi estacionad na frente do condominio soho',
      },
    ],
  })

  completion.then((result) => console.log(result.choices[0].message))
}
