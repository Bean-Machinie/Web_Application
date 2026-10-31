import type { ReactNode } from "react"
import { ABILITIES } from "@/lib/character-templates/srd-5-2-1"
import { ABILITY_MEASURES, D20_STEPS, GENERATION, INCREASE_RULE } from "@/lib/character-templates/srd-5-2-1-ability-rules"
import { ModifierTable, PointCostTable, ScoreMeaningTable } from "./AbilityRulesTables"

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-1.5">
      <h3 className="text-muted-foreground text-xs font-medium">{title}</h3>
      {children}
    </section>
  )
}

const Text = ({ children }: { children: ReactNode }) => <p className="text-muted-foreground text-sm leading-relaxed">{children}</p>

export function ScoresSection() {
  return (
    <>
      <Text>Every creature has six abilities, each with a score from 1 to 20 that says how strong it is.</Text>
      <Block title="What each measures">
        <dl className="grid gap-x-6 text-sm">
          {ABILITIES.map(([id, name]) => (
            <div key={id} className="border-border/60 flex items-baseline justify-between gap-4 border-b py-1.5 last:border-b-0">
              <dt className="font-medium">{name}</dt>
              <dd className="text-muted-foreground text-right">{ABILITY_MEASURES[id]}</dd>
            </div>
          ))}
        </dl>
      </Block>
      <Block title="What a score means">
        <ScoreMeaningTable />
      </Block>
    </>
  )
}

export function ModifiersSection() {
  return (
    <>
      <div className="bg-muted/50 rounded-md border px-3 py-2 text-sm">
        <span className="text-muted-foreground">Modifier </span>= (score − 10) ÷ 2, rounded down
      </div>
      <Block title="Score to modifier">
        <ModifierTable />
      </Block>
      <Block title="Using a modifier">
        <ol className="text-muted-foreground grid list-decimal gap-1 pl-5 text-sm leading-relaxed">
          {D20_STEPS.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </Block>
    </>
  )
}

export function GeneratingSection() {
  return (
    <>
      <Block title="Ways to get the six scores">
        <ul className="grid gap-2 text-sm">
          {GENERATION.map(({ name, text }) => (
            <li key={name}>
              <span className="font-medium">{name}. </span>
              <span className="text-muted-foreground">{text}</span>
            </li>
          ))}
        </ul>
      </Block>
      <Block title="Point buy costs">
        <PointCostTable />
      </Block>
      <Block title="Background increase">
        <Text>{INCREASE_RULE}</Text>
      </Block>
    </>
  )
}
