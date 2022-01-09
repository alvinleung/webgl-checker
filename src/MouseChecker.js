import React, { useEffect, useRef } from "react";
import { Vec2 } from "curtainsjs";
import { Plane } from "react-curtains";

import MouseCheckerShaderFrag from "./MouseCheckerShader.frag";
import MouseCheckerShaderVert from "./MouseCheckerShader.vert";

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export function MouseChecker({ children }) {
  const mousePos = useRef(new Vec2(0, 0));
  const planeMeasurementRef = useRef();
  const cursorSize = useRef(0);
  const targetCursorSize = useRef(0);

  const viewportResolution = useRef({
    x: 0,
    y: 0,
  });

  const basicUniforms = {
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
      value: new Vec2(
        viewportResolution.current.x,
        viewportResolution.current.y
      ),
    },
  };

  const onRender = (plane) => {
    plane.uniforms.time.value++;

    const nextMouseCoords = plane.mouseToPlaneCoords(mousePos.current);
    const prevMouseCoords = plane.uniforms.mouse.lastValue;

    const mouseCoordsDiff = new Vec2(nextMouseCoords.x, nextMouseCoords.y).sub(
      prevMouseCoords
    );
    const mouseSpeedSquared =
      mouseCoordsDiff.x * mouseCoordsDiff.x +
      mouseCoordsDiff.y * mouseCoordsDiff.y;

    const CURSOR_SCALE_FACTOR = 6000;
    const CURSOR_SENSITIVITY = 10;
    const MIN_CURSOR_SIZE = 6;
    const MAX_CURSOR_SIZE = 40;

    targetCursorSize.current = clamp(
      CURSOR_SCALE_FACTOR * mouseSpeedSquared,
      MIN_CURSOR_SIZE,
      MAX_CURSOR_SIZE
    );

    cursorSize.current +=
      (targetCursorSize.current - cursorSize.current) / CURSOR_SENSITIVITY;
    console.log(targetCursorSize.current);

    plane.uniforms.cursorSize.value = cursorSize.current;
    plane.uniforms.mouse.value = nextMouseCoords;

    plane.uniforms.resolution.value.set(
      viewportResolution.current.x,
      viewportResolution.current.y
    );
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

    viewportResolution.current = measurePlaneResolution();

    function resizeResolution() {
      viewportResolution.current = measurePlaneResolution();
    }
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
      <Plane
        // plane init parameters
        vertexShader={MouseCheckerShaderVert}
        fragmentShader={MouseCheckerShaderFrag}
        uniforms={basicUniforms}
        // plane events
        onRender={onRender}
      >
        {children}
      </Plane>
    </div>
  );
}
