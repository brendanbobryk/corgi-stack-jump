import { useEffect, useState } from 'react'
import './App.css'

const GAME_WIDTH = 400
const GAME_HEIGHT = 400
const BLOCK_HEIGHT = 20
const INITIAL_BLOCKS = 7 // starting blocks in the first row
const MOVE_SPEED_BASE = 2

function App() {
  const [stack, setStack] = useState([
    { y: GAME_HEIGHT - BLOCK_HEIGHT, blocks: INITIAL_BLOCKS, x: Math.floor((GAME_WIDTH - INITIAL_BLOCKS * 40) / 2) }
  ])
  const [movingRow, setMovingRow] = useState(null)
  const [direction, setDirection] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)

  // Dog sits on top of last stable row
  const topRow = stack[stack.length - 1]
  const corgiX = topRow.x + (topRow.blocks * 40) / 2 - 20
  const corgiY = topRow.y - 30

  // Spawn new moving row
  useEffect(() => {
    if (!movingRow && !gameOver) {
      const y = topRow.y - BLOCK_HEIGHT
      const blocks = topRow.blocks
      setMovingRow({ x: 0, y, blocks })
      setDirection(1)
    }
  }, [movingRow, topRow, gameOver])

  // Move the sliding row
  useEffect(() => {
    if (!movingRow || gameOver) return

    const interval = setInterval(() => {
      setMovingRow(prev => {
        let newX = prev.x + direction * (MOVE_SPEED_BASE + stack.length * 0.3)
        let newDir = direction

        if (newX <= 0) {
          newX = 0
          newDir = 1
        }
        if (newX + prev.blocks * 40 >= GAME_WIDTH) {
          newX = GAME_WIDTH - prev.blocks * 40
          newDir = -1
        }

        setDirection(newDir)
        return { ...prev, x: newX }
      })
    }, 16)

    return () => clearInterval(interval)
  }, [movingRow, direction, stack, gameOver])

  // Drop the moving row
  const drop = () => {
    if (!movingRow || gameOver) return

    const prevRow = topRow
    const movingStart = movingRow.x
    const movingEnd = movingRow.x + movingRow.blocks * 40
    const prevStart = prevRow.x
    const prevEnd = prevRow.x + prevRow.blocks * 40

    const overlapStart = Math.max(movingStart, prevStart)
    const overlapEnd = Math.min(movingEnd, prevEnd)
    const overlapBlocks = Math.floor((overlapEnd - overlapStart) / 40)

    if (overlapBlocks <= 0) {
      setGameOver(true)
      return
    }

    setStack(p => [
      ...p,
      { x: overlapStart, y: movingRow.y, blocks: overlapBlocks }
    ])
    setMovingRow(null)
    setScore(score + 1)
  }

  const reset = () => {
    setStack([
      { y: GAME_HEIGHT - BLOCK_HEIGHT, blocks: INITIAL_BLOCKS, x: Math.floor((GAME_WIDTH - INITIAL_BLOCKS * 40) / 2) }
    ])
    setMovingRow(null)
    setDirection(1)
    setGameOver(false)
    setScore(0)
  }

  return (
    <div className="center-wrapper">
      <div className="card" onClick={drop}>
        <h1>🐕 Corgi Stacker</h1>

        <div className="game">
          {stack.map((row, i) =>
            Array.from({ length: row.blocks }).map((_, j) => (
              <div
                key={`stack-${i}-${j}`}
                className="block"
                style={{ left: row.x + j * 40, top: row.y }}
              />
            ))
          )}

          {movingRow &&
            Array.from({ length: movingRow.blocks }).map((_, j) => (
              <div
                key={`moving-${j}`}
                className="block moving"
                style={{ left: movingRow.x + j * 40, top: movingRow.y }}
              />
            ))}

          {/* Dog sits on top of last stable row */}
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
        <p className="hint">Click to drop the moving row!</p>
      </div>
    </div>
  )
}

export default App
