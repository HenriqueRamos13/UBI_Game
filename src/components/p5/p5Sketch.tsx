"use client";
import React from "react";
import dynamic from "next/dynamic";
const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
  ssr: false,
});
// @ts-ignore
import { useWindowSize } from "@uidotdev/usehooks";
import useP5 from "./hook";

interface ComponentProps {}

const P5Sketch: React.FC<ComponentProps> = (props: ComponentProps) => {
  const { width, height } = useWindowSize();
  const { draw, setup, keyPressed } = useP5();

  return <Sketch setup={setup} draw={draw} keyPressed={keyPressed} />;
};

export default P5Sketch;
