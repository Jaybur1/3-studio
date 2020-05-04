import * as THREE from "three";

import materialLibrary from "./materialLibrary";

const createModel = (
  gltf,
  setBox,
  setFar,
  setModel,
  setSizeBounding,
  setNear
) => {
  const theModel = gltf.scene;

  // ? This is where we change materials
  // let part;

  theModel.traverse(o => {
    if (o.isMesh) {
      // part = o;
      o.material = materialLibrary().alien;
    }
  });
  // ?

  // ? Math for a few things including size, center, far, near
  const boundingBox = new THREE.Box3();
  boundingBox.setFromObject(theModel);

  const centerNew = new THREE.Vector3();
  boundingBox.getCenter(centerNew);

  const size = new THREE.Vector3();
  boundingBox.getSize(size);

  const maxSize = Math.max(size.x, size.y, size.z);
  const fitHeightDistance = maxSize / (2 * Math.atan((Math.PI * 45) / 360));
  const fitWidthDistance = fitHeightDistance / 1;
  const distance = 1.2 * Math.max(fitHeightDistance, fitWidthDistance);
  // ?

  // ? Set center of model to center of canvas
  theModel.position.x -= centerNew.x;
  theModel.position.y -= centerNew.y;
  theModel.position.z -= centerNew.z;
  // ?

  // ? Create visual bounding box
  const visualBoundingBox = new THREE.BoxHelper(theModel, 0xffff00);
  // ?

  // ? Set states
  setBox(visualBoundingBox);
  setFar(distance * 100);
  setNear(distance / 100);
  setSizeBounding(size);
  setModel(theModel);
  // ?
};

export default createModel;