import { useEffect, useState } from 'react'
import './App.css'

const GAME_WIDTH = 400
const GAME_HEIGHT = 400
const BLOCK_SIZE = 40
const BLOCK_HEIGHT = 20
const INITIAL_BLOCKS = 7
const MOVE_SPEED_BASE = 300 // milliseconds per block

function App() {
  const [stack, setStack] = useState([
    {
      y: GAME_HEIGHT - BLOCK_HEIGHT,
      blocks: INITIAL_BLOCKS,
      x: Math.floor((GAME_WIDTH - INITIAL_BLOCKS * BLOCK_SIZE) / BLOCK_SIZE) * BLOCK_SIZE,
    },
  ])
  const [movingRow, setMovingRow] = useState(null)
  const [direction, setDirection] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)

  const topRow = stack[stack.length - 1]
  const corgiX = topRow.x + (topRow.blocks * BLOCK_SIZE) / 2 - 20
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

  // Move the sliding row in a grid-aligned fashion
  useEffect(() => {
    if (!movingRow || gameOver) return

    const interval = setInterval(() => {
      setMovingRow(prev => {
        let newX = prev.x + direction * BLOCK_SIZE
        let newDir = direction

        // Wrap within grid
        if (newX < 0) {
          newX = 0
          newDir = 1
        }
        if (newX + prev.blocks * BLOCK_SIZE > GAME_WIDTH) {
          newX = GAME_WIDTH - prev.blocks * BLOCK_SIZE
          newDir = -1
        }

        setDirection(newDir)
        return { ...prev, x: newX }
      })
    }, MOVE_SPEED_BASE - stack.length * 15) // increase speed gradually

    return () => clearInterval(interval)
  }, [movingRow, direction, stack, gameOver])

  // Drop the moving row
  const drop = () => {
    if (!movingRow || gameOver) return

    const prevRow = topRow
    const overlapStart = Math.max(movingRow.x, prevRow.x)
    const overlapEnd = Math.min(
      movingRow.x + movingRow.blocks * BLOCK_SIZE,
      prevRow.x + prevRow.blocks * BLOCK_SIZE
    )
    const overlapBlocks = Math.floor((overlapEnd - overlapStart) / BLOCK_SIZE)

    if (overlapBlocks <= 0) {
      setGameOver(true)
      return
    }

    setStack(p => [
      ...p,
      { x: overlapStart, y: movingRow.y, blocks: overlapBlocks },
    ])
    setMovingRow(null)
    setScore(score + 1)
  }

  const reset = () => {
    setStack([
      {
        y: GAME_HEIGHT - BLOCK_HEIGHT,
        blocks: INITIAL_BLOCKS,
        x: Math.floor((GAME_WIDTH - INITIAL_BLOCKS * BLOCK_SIZE) / BLOCK_SIZE) * BLOCK_SIZE,
      },
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
                style={{ left: row.x + j * BLOCK_SIZE, top: row.y }}
              />
            ))
          )}

          {movingRow &&
            Array.from({ length: movingRow.blocks }).map((_, j) => (
              <div
                key={`moving-${j}`}
                className="block moving"
                style={{ left: movingRow.x + j * BLOCK_SIZE, top: movingRow.y }}
              />
            ))}

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
