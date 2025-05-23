"use client";

import * as React from "react";
import { useMemo, useState, useImperativeHandle, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { getSvgPath } from "../figma-squircle";

import { useElementSize } from "./use-element-size";

export { SquircleNoScript } from "./no-js";

interface SquircleProps {
  cornerSmoothing?: number;
  cornerRadius?: number;

  topLeftCornerRadius?: number;
  topRightCornerRadius?: number;
  bottomLeftCornerRadius?: number;
  bottomRightCornerRadius?: number;

  asChild?: boolean;
  children?: React.ReactNode;

  width?: number;
  height?: number;

  defaultWidth?: number;
  defaultHeight?: number;
}

function SquircleInner<E extends React.ElementType = "div">(
  props: SquircleProps & Omit<React.ComponentPropsWithoutRef<E>, keyof SquircleProps>,
  refFromParent: React.Ref<any>
) {
  const {
    cornerRadius,
    topLeftCornerRadius,
    topRightCornerRadius,
    bottomLeftCornerRadius,
    bottomRightCornerRadius,
    cornerSmoothing = 0.6,
    asChild,
    style,
    width: w,
    height: h,
    defaultWidth,
    defaultHeight,
    ...propsRest
  } = props;

  const Component = asChild ? Slot : "div";
  const [ref, { width, height }] = useElementSize<HTMLDivElement>({
    defaultWidth,
    defaultHeight,
  });

  const actualWidth = w ?? width;
  const actualHeight = h ?? height;

  // Внутренний state для ручного триггера useMemo
  const [forceUpdate, setForceUpdate] = useState(0);

  useImperativeHandle(refFromParent, () => ({
    forceUpdateClipPath: () => setForceUpdate(f => f + 1)
  }), []);

  const path = useMemo(() => {
    if (actualWidth === 0 || actualHeight === 0) return "";
    return getSvgPath({
      width: actualWidth,
      height: actualHeight,
      cornerRadius,

      topLeftCornerRadius,
      topRightCornerRadius,
      bottomLeftCornerRadius,
      bottomRightCornerRadius,

      cornerSmoothing,
    });
  }, [actualWidth, actualHeight, cornerRadius, cornerSmoothing, forceUpdate]);

  return (
    <Component
      {...propsRest}
      ref={ref}
      style={{
        ...style,
        borderRadius: cornerRadius,
        width: w ?? defaultWidth,
        height: h ?? defaultHeight,
        clipPath: `path('${path}')`,
      }}
      data-squircle={cornerRadius}
    />
  );
}

export const Squircle = forwardRef(SquircleInner);
export type { SquircleProps };
export * from "./StaticSquircle";
