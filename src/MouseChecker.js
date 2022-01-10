import React, { useEffect, useRef, useContext } from "react";
import { Vec2 } from "curtainsjs";
import { Plane } from "react-curtains";

import MouseCheckerShaderFrag from "./MouseCheckerShader.frag";
import MouseCheckerShaderVert from "./MouseCheckerShader.vert";

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const CheckerContext = React.createContext();

export const useCheckerContext = () => useContext(CheckerContext);

export function MouseChecker({ children }) {
  const mousePos = useRef(new Vec2(0, 0));
  const planeMeasurementRef = useRef();
  const cursorSize = useRef(0);
  const targetCursorSize = useRef(0);
  const showGlobalCursor = useRef(true);

  const checkerUniforms = useRef({
    time: {
      name: "uTime",
      type: "1f",
      value: 0,
    },
    mouse: {
      name: "uMouse",
      type: "2f",
      value: mousePos.current,
    },
    cursorSize: {
      name: "uCursorSize",
      type: "1f",
      value: 2,
    },
    resolution: {
      name: "uResolution",
      type: "2f",
      value: new Vec2(0, 0),
    },
  });

  // State update
  const onRender = (plane) => {
    // update time value in the plane
    plane.uniforms.time.value++;

    // calculate the mouse position
    const nextMouseCoords = plane.mouseToPlaneCoords(mousePos.current);
    const prevMouseCoords = plane.uniforms.mouse.lastValue;

    const mouseCoordsDiff = new Vec2(nextMouseCoords.x, nextMouseCoords.y).sub(
      prevMouseCoords
    );
    const mouseSpeedSquared =
      mouseCoordsDiff.x * mouseCoordsDiff.x +
      mouseCoordsDiff.y * mouseCoordsDiff.y;

    const CURSOR_SCALE_FACTOR = 6000;
    const CURSOR_SENSITIVITY = 7;
    const MIN_CURSOR_SIZE = 4;
    const MAX_CURSOR_SIZE = 20;

    targetCursorSize.current = showGlobalCursor.current
      ? clamp(
          CURSOR_SCALE_FACTOR * mouseSpeedSquared,
          MIN_CURSOR_SIZE,
          MAX_CURSOR_SIZE
        )
      : 0.0;

    cursorSize.current +=
      (targetCursorSize.current - cursorSize.current) / CURSOR_SENSITIVITY;

    plane.uniforms.cursorSize.value = cursorSize.current;
    plane.uniforms.mouse.value = nextMouseCoords;

    plane.uniforms.resolution.value.set(
      checkerUniforms.current.resolution.value.x,
      checkerUniforms.current.resolution.value.y
    );

    // update the checker uniform base on the plane
    checkerUniforms.current = plane.uniforms;
  };

  // capture the viewport size
  useEffect(() => {
    function measurePlaneResolution() {
      const clientRect = planeMeasurementRef.current.getBoundingClientRect();
      return {
        x: clientRect.width,
        y: clientRect.height,
      };
    }
    function resizeResolution() {
      const viewportResolution = measurePlaneResolution();
      checkerUniforms.current.resolution.value.set(
        viewportResolution.x,
        viewportResolution.y
      );
    }
    resizeResolution();
    window.addEventListener("resize", resizeResolution);
    return () => {
      window.removeEventListener("resize", resizeResolution);
    };
  }, [planeMeasurementRef]);

  // capture mouse position
  useEffect(() => {
    function handleMouseMove(e) {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={planeMeasurementRef}
      style={{
        // stretch full width of the site
        display: "flex",
        margin: "auto auto",
        flexFlow: "column",
        justifyContent: "stretch",
      }}
    >
      <CheckerContext.Provider
        value={{
          uniforms: checkerUniforms,
          mousePos: mousePos,
          showGlobalCursor: showGlobalCursor,
        }}
      >
        <Plane
          // plane init parameters
          vertexShader={MouseCheckerShaderVert}
          fragmentShader={MouseCheckerShaderFrag}
          uniforms={checkerUniforms.current}
          // plane events
          onRender={onRender}
          transparent={true}
          renderOrder={0}
        >
          {children}
        </Plane>
      </CheckerContext.Provider>
    </div>
  );
}
