import { useMemo } from "react"

interface FlowerFieldProps {
  count: number
}

interface Flower {
  id: number
  rotation: number
  scale: number
  emoji: string
  marginLeft: number
}

const FLOWER_EMOJIS = ["🌸", "🌺", "🌻", "🌼", "🌷", "🌹"]

export function FlowerField({ count }: FlowerFieldProps) {
  const flowers = useMemo(() => {
    const result: Flower[] = []
    
    for (let i = 0; i < count; i++) {
      // Random overlap - negative margin creates overlap
      const overlap = -(Math.random() * 8 + 4) // -4 to -12px overlap
      
      result.push({
        id: i,
        marginLeft: i === 0 ? 0 : overlap, // first flower has no margin
        rotation: Math.random() * 30 - 15,
        scale: 0.8 + Math.random() * 0.3,
        emoji: FLOWER_EMOJIS[Math.floor(Math.random() * FLOWER_EMOJIS.length)]
      })
    }
    
    return result
  }, [count])

  return (
    <div className="flex flex-wrap items-end gap-y-1">
      {flowers.map((flower) => (
        <span
          key={flower.id}
          className="text-2xl inline-block"
          style={{
            marginLeft: `${flower.marginLeft}px`,
            transform: `rotate(${flower.rotation}deg) scale(${flower.scale})`,
            transformOrigin: "center bottom",
            transition: "all 0.3s ease"
          }}>
          {flower.emoji}
        </span>
      ))}
    </div>
  )
}
