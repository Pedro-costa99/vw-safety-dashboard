import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  breakpoints,
  colorTokens,
  radiiScale,
  spacingScale,
  typographyScale,
} from '@/design-system/tokens'
import { cn } from '@/lib/utils'

const tokenToCssValue = (cssVar: string) => `hsl(var(${cssVar}))`

export const DesignSystemPage = () => {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <Heading as="h1" className="text-3xl">
          Design System
        </Heading>
        <p className="max-w-2xl text-muted-foreground">
          Coleção de tokens e componentes reutilizáveis que sustentam a experiência visual do VW Safety Dashboard.
        </p>
      </section>

      <section className="space-y-6">
        <Heading as="h2">Tokens de cor</Heading>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {Object.entries(colorTokens).map(([token, { label, cssVar, description }]) => (
            <Card key={token} className="space-y-4">
              <div
                className="h-20 w-full rounded-md border"
                style={{ backgroundColor: tokenToCssValue(cssVar) }}
              />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">Token: {cssVar}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <Heading as="h2">Escalas</Heading>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card heading="Spacing" description="Referência para margens e paddings">
            <div className="space-y-4">
              {spacingScale.map((item) => (
                <div key={item.token} className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="w-12 font-medium text-foreground">{item.token}</span>
                    <div className="flex-1">
                      <div
                        className="rounded-full bg-primary/40"
                        style={{ height: '0.5rem', width: item.value }}
                      />
                    </div>
                    <span>{item.value}</span>
                  </div>
                  <p className="mt-1 text-xs">{item.description}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card heading="Border radius" description="Curvas aplicadas a elementos interativos">
            <div className="space-y-4">
              {radiiScale.map((radius) => (
                <div key={radius.token} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="w-12 font-medium text-foreground">{radius.token}</span>
                  <div>
                    <div
                      className="h-8 w-16 border border-border bg-muted"
                      style={{ borderRadius: radius.value }}
                    />
                    <p className="mt-1 text-xs">{radius.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card heading="Breakpoints" description="Layout responsivo">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {breakpoints.map((item) => (
                <li key={item.token} className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{item.token}</span>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <Heading as="h2">Tipografia</Heading>
        <div className="grid gap-4 md:grid-cols-2">
          {typographyScale.map((item) => (
            <Card key={item.token} className="space-y-2">
              <p className="text-xs text-muted-foreground">{item.token}</p>
              <p className={cn(item.className)}>VW Safety Dashboard - {item.token}</p>
              <p className="text-xs text-muted-foreground">
                Classe utilitária Tailwind: <code>{item.className}</code>
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <Heading as="h2">Componentes base</Heading>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card heading="Buttons" description="Estados e variantes principais">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primário</Button>
              <Button variant="secondary">Secundário</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destrutivo</Button>
              <Button size="sm">Pequeno</Button>
              <Button size="lg">Grande</Button>
            </div>
          </Card>

          <Card heading="Inputs" description="Campos com feedback visual consistente">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-demo">E-mail</Label>
                <Input id="email-demo" placeholder="ana.souza@vw.com" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="search-demo">Busca</Label>
                <Input id="search-demo" placeholder="Buscar modelos" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
              </div>
            </div>
          </Card>

          <Card
            heading="Card"
            description="Superfície para agrupar informações ou widgets informativos"
            className="lg:col-span-2"
          >
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">
                Cards usam tokens de {tokenToCssValue('--card')} como background, borda {tokenToCssValue(
                  '--border',
                )} e tipografia consistente com o resto da interface.
              </p>
              <Button className="mt-2 w-fit">Ação dentro do card</Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
