import type { Board } from "../types/board.js";
import { Direction } from "../types/direction.js";

export default class Game {
  private board: Board;
  private activeSide: 'top'|'bottom';
  private gameOver: boolean;

  constructor(boardColLength: number = 6, seedPerHole: number = 2, firstSide: 'top'|'bottom' = 'top') {
    let topHoles: number[] = [];
    let bottomHoles: number[] = [];
    for (let i = 0; i < boardColLength * 2; i++) {
      topHoles.push(seedPerHole);
      bottomHoles.push(seedPerHole);
    }

    this.board = {
      top: {
        direction: Direction.CLOCKWISE,
        holes: topHoles,
      },
      bottom: {
        direction: Direction.CLOCKWISE,
        holes: bottomHoles,
      }
    };
    this.activeSide = firstSide;
    this.gameOver = false;
  }

  sow(startIndex: number) {
    // scooping
    const holes = this.board[this.activeSide].holes;
    const pickedUp = holes[startIndex];
    if (!pickedUp) throw new Error("Cannot pick up the holes. Hole empty or undefined.");
    holes[startIndex] = 0;
    const totalHoleNb = holes.length;
    
    // sowing
    let currentIndex = startIndex;
    let remaining = pickedUp;
    while (remaining > 0) {
      if (this.board[this.activeSide].direction === Direction.CLOCKWISE) {
        currentIndex = (currentIndex + 1) % totalHoleNb;
      } else { 
        currentIndex = (currentIndex - 1 + totalHoleNb) % totalHoleNb;
      }
      holes[currentIndex]! += 1;
      remaining--;
    }

    // Verify if current index is in the inner side.
    const isIndexInside = this.activeSide === 'top' && currentIndex > (holes.length - 1) / 2 
    ||  this.activeSide === 'bottom' && currentIndex < (holes.length - 1) / 2;
    
    const sideToCollect = this.activeSide === 'top' ? 'bottom' : 'top';
    let innerSide: number[];
    if (sideToCollect === 'top') {
      innerSide = this.board[sideToCollect].holes.slice((holes.length) / 2, holes.length);
    } else {
      innerSide = this.board[sideToCollect].holes.slice(0, (holes.length) / 2);
    }
    
    if (isIndexInside) {
      let innerSideNoSeed = !innerSide.some(element => element > 0);
      const idxToCollect = !innerSideNoSeed ? (holes.length - 1) - currentIndex : currentIndex;
      const collectedSeedVal = this.board[sideToCollect].holes[idxToCollect];
      
      if (collectedSeedVal! > 0 && holes[currentIndex]! > 1) {
        this.board[sideToCollect].holes[idxToCollect] = 0;
        holes[currentIndex]! += collectedSeedVal!;
      }
    }
    
    this.gameOver = !this.board[sideToCollect].holes.some(seedsNb => seedsNb > 0);
    
    if (this.gameOver) {
      return;
    }

    if (holes[currentIndex]! > 1) {
      this.sow(currentIndex);
      return;
    }

    this.activeSide = this.activeSide === 'top' ? 'bottom' : 'top';
  }

  getActiveSide() {
    return this.activeSide;
  }

  isOver() {
    return this.gameOver;
  }

  getWinner() {
    let topTotalSeed: number = 0;
    for (let i = 0; i < this.board['top'].holes.length; i++) {
      topTotalSeed += this.board['top'].holes[i]!;
    }
    
    let bottomTotalSeed: number = 0;
    for (let i = 0; i < this.board['bottom'].holes.length; i++) {
      bottomTotalSeed += this.board['bottom'].holes[i]!;
    }

    if (topTotalSeed > bottomTotalSeed) {
      return 'top';
    } else if (topTotalSeed < bottomTotalSeed) {
      return 'buttom';
    } else {
      return null;
    }
  }
}