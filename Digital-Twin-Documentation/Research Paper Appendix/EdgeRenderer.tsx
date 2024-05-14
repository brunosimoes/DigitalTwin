import React, { useContext, useEffect, useRef } from "react";
import { RemoteVideoProvider, SocketContext } from "pbcWebRTC/providers/RemoteSupportProvider";

// Render some moving ball that will be streamed to a tinny client using WebRTC
const renderAnimation = (canvas: HTMLCanvasElement, remoteEvent: any) => {
  const ctx = canvas.getContext("2d");

  let x = canvas.width / 2; // initial x position
  let y = canvas.height / 2; // initial y position
  let dx = 2; // change in x per frame
  let dy = -2; // change in y per frame
  const radius = 20; // circle radius

  const drawCircle = () => {
    if (!ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();

    // Process remove events
    if (remoteEvent) {
      ctx.beginPath();
      ctx.arc(
        remoteEvent.x * canvas.width,
        remoteEvent.y * canvas.height,
        radius / 2,
        0,
        Math.PI * 2,
      );

      ctx.fillStyle = "black";
      if (remoteEvent?.event === "click" || remoteEvent?.event === "drag") ctx.fillStyle = "red";

      ctx.fill();
      ctx.closePath();
    }

    // change position
    x += dx;
    y += dy;

    // check boundaries and change direction
    if (x + radius > canvas.width || x - radius < 0) {
      dx = -dx;
    }
    if (y + radius > canvas.height || y - radius < 0) {
      dy = -dy;
    }
  };

  const animate = () => {
    drawCircle();
    return requestAnimationFrame(animate);
  };
  return animate();
};

export const EdgeRenderer = ({ children }: any) => {
  const { setStream, remoteEvent } = useContext(SocketContext) as RemoteVideoProvider;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const eventFire = (evt: { event: string; x: number; y: number }) => {
    if (evt?.event) {
      const mouseEvent = new MouseEvent(evt.event, { clientX: evt.x, clientY: evt.y }); // Create the event.
      if (canvasRef.current) canvasRef.current.dispatchEvent(mouseEvent);
    }
  };

  useEffect(() => {
    eventFire(remoteEvent);
  }, [remoteEvent]);

  // Render some hello world scene
  useEffect(() => {
    let animationId: number | null = null;
    if (canvasRef.current) {
      animationId = renderAnimation(canvasRef.current, remoteEvent);
      const stream = canvasRef.current.captureStream();

      // Register this video with WebRTC service
      setStream(stream);
    }
    return () => {
      if (animationId !== null) cancelAnimationFrame(animationId);
    };
  }, [canvasRef, remoteEvent]);

  return (
    <div style={{ marginTop: "40px" }}>
      <canvas
        ref={canvasRef}
        width={"640px"}
        height={"480px"}
        style={{ border: "1px solid black" }}
      />
      {children}
    </div>
  );
};
