"use client";

import { useState, useEffect } from "react";
import p5Types from "p5";
import supabaseClient from "../../utils/supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";

const BLOCK_SIZE = 32;

interface Axis {
  axis: "x" | "y";
  value: number;
}

interface WASD {
  [key: string]: Axis;
}

const wasd: WASD = {
  s: {
    axis: "y",
    value: -BLOCK_SIZE,
  },
  x: {
    axis: "y",
    value: BLOCK_SIZE,
  },
  z: {
    axis: "x",
    value: -BLOCK_SIZE,
  },
  c: {
    axis: "x",
    value: BLOCK_SIZE,
  },
};

interface Player {
  id: string;
  x: number;
  y: number;
  color: string;
  maxRange: number;
  presence_ref?: string | null;
}

const useP5 = () => {
  const [roomId, setRoomId] = useState("");
  const [enemy, setEnemy] = useState<Player | null>(null);
  const [player, setPlayer] = useState<Player>({
    id: "user" + Math.floor(Math.random() * 90000) + 10000,
    x: 64,
    y: 64,
    color: "blue",
    maxRange: 4,
    presence_ref: null,
  });

  // Channel name can be any string.
  // Create channels with the same name for both the broadcasting and receiving clients.
  const [channel, setChannel] = useState<RealtimeChannel>(
    supabaseClient.channel("room-6")
  );

  useEffect(() => {
    const channelUsers = supabaseClient.channel("online-users-room-6", {
      config: {
        presence: {
          key: player.id,
        },
      },
    });

    channelUsers.on("presence", { event: "sync" }, () => {
      console.log("Online users: ", channelUsers.presenceState());

      if (
        !player.presence_ref &&
        player.id &&
        channelUsers.presenceState()[player.id]
      ) {
        setPlayer((prevPlayer) => {
          return {
            ...prevPlayer,
            presence_ref: (
              channelUsers.presenceState()[prevPlayer.id] as any
            )[0].presence_ref,
          };
        });
      }

      console.log("xxx", channelUsers.presenceState());

      Object.keys(channelUsers.presenceState()).forEach((key) => {
        console.log("tttttt", player, key);
        if (key === player.id) return;

        console.log("yyyyy", channelUsers.presenceState()[key]);

        setEnemy((prevEnemy) => ({
          id: key,
          x: 64,
          y: 64,
          color: "yellow",
          maxRange: 4,
          presence_ref: channelUsers.presenceState()[key][0].presence_ref,
        }));
      });
    });

    channelUsers.on("presence", { event: "join" }, ({ newPresences }) => {
      console.log("New users have joined: ", newPresences);
    });

    channelUsers.on("presence", { event: "leave" }, ({ leftPresences }) => {
      console.log("Users have left: ", leftPresences);
      if (leftPresences[0].presence_ref === enemy?.presence_ref) {
        setEnemy(null);
      }
    });

    channelUsers.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        const status = await channelUsers.track({
          online_at: new Date().toISOString(),
        });
        console.log(status);
      }
    });

    const channelLatency = supabaseClient.channel("calc-latency", {
      config: {
        broadcast: { ack: true },
      },
    });

    channelLatency.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        const begin = performance.now();

        await channelLatency.send({
          type: "broadcast",
          event: "latency",
          payload: {},
        });

        const end = performance.now();

        console.log(`Latency is ${end - begin} milliseconds`);
      }
    });

    channel
      .subscribe((status) => {
        console.log("channel status", status);
        if (status === "SUBSCRIBED") {
          // now you can start broadcasting cursor positions
          console.log("channel subscribed");
        }
      })
      .on("broadcast", { event: "player_move" }, (payload) => {
        console.log("player moved payload", payload);
        setEnemy((prevEnemy) => {
          if (!prevEnemy) {
            return null;
          }

          if (prevEnemy?.id === payload.payload.id) {
            return {
              ...prevEnemy,
              x: payload.payload.x,
              y: payload.payload.y,
            };
          }
          return prevEnemy;
        });
      });

    return () => {
      channelUsers.unsubscribe();
      channelLatency.unsubscribe();
      channel.unsubscribe();
    };
  }, []);

  function draw(p5: p5Types) {
    p5.background(100);

    p5.fill(player.color);
    p5.rect(player.x, player.y, BLOCK_SIZE, BLOCK_SIZE);

    if (enemy) {
      p5.fill(enemy.color);
      p5.rect(enemy.x, enemy.y, BLOCK_SIZE, BLOCK_SIZE);
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

      const newPlayerPosition = {
        ...player,
        [axis]: player[axis] + value,
      };

      setPlayer((player) => ({
        ...newPlayerPosition,
      }));

      channel!.send({
        type: "broadcast",
        event: "player_move",
        payload: {
          x: newPlayerPosition.x,
          y: newPlayerPosition.y,
          id: player.id,
        },
      });
    }
  }

  return { draw, setup, keyPressed };
};

export default useP5;
