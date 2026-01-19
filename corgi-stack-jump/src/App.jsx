import { useEffect, useState } from 'react'
import './App.css'

const GAME_WIDTH = 400
const GAME_HEIGHT = 400
const BLOCK_SIZE = 40
const BLOCK_HEIGHT = 20
const INITIAL_BLOCKS = 4
const MOVE_SPEED_BASE = 400
const SPEED_INCREASE = 15
const GOAL_Y = 40
const PERFECT_BONUS = 5

const snapToGrid = x => Math.floor(x / BLOCK_SIZE) * BLOCK_SIZE

function App() {
  const [stack, setStack] = useState([
    {
      y: GAME_HEIGHT - BLOCK_HEIGHT,
      blocks: INITIAL_BLOCKS,
      x: snapToGrid((GAME_WIDTH - INITIAL_BLOCKS * BLOCK_SIZE) / 2),
    },
  ])
  const [movingRow, setMovingRow] = useState(null)
  const [direction, setDirection] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [win, setWin] = useState(false)
  const [score, setScore] = useState(0)
  const [perfect, setPerfect] = useState(false)
  const [highScore, setHighScore] = useState(0)

  const topRow = stack[stack.length - 1]
  const corgiX = topRow.x + (topRow.blocks * BLOCK_SIZE) / 2 - 20
  const corgiY = topRow.y - 30

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('corgiStackerHighScore')
    if (saved) {
      setHighScore(Number(saved))
    }
  }, [])

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('corgiStackerHighScore', score)
    }
  }, [score, highScore])

  // Win condition
  useEffect(() => {
    if (topRow.y <= GOAL_Y && !win) {
      setWin(true)
      setMovingRow(null)
    }
  }, [topRow, win])

  // Spawn moving row
  useEffect(() => {
    if (!movingRow && !gameOver && !win) {
      setMovingRow({
        x: 0,
        y: topRow.y - BLOCK_HEIGHT,
        blocks: topRow.blocks,
      })
      setDirection(1)
    }
  }, [movingRow, topRow, gameOver, win])

  // Move row
  useEffect(() => {
    if (!movingRow || gameOver || win) return

    const interval = setInterval(() => {
      setMovingRow(prev => {
        let newX = prev.x + direction * BLOCK_SIZE
        let newDir = direction

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
    }, Math.max(60, MOVE_SPEED_BASE - stack.length * SPEED_INCREASE))

    return () => clearInterval(interval)
  }, [movingRow, direction, stack.length, gameOver, win])

  // Drop row
  const drop = () => {
    if (!movingRow || gameOver || win) return

    const prev = topRow
    const overlapStart = Math.max(movingRow.x, prev.x)
    const overlapEnd = Math.min(
      movingRow.x + movingRow.blocks * BLOCK_SIZE,
      prev.x + prev.blocks * BLOCK_SIZE
    )
    const overlapBlocks = Math.floor((overlapEnd - overlapStart) / BLOCK_SIZE)

    if (overlapBlocks <= 0) {
      setGameOver(true)
      return
    }

    const isPerfect =
      overlapBlocks === prev.blocks && overlapStart === prev.x

    if (isPerfect) {
      setPerfect(true)
      setTimeout(() => setPerfect(false), 600)
    }

    // Scoring
    const basePoints = overlapBlocks
    const bonusPoints = isPerfect ? PERFECT_BONUS : 0
    setScore(s => s + basePoints + bonusPoints)

    setStack(prevStack => [
      ...prevStack,
      {
        x: snapToGrid(overlapStart),
        y: movingRow.y,
        blocks: overlapBlocks,
      },
    ])

    setMovingRow(null)
  }

  const reset = () => {
    setStack([
      {
        y: GAME_HEIGHT - BLOCK_HEIGHT,
        blocks: INITIAL_BLOCKS,
        x: snapToGrid((GAME_WIDTH - INITIAL_BLOCKS * BLOCK_SIZE) / 2),
      },
    ])
    setMovingRow(null)
    setDirection(1)
    setGameOver(false)
    setWin(false)
    setScore(0)
    setPerfect(false)
  }

  return (
    <div className="center-wrapper">
      <div className="card" onClick={drop}>
        <h1>🐕 Corgi Stacker</h1>

        <div className={`game ${perfect ? 'perfect-flash' : ''}`}>
          <div className="treat" style={{ top: GOAL_Y }}>🦴</div>

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

          {perfect && <div className="perfect-text">✨ PERFECT! ✨</div>}

          {win && (
            <div className="overlay">
              <p>🎉 YOU GOT THE TREAT! 🦴</p>
              <button onClick={reset}>Play Again</button>
            </div>
          )}

          {gameOver && !win && (
            <div className="overlay">
              <p>💥 Game Over</p>
              <button onClick={reset}>Restart</button>
            </div>
          )}
        </div>

        <p className="score">
          Score: {score} | Best: {highScore}
        </p>
        <p className="hint">Click to drop the moving row</p>
      </div>
    </div>
  )
}

export default App
