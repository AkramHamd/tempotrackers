// Dedicated Map Page with Full Functionality
import dynamic from 'next/dynamic'

const FullInteractiveMap = dynamic(
  () => import('../components/map/FullInteractiveMap'),
  { ssr: false }
)

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <FullInteractiveMap />
    </div>
  )
}
