import React, { useRef } from "react";
import PropTypes from "prop-types";
import lo from "lodash";
import { connect } from "react-redux";

const UserModel = (props) => {
  const { model } = props;
  const currentModel = useRef();
  // useFrame(({ gl, scene, camera }) => {
  //   gl.render(scene, camera);
  //   reeef.current.rotation.y += 0.2;
  // });
  // console.log("model", userModel);
  const render = model ? (
    <primitive
      object={model}
      ref={currentModel}
      dispose={null}
      castshadow
      rotation={[0, 0, 0]}
    />
  ) : null;
  return <>{render}</>;
};

UserModel.propTypes = {
  model: PropTypes.object.isRequired,
};

export default UserModel;