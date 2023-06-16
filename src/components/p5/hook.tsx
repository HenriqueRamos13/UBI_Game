import { useState, useEffect } from "react";
import p5Types from "p5";

const BLOCK_SIZE = 32;

const USED_KEYS = {
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  w: "w",
  s: "s",
  a: "a",
  d: "d",
  space: " ",
  q: "q",
  e: "e",
};

interface Arrow {
  axis: "x" | "y";
  value: number;
}

const arrows: { [key: string]: Arrow } = {
  ArrowUp: {
    axis: "y",
    value: -BLOCK_SIZE,
  },
  ArrowDown: {
    axis: "y",
    value: BLOCK_SIZE,
  },
  ArrowLeft: {
    axis: "x",
    value: -BLOCK_SIZE,
  },
  ArrowRight: {
    axis: "x",
    value: BLOCK_SIZE,
  },
};

interface WASD {
  [key: string]: Arrow;
}

const wasd: WASD = {
  w: {
    axis: "y",
    value: -BLOCK_SIZE,
  },
  s: {
    axis: "y",
    value: BLOCK_SIZE,
  },
  a: {
    axis: "x",
    value: -BLOCK_SIZE,
  },
  d: {
    axis: "x",
    value: BLOCK_SIZE,
  },
};

const powersKeys: { [key: string]: string } = {
  space: "space",
  q: "q",
  e: "e",
};

interface Power {
  id: string;
  x: number;
  y: number;
  color: string;
  maxDistance: number;
  distanceTravelled: number;
  lastMovementTime: number;
  movementPeriod: number;
}

interface Player {
  id: string;
  x: number;
  y: number;
  color: string;
  maxRange: number;
}

interface LastPlayerMovement {
  axis: "x" | "y";
  value: number;
}

interface Cursor {
  x: number;
  y: number;
  color: string;
}

const useP5 = () => {
  const [roomId, setRoomId] = useState("");
  const [players, setPlayers] = useState<Player[]>([
    {
      id: "",
      x: 128,
      y: 128,
      color: "yellow",
      maxRange: 4,
    },
  ]);
  const [powers, setPowers] = useState<Power[]>([]);
  const [power, setPower] = useState<Power | null>(null);
  const [player, setPlayer] = useState<Player>({
    id: "",
    x: 64,
    y: 64,
    color: "blue",
    maxRange: 4,
  });
  const [lastArrowMovement, setLastArrowMovement] =
    useState<LastPlayerMovement>({
      axis: "x",
      value: BLOCK_SIZE,
    });
  const [cursor, setCursor] = useState<Cursor | null>(null);

  useEffect(() => {
    console.log("lastArrowMovement", lastArrowMovement);
  }, [lastArrowMovement]);

  function verifyIfPowerHitAPlayer(power: Power) {
    return players.some((player) => {
      return (
        player.x === power.x &&
        player.y === power.y &&
        player.color !== power.color
      );
    });
  }

  function draw(p5: p5Types) {
    p5.background(100);

    // for each player draw a blue square
    players.forEach((player) => {
      p5.fill(player.color);
      p5.rect(player.x, player.y, BLOCK_SIZE, BLOCK_SIZE);
    });

    p5.fill(player.color);
    p5.rect(player.x, player.y, BLOCK_SIZE, BLOCK_SIZE);

    if (cursor) {
      p5.fill(cursor.color);
      p5.rect(cursor.x, cursor.y, BLOCK_SIZE, BLOCK_SIZE);
    }

    if (power) {
      if (verifyIfPowerHitAPlayer(power)) {
        setPower(null);
        return;
      }

      if (power.distanceTravelled >= power.maxDistance) {
        setPower(null);
        return;
      }

      p5.fill(power.color);

      if (p5.millis() - power.lastMovementTime < power.movementPeriod) {
        p5.rect(power.x, power.y, BLOCK_SIZE, BLOCK_SIZE);
      } else {
        switch (lastArrowMovement.axis) {
          case "x":
            if (lastArrowMovement.value > 0) {
              p5.rect(power.x + BLOCK_SIZE, power.y, BLOCK_SIZE, BLOCK_SIZE);
              setPower({
                ...power,
                x: power.x + BLOCK_SIZE,
                distanceTravelled: (power.distanceTravelled += BLOCK_SIZE),
                lastMovementTime: p5.millis(),
              });
            }
            if (lastArrowMovement.value < 0) {
              p5.rect(power.x - BLOCK_SIZE, power.y, BLOCK_SIZE, BLOCK_SIZE);
              setPower({
                ...power,
                x: power.x - BLOCK_SIZE,
                distanceTravelled: (power.distanceTravelled += BLOCK_SIZE),
                lastMovementTime: p5.millis(),
              });
            }
            break;
          case "y":
            if (lastArrowMovement.value > 0) {
              p5.rect(power.x, power.y + BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
              setPower({
                ...power,
                y: power.y + BLOCK_SIZE,
                distanceTravelled: (power.distanceTravelled += BLOCK_SIZE),
                lastMovementTime: p5.millis(),
              });
            }
            if (lastArrowMovement.value < 0) {
              p5.rect(power.x, power.y - BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
              setPower({
                ...power,
                y: power.y - BLOCK_SIZE,
                distanceTravelled: (power.distanceTravelled += BLOCK_SIZE),
                lastMovementTime: p5.millis(),
              });
            }
            break;
        }
      }
    }
  }

  function setup(p5: p5Types, canvasParentRef: Element) {
    p5.createCanvas(1280, 720).parent(canvasParentRef);
  }

  function keyPressed(p5: p5Types, event: UIEvent | undefined) {
    const key = (event as any).key;

    if (!event) return;

    if ((key as string) in wasd) {
      const { axis, value } = wasd[key as string];

      setPlayer((player) => ({
        ...player,
        [axis]: player[axis] + value,
      }));

      if (cursor) {
        let moveCursor = false;

        if (key === USED_KEYS.w) {
          if (cursor.y - player.y > player.maxRange * BLOCK_SIZE) {
            moveCursor = true;
          }
        }
        if (key === USED_KEYS.s) {
          if (player.y - cursor.y > player.maxRange * BLOCK_SIZE) {
            moveCursor = true;
          }
        }
        if (key === USED_KEYS.a) {
          if (cursor.x - player.x > player.maxRange * BLOCK_SIZE) {
            moveCursor = true;
          }
        }
        if (key === USED_KEYS.d) {
          if (player.x - cursor.x > player.maxRange * BLOCK_SIZE) {
            moveCursor = true;
          }
        }

        if (moveCursor) {
          setCursor(
            (cursor) =>
              ({
                ...cursor,
                [axis]: cursor![axis] + value,
              } as Cursor)
          );
        }
      }
    }

    if ((key as string) in arrows) {
      const { axis, value } = arrows[key as string];

      if (cursor) {
        let moveCursor = true;
        if (key === USED_KEYS.ArrowUp) {
          // verify if the cursor is "maxRange" away from the player on the positive y axis. If it is, don't move the cursor
          if (player.y - cursor.y > player.maxRange * BLOCK_SIZE) {
            moveCursor = false;
          }
        }
        if (key === USED_KEYS.ArrowDown) {
          // verify if the cursor is "maxRange" away from the player on the negative y axis. If it is, don't move the cursor
          if (cursor.y - player.y > player.maxRange * BLOCK_SIZE) {
            moveCursor = false;
          }
        }
        if (key === USED_KEYS.ArrowLeft) {
          // verify if the cursor is "maxRange" away from the player on the negative x axis. If it is, don't move the cursor
          if (player.x - cursor.x > player.maxRange * BLOCK_SIZE) {
            moveCursor = false;
          }
        }
        if (key === USED_KEYS.ArrowRight) {
          // verify if the cursor is "maxRange" away from the player on the positive x axis. If it is, don't move the cursor
          if (cursor.x - player.x > player.maxRange * BLOCK_SIZE) {
            moveCursor = false;
          }
        }

        if (moveCursor) {
          setCursor(
            (cursor) =>
              ({
                ...cursor,
                [axis]: cursor![axis] + value,
              } as Cursor)
          );
        }
      }

      setPower((power) => {
        if (power) {
          return {
            ...power,
            [axis]: power[axis] + value,
          };
        } else {
          return null;
        }
      });

      setLastArrowMovement({
        axis,
        value,
      });
    }

    if ((key as any) in powersKeys) {
      if (key === USED_KEYS.e) {
        if (!power) {
          setCursor(null);

          const newPower = {
            id: Math.random().toString(),
            x: player.x,
            y: player.y,
            color: "red",
            maxDistance: BLOCK_SIZE * 10,
            distanceTravelled: 0,
            lastMovementTime: p5.millis(),
            movementPeriod: 100,
          };

          setPower(newPower);
        }
      }

      if (key === USED_KEYS.q) {
        // put the cursor close to the player based on the last arrow movement
        if (lastArrowMovement.axis === "x") {
          setCursor({
            x: player.x + lastArrowMovement.value,
            y: player.y,
            color: "green",
          });
        } else {
          setCursor({
            x: player.x,
            y: player.y + lastArrowMovement.value,
            color: "green",
          });
        }
      }
    }
  }

  return { draw, setup, keyPressed };
};

export default useP5;
