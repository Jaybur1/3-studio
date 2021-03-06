import React, { useState, Suspense, useEffect } from "react";
import { Canvas, Dom } from "react-three-fiber";
import * as THREE from "three";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import Controls from "../Controls/Controls";
import Environment from "../Enivronment/Environment";
import Bridge from "../Bridge/Bridge";
import Camera from "../Camera/Camera";
import LoaderModel from "../../../LoaderModal/LoaderModel";

import orthoViewPositions from "../../../../../helpers/orthoViewsPositions";
import materialLibrary from "../../../../../helpers/materialLibrary";
import * as actions from "../../../../../store/actions/index";
import { createPartModel } from "../../../../../helpers/createPartModel";

import "./EditCanvas.scss";

const EditCanvas = props => {
  // ! State ------------------------------------------------- //
  const [directionalPosition] = useState([0.5, 0, 0.86]);

  const [loading, setLoading] = useState(true);

  // ? Cameras
  const [perspective, setPerspective] = useState(true);
  const [ortho, setOrtho] = useState(null);

  // ! ------------------------------------------------- //

  setTimeout(() => setLoading(false), 1500);

  // ? Fallback case
  const fallbackElement = (
    <Dom>
      <div></div>
    </Dom>
  );

  useEffect(() => {
    // ? Update camera to ortho with selected side handler
    const generateOrthoCamera = side => {
      setPerspective(false);
      setOrtho(orthoViewPositions(props.sizeBounding)[side]);
      props.onSetFov(30);
    };

    // ? Update camera to perspective handler
    const generatePerspectiveCamera = () => {
      setPerspective(true);
      setOrtho(null);
      props.onSetFov(45);
    };

    if (props.cameraMode === "PERSPECTIVE") {
      generatePerspectiveCamera();
    } else {
      generateOrthoCamera(props.cameraMode.toLowerCase());
    }
  }, [props, props.cameraMode]);

  const handleDrop = e => {
    // console.log(e);
    if (props.selectedMaterial) {
      // console.log(e.object);

      // Order is important
      props.onUpdateMaterial(e.object.name, {
        name: props.selectedMaterial
      });

      e.object.material = materialLibrary(props.selectedMaterial)[
        props.selectedMaterial
      ];
      props.onSetSelectedMaterial("");

      // Trigger unsaved changes
      props.onSetConfigurationUnsaved();
    }
  };

  // const [move, setMove] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handlePartClick = e => {
    // Differentiate between click and drag
    if (e.clientX === mousePosition.x && e.clientY === mousePosition.y) {
      // Set selected part in redux
      props.onSetSelectedPart(e.object);

      // Clone for part canvas
      const part = e.object.clone();

      // Order of inputs is important
      createPartModel(
        part,
        props.onSetPartFar,
        props.onSetPartSizeBounding,
        props.onSetPartNear,
        props.onSetPartModel
      );
    }
  };

  // ? Canvas output
  const canvasElement = props.model ? (
    <Canvas
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.outputEncoding = THREE.sRGBEncoding;
        gl.gammaFactor = 2.2;
      }}
    >
      <Camera
        position={
          perspective
            ? [
                -props.sizeBounding.x,
                props.sizeBounding.y,
                props.sizeBounding.z
              ]
            : ortho
        }
        fov={props.fov}
        far={props.far}
        near={props.near}
      />
      <primitive
        object={props.model}
        dispose={null}
        onPointerMove={e => handleDrop(e)}
        onPointerDown={e => {
          setMousePosition({
            x: e.clientX,
            y: e.clientY
          });
        }}
        onPointerUp={e => handlePartClick(e)}
      />
      {props.directionalLight && (
        <directionalLight
          intensity={props.directionalIntensity}
          color={`#${props.directionalLightColor}`}
          position={directionalPosition}
        />
      )}
      {props.hemisphereLight && (
        <hemisphereLight
          intensity={props.hemisphereIntensity}
          color={`#${props.hemisphereLightColor}`}
        />
      )}
      {props.ambientLight && (
        <ambientLight
          intensity={props.ambientIntensity}
          color={`#${props.ambientLightColor}`}
        />
      )}
      <Suspense fallback={fallbackElement}>
        <Environment
          bgEnvironment={props.bgEnvironment}
          bgSolid={props.bgSolid}
          bgColor={props.bgColor}
          mapEnvironment={props.mapEnvironment}
          environmentPath={props.currentEnvironmentOption.hdrPath}
        />
        <Bridge />
      </Suspense>
      {!props.lock && <Controls autoRotate={props.autorotate} />}
      {props.axis && (
        <axesHelper
          scale={[
            0.75 * props.sizeBounding.x,
            0.75 * props.sizeBounding.y,
            0.75 * props.sizeBounding.z
          ]}
        />
      )}
      {props.boundingBox && <boxHelper object={props.box} />}
    </Canvas>
  ) : null;

  return (
    <div className="edit-canvas">
      {loading ? <LoaderModel /> : canvasElement}
    </div>
  );
};

EditCanvas.propTypes = {
  bgEnvironment: PropTypes.bool.isRequired,
  bgSolid: PropTypes.bool.isRequired,
  bgColor: PropTypes.string.isRequired,
  fov: PropTypes.number.isRequired,
  far: PropTypes.number.isRequired,
  near: PropTypes.number.isRequired,
  sizeBounding: PropTypes.object.isRequired,
  onSetFov: PropTypes.func.isRequired,
  box: PropTypes.object,
  model: PropTypes.object,
  cameraMode: PropTypes.string.isRequired,
  lock: PropTypes.bool.isRequired,
  autorotate: PropTypes.bool.isRequired,
  axis: PropTypes.bool.isRequired,
  boundingBox: PropTypes.bool.isRequired,
  currentEnvironmentOption: PropTypes.object.isRequired,
  onSetSelectedMaterial: PropTypes.func.isRequired,
  mapEnvironment: PropTypes.bool.isRequired,
  ambientLight: PropTypes.bool.isRequired,
  directionalLight: PropTypes.bool.isRequired,
  hemisphereLight: PropTypes.bool.isRequired,
  ambientIntensity: PropTypes.number.isRequired,
  hemisphereIntensity: PropTypes.number.isRequired,
  directionalIntensity: PropTypes.number.isRequired,
  directionalLightColor: PropTypes.string.isRequired,
  hemisphereLightColor: PropTypes.string.isRequired,
  ambientLightColor: PropTypes.string.isRequired,
  onUpdateMaterial: PropTypes.func.isRequired,
  materials: PropTypes.object.isRequired,
  onSetConfigurationUnsaved: PropTypes.func.isRequired,
  onSetPartModel: PropTypes.func.isRequired,
  onSetPartFar: PropTypes.func.isRequired,
  onSetPartNear: PropTypes.func.isRequired,
  onSetPartSizeBounding: PropTypes.func.isRequired,
  onSetSelectedPart: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  bgEnvironment: state.environmentControls.bgEnvironment,
  bgSolid: state.environmentControls.bgSolid,
  bgColor: state.environmentControls.bgColor,
  model: state.currentModel.model,
  fov: state.currentModel.fov,
  far: state.currentModel.far,
  near: state.currentModel.near,
  sizeBounding: state.currentModel.sizeBounding,
  box: state.currentModel.box,
  cameraMode: state.cameraControls.cameraMode,
  lock: state.extraControls.lock,
  boundingBox: state.extraControls.boundingBox,
  axis: state.extraControls.axis,
  autorotate: state.extraControls.autorotate,
  currentEnvironmentOption: state.environmentControls.currentEnvironmentOption,
  selectedMaterial: state.appearanceControls.selectedMaterial,
  mapEnvironment: state.environmentControls.mapEnvironment,
  ambientLight: state.lightControls.ambientLight,
  directionalLight: state.lightControls.directionalLight,
  hemisphereLight: state.lightControls.hemisphereLight,
  ambientIntensity: state.lightControls.ambientLightIntensity,
  directionalIntensity: state.lightControls.directionalLightIntensity,
  hemisphereIntensity: state.lightControls.hemisphereLightIntensity,
  ambientLightColor: state.lightControls.ambientLightColor,
  directionalLightColor: state.lightControls.directionalLightColor,
  hemisphereLightColor: state.lightControls.hemisphereLightColor,
  materials: state.appearanceControls.materials
});

const mapDispatchToProps = dispatch => ({
  onSetFov: fov => dispatch(actions.setFov(fov)),
  onSetSelectedMaterial: material =>
    dispatch(actions.setSelectedMaterial(material)),
  onUpdateMaterial: (partName, material) =>
    dispatch(actions.updateMaterials(partName, material)),
  onSetConfigurationUnsaved: () => dispatch(actions.setConfigurationUnsaved()),
  onSetPartModel: partModel => dispatch(actions.setPartModel(partModel)),
  onSetPartFar: far => dispatch(actions.setPartFar(far)),
  onSetPartNear: near => dispatch(actions.setPartNear(near)),
  onSetPartSizeBounding: size => dispatch(actions.setPartSizeBounding(size)),
  onSetSelectedPart: part => dispatch(actions.setSelectedPart(part))
});

export default connect(mapStateToProps, mapDispatchToProps)(EditCanvas);
