import { getPortfolio } from '@/lib/queries/student'
import { PortfolioUI } from '@/components/student/portfolio/PortfolioUI'

export default async function PortfolioPage() {
  const items = await getPortfolio()
  return <PortfolioUI items={items} />
}
