import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useFrame } from "react-three-fiber";

const KLight = props => {
  const [lightPosition, setLightPosition] = useState([0, 0, 0]);

  // object referance
  const sphere = useRef();
  const pointLight = useRef();

  useEffect(() => {
    // on load add to draggable objects
    const dragObjs = [...props.dragObjects];
    sphere.current && props.setDrag([...dragObjs, sphere.current]);
    // config shadow casting

    if (pointLight.current) {
      pointLight.current.shadow.camera.top = 100;
      pointLight.current.shadow.camera.right = 100;
      pointLight.current.shadow.camera.left = -100;
      pointLight.current.shadow.camera.bottom = -100;
    }
  }, []);

  useFrame(() => {
    const time = Date.now() * 0.001;
    if (sphere.current) {
      if (props.kLight.orbit.x)
        sphere.current.position.x +=
          props.kLight.args[0] * 0.07 * Math.sin(time * 0.7);
      if (props.kLight.orbit.y)
        sphere.current.position.y +=
          props.kLight.args[0] * 0.07 * Math.cos(time * 0.7);
      if (props.kLight.orbit.z)
        sphere.current.position.z +=
          props.kLight.args[0] * 0.07 * Math.cos(time * 0.7);

      setLightPosition([
        sphere.current.position.x,
        sphere.current.position.y,
        sphere.current.position.z
      ]);
    }
  });
  return (
    <>
      <mesh
        ref={sphere}
        visible
        name="k-light"
        userData={{ object: "light-object" }}
        castShadow
        scale={props.kLight.scale}
        position={[-props.kLight.initPosition, 0, 0]}
        lookAt={[0, 0, 0]}
        onPointerOver={e => {
          props.toggleMediaLock();
        }}
        onPointerOut={e => props.toggleMediaLock()}
      >
        <sphereGeometry attach="geometry" args={props.kLight.args} />
        <meshBasicMaterial
          attach="material"
          color={`#${props.kLight.color}`}
          opacity={0.3}
          // wireframe
          transparent
          roughness={1}
          metalness={0}
        />
      </mesh>

      <pointLight
        ref={pointLight}
        color={`#${props.kLight.color}`}
        intensity={props.kLight.brightness * Math.PI}
        position={lightPosition}
        lookAt={[0, 0, 0]}
        power={props.kLight.power * 4 * Math.PI}
        penumbra={1}
        castShadow
      />
    </>
  );
};

KLight.propTypes = {
  toggleMediaLock: PropTypes.func.isRequired,
  dragObjects: PropTypes.array.isRequired,
  kLight: PropTypes.object
};

export default KLight;
