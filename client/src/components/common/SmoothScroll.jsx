import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

const SmoothScroll = ({ children }) => {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.15,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.2,
        infinite: false,
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  );
};

export default SmoothScroll;