import { useEffect, useState } from 'react'
import './App.css'

const PLATFORM_WIDTH = 140
const PLATFORM_HEIGHT = 20
const MOVE_SPEED = 2
const GAME_WIDTH = 400  // updated from 300px

function App() {
  const [platforms, setPlatforms] = useState([{ x: 130, y: 360 }]) // adjust initial X
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
        if (newX >= GAME_WIDTH - PLATFORM_WIDTH) {
          newX = GAME_WIDTH - PLATFORM_WIDTH
          setDirection(-1)
        }

        return [...prev.slice(0, -1), { ...top, x: newX }]
      })
    }, 16)

    return () => clearInterval(interval)
  }, [direction, gameOver])

  const jump = () => {
    if (gameOver) return

    const top = platforms.at(-1)
    const prev = platforms.at(-2)

    if (prev && Math.abs(top.x - prev.x) > PLATFORM_WIDTH * 0.6) {
      setGameOver(true)
      return
    }

    setPlatforms(p => [...p, { x: top.x, y: top.y - PLATFORM_HEIGHT }])
    setScore(s => s + 1)
  }

  const reset = () => {
    setPlatforms([{ x: 130, y: 360 }])
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
              style={{ left: p.x, top: p.y }}
            />
          ))}

          <div
            className="corgi"
            style={{
              left: platforms.at(-1).x + 30,
              top: platforms.at(-1).y - 36
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
        <p className="hint">Click to stack</p>
      </div>
    </div>
  )
}

export default App
