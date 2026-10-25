export type StepType = 'dm' | 'wait' | 'branch' | 'loop'

export interface Step {
  id: string
  type: StepType
  text?: string
  hours?: number
  field?: string
  op?: '<' | '>=' | '='
  value?: number
  yes?: Step[]
  no?: Step[]
  body?: Step[]
}

export interface TextPart {
  text: string
  variable: boolean
}

export const variables = ['member.name', 'space.name', 'post.title', 'member.trust_level']

export const token = (variable: string) => '{{' + variable + '}}'

export const splitVariables = (text = ''): TextPart[] =>
  text
    .split(/(\{\{[^}]+\}\})/g)
    .filter(Boolean)
    .map(part => part.startsWith('{{')
      ? { text: part.slice(2, -2).trim(), variable: true }
      : { text: part, variable: false }
    )

export function newStep(type: StepType): Step {
  const id = crypto.randomUUID()
  switch (type) {
    case 'dm': return { id, type, text: '' }
    case 'wait': return { id, type, hours: 24 }
    case 'branch': return { id, type, field: 'member.trust_level', op: '<', value: 3, yes: [], no: [] }
    case 'loop': return { id, type, body: [] }
  }
}
