import React, { useRef, useState } from "react";
import { Plane } from "react-curtains";
import { useCheckerContext } from "./MouseChecker";
import ClickableCheckerShaderFrag from "./ClickableCheckerShader.frag";
import ClickableCheckerShaderVert from "./ClickableCheckerShader.vert";

const CURSOR_SCALE_FACTOR = 6000;
const CURSOR_SENSITIVITY = 4;
const MIN_CURSOR_SIZE = 0;
const MAX_CURSOR_SIZE = 1;

export default function ClickableChecker({ children }) {
  const { uniforms, mousePos, showGlobalCursor } = useCheckerContext();
  const boundingRef = useRef();
  const isHovering = useRef(false);

  const targetCursorSize = useRef(0);
  const cursorSize = useRef(0);

  const onRender = (plane) => {
    const planeBounds = boundingRef.current.getBoundingClientRect();

    plane.uniforms.time.value = uniforms.current.time.value;
    plane.uniforms.mouse.value = plane.mouseToPlaneCoords(mousePos.current);

    targetCursorSize.current = isHovering.current
      ? MAX_CURSOR_SIZE * (planeBounds.width / 6)
      : MIN_CURSOR_SIZE;

    cursorSize.current +=
      (targetCursorSize.current - cursorSize.current) / CURSOR_SENSITIVITY;
    plane.uniforms.cursorSize.value = cursorSize.current;

    plane.uniforms.resolution.value.set(planeBounds.width, planeBounds.height);
  };

  const handleMouseEnter = () => {
    isHovering.current = true;
    showGlobalCursor.current = false;
  };
  const handleMouseLeave = () => {
    isHovering.current = false;
    showGlobalCursor.current = true;
  };

  return (
    <div
      ref={boundingRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Plane
        uniforms={uniforms.current}
        vertexShader={ClickableCheckerShaderVert}
        fragmentShader={ClickableCheckerShaderFrag}
        onRender={onRender}
        style={{
          height: "48px",
          border: "none",
        }}
      >
        {children}
      </Plane>
    </div>
  );
}
