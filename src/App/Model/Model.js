import React, { useState, useEffect } from "react";
import { useLoader } from "react-three-fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

const Model = props => {
  const [model, setModel] = useState();

  const createModel = gltf => {
    const theModel = gltf.scene;
    const INITIAL_MTL = new THREE.MeshPhongMaterial({
      color: 0x008000,
      shininess: 2
    });

    const INITIAL_MTL_METAL = new THREE.MeshStandardMaterial({
      color: 0x008000,
      metalness: 1,
      roughness: 0
    });

    let part;

    console.log(theModel);
    theModel.traverse(o => {
      if (o.isMesh) {
        console.log(o);
        part = o;
        o.material = INITIAL_MTL_METAL;
      }
    });

    // setModel(part);
    setModel(theModel);
  };

  useEffect(() => {
    new GLTFLoader().load(props.url, createModel);
  }, [props.url]);

  return model ? <primitive object={model} /> : null;
};

export default Model;
