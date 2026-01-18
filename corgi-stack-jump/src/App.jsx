import { useEffect, useState } from 'react'
import './App.css'

const PLATFORM_HEIGHT = 20
const MOVE_SPEED = 2
const GAME_WIDTH = 400
const BASE_PLATFORM_WIDTH = 140
const PLATFORM_SHRINK_STEP = 4
const MIN_PLATFORM_WIDTH = 60

function App() {
  const [platforms, setPlatforms] = useState([{ x: 130, y: 360, width: BASE_PLATFORM_WIDTH }])
  const [movingPlatform, setMovingPlatform] = useState(null)
  const [direction, setDirection] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)

  // Dog always on last stable platform
  const topPlatform = platforms.at(-1)
  const corgiX = topPlatform.x + 30
  const corgiY = topPlatform.y - 20

  // Auto-spawn new moving platform if none exists
  useEffect(() => {
    if (gameOver) return
    if (!movingPlatform) {
      const newWidth = Math.max(MIN_PLATFORM_WIDTH, topPlatform.width - PLATFORM_SHRINK_STEP)
      const newY = topPlatform.y - PLATFORM_HEIGHT
      setMovingPlatform({ x: 0, y: newY, width: newWidth })
      setDirection(1)
    }
  }, [movingPlatform, topPlatform, gameOver])

  // Move the sliding platform
  useEffect(() => {
    if (!movingPlatform || gameOver) return

    const interval = setInterval(() => {
      setMovingPlatform(prev => {
        let newX = prev.x + direction * MOVE_SPEED
        let newDir = direction

        if (newX <= 0) {
          newX = 0
          newDir = 1
        }
        if (newX >= GAME_WIDTH - prev.width) {
          newX = GAME_WIDTH - prev.width
          newDir = -1
        }

        setDirection(newDir)
        return { ...prev, x: newX }
      })
    }, 16)

    return () => clearInterval(interval)
  }, [movingPlatform, direction, gameOver])

  // Drop the moving platform
  const drop = () => {
    if (!movingPlatform || gameOver) return

    const overlap = Math.abs(movingPlatform.x - topPlatform.x)
    if (overlap > topPlatform.width * 0.6) {
      setGameOver(true)
      return
    }

    // Add to stable platforms
    setPlatforms(p => [...p, { ...movingPlatform }])
    setMovingPlatform(null)
    setScore(s => s + 1)
  }

  const reset = () => {
    setPlatforms([{ x: 130, y: 360, width: BASE_PLATFORM_WIDTH }])
    setMovingPlatform(null)
    setDirection(1)
    setGameOver(false)
    setScore(0)
  }

  return (
    <div className="center-wrapper">
      <div className="card" onClick={drop}>
        <h1>🐕 Corgi Stack Jump</h1>

        <div className="game">
          {platforms.map((p, i) => (
            <div
              key={`stable-${i}`}
              className="platform"
              style={{ left: p.x, top: p.y, width: p.width }}
            />
          ))}

          {movingPlatform && (
            <div
              className="platform moving"
              style={{
                left: movingPlatform.x,
                top: movingPlatform.y,
                width: movingPlatform.width
              }}
            />
          )}

          {/* Dog stays on last stable platform */}
          <div className="corgi" style={{ left: corgiX, top: corgiY }}>
            🐕
          </div>

          {gameOver && (
            <div className="overlay">
              <p>💥 Game Over</p>
              <button onClick={reset}>Restart</button>
            </div>
          )}
        </div>

        <p className="score">Score: {score}</p>
        <p className="hint">Click to drop the moving platform!</p>
      </div>
    </div>
  )
}

export default App
