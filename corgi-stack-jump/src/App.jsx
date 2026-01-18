import { useEffect, useState } from 'react'
import './App.css'

const PLATFORM_HEIGHT = 20
const MOVE_SPEED = 2
const GAME_WIDTH = 400
const BASE_PLATFORM_WIDTH = 140
const PLATFORM_SHRINK_STEP = 4 // px per stack

function App() {
  const [platforms, setPlatforms] = useState([{ x: 130, y: 360, width: BASE_PLATFORM_WIDTH }])
  const [direction, setDirection] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (gameOver) return

    const interval = setInterval(() => {
      setPlatforms(prev => {
        const top = prev.at(-1)
        let newX = top.x + direction * MOVE_SPEED

        if (newX <= 0) {
          newX = 0
          setDirection(1)
        }
        if (newX >= GAME_WIDTH - top.width) {
          newX = GAME_WIDTH - top.width
          setDirection(-1)
        }

        return [...prev.slice(0, -1), { ...top, x: newX, width: top.width }]
      })
    }, 16)

    return () => clearInterval(interval)
  }, [direction, gameOver])

  const jump = () => {
    if (gameOver) return

    const top = platforms.at(-1)
    const prev = platforms.at(-2)

    // Misalignment check
    if (prev && Math.abs(top.x - prev.x) > top.width * 0.6) {
      setGameOver(true)
      return
    }

    // Shrink the next platform
    const newWidth = Math.max(60, top.width - PLATFORM_SHRINK_STEP)
    const newY = top.y - PLATFORM_HEIGHT

    setPlatforms(p => [...p, { x: top.x, y: newY, width: newWidth }])
    setScore(s => s + 1)
  }

  const reset = () => {
    setPlatforms([{ x: 130, y: 360, width: BASE_PLATFORM_WIDTH }])
    setDirection(1)
    setGameOver(false)
    setScore(0)
  }

  return (
    <div className="center-wrapper">
      <div className="card" onClick={jump}>
        <h1>🐕 Corgi Stack Jump</h1>

        <div className="game">
          {platforms.map((p, i) => (
            <div
              key={i}
              className="platform"
              style={{ left: p.x, top: p.y, width: p.width }}
            />
          ))}

          <div
            className="corgi"
            style={{
              left: platforms.at(-1).x + 30,
              top: platforms.at(-1).y - 20 // lowered slightly so dog sits on top
            }}
          >
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
        <p className="hint">Click to stack!</p>
      </div>
    </div>
  )
}

export default App
