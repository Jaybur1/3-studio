import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  Container,
  MenuItem,
  Select,
  Paper,
  Snackbar,
  Button,
  Dialog,
  DialogActions,
  DialogTitle
} from "@material-ui/core";
import DeleteSweepIcon from "@material-ui/icons/DeleteSweep";
import VpnKeyIcon from "@material-ui/icons/VpnKey";

import { DropzoneArea } from "material-ui-dropzone";

import Particles from "react-particles-js";
import SingleField from "./SingleField/SingleField";
import Alert from "../UI/Alert/Alert";

import { useAuth0 } from "../../react-auth0-spa";
import { availableThemes } from "../../store/reducers/reducersHelpers/themesHelpers";
import * as actions from "../../store/actions/index";
import backendAxios from "../../axiosInstances/backendAxios";

import {
  savePictureToCloud,
  updateProfilePicture
} from "./UpdateProfilePictureHelper";

import "./ProfilePage.scss";

const ProfilePage = props => {
  const { user, logout } = useAuth0();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(false);
  const [nickname, setNickname] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("");
  const [disabled] = useState(!user.sub.includes("auth0"));
  const [nameField, setNameField] = useState(user.name);
  const [nicknameField, setNicknameField] = useState(user.nickname);
  // For deleting account and resetting password
  const [open, setOpen] = useState(false);
  // For opening profile picture change modal
  const [openPictureChanger, setOpenPictureChanger] = useState(false);
  // For opening and closing profile picture dialog
  const [openDialog, setOpenDialog] = useState(false);
  // used to change profile picture
  const [picture, setPicture] = useState([]);
  // currrent picture
  const [profilePicture, setProfilePicture] = useState(user.picture);

  // ! Resets
  // General resets
  props.onModeSelect("EDIT");

  // Media resets
  props.onResetMediaState();
  props.onResetMediaControls();
  // !

  const themes = availableThemes.map(theme => (
    <MenuItem key={theme.name} value={theme.name}>
      {theme.name}
    </MenuItem>
  ));

  const changeTheme = theme => {
    backendAxios
      .put("/api/themes", {
        theme,
        userId: user.sub
      })
      .then(() => {
        props.onSetTheme(theme);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const deleteAccount = () => {
    backendAxios
      .delete("/api/users", {
        data: {
          userId: user.sub
        }
      })
      .then(() => {
        if (process.env.NODE_ENV === "development") {
          logout();
        } else {
          logout({ returnTo: "https://3-studio.netlify.app/" });
        }
      })
      .catch(error => {
        console.log(error);
        setMessage("Could not delete account!");
        setSeverity("error");
        setOpen(true);
        setConfirmDelete(false);
      });
  };

  // Only for auth0-authenticated users (not fb and gmail)
  const resetPassword = () => {
    backendAxios
      .post("/api/users", {
        email: user.email
      })
      .then(() => {
        setMessage(
          "Please check your email for instructions on how to reset your password."
        );
        setSeverity("success");
        setOpen(true);
      })
      .catch(error => {
        setMessage("Could not reset password!");
        setSeverity("error");
        setOpen(true);
        console.log(error);
      });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChangePictureButton = () => {
    setOpenPictureChanger(true);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setPicture([]);
  };

  const handleDrop = file => {
    setPicture(file);
  };

  const handleDelete = () => {
    setPicture([]);
  };

  const handlePictureUpdate = () => {
    if (picture.length !== 1) {
      setMessage("Please upload a picture.");
      setSeverity("error");
      setOpen(true);
      setOpenPictureChanger(false);
    } else {
      savePictureToCloud(picture).then(pictureLink => {
        updateProfilePicture({
          userId: user.sub,
          picture: pictureLink.data.url
        })
          .then(() => {
            setProfilePicture(pictureLink.data.url);
            setMessage("Successfully changed profile picture!");
            setSeverity("success");
            setOpen(true);
            setOpenPictureChanger(false);
            props.onSetProfileImage(pictureLink.data.url);
          })
          .catch(err => {
            console.log(err);
            setMessage("Could not update profile picture!");
            setSeverity("error");
            setOpen(true);
            setOpenPictureChanger(false);
          });
      });
    }
  };

  const page = (
    <Container maxWidth="md" classes={{ root: "container-padding" }}>
      <div className="profile-page">
        <Particles
          className="background"
          width="100vw"
          height="100vh"
          params={{
            background: {
              color: "#171717"
            },
            particles: {
              number: {
                value: 50
              },
              size: {
                value: 3
              },
              color: {
                value: {
                  h: Number(props.currentThemeDetailed.hslColor.topFirst),
                  s: Number(
                    props.currentThemeDetailed.hslColor.topSecond.slice(
                      0,
                      props.currentThemeDetailed.hslColor.topSecond.length - 1
                    )
                  ),
                  l: Number(
                    props.currentThemeDetailed.hslColor.topThird.slice(
                      0,
                      props.currentThemeDetailed.hslColor.topThird.length - 1
                    )
                  )
                }
              },
              lineLinked: {
                color: {
                  value: {
                    h: Number(props.currentThemeDetailed.hslColor.bottomFirst),
                    s: Number(
                      props.currentThemeDetailed.hslColor.bottomSecond.slice(
                        0,
                        props.currentThemeDetailed.hslColor.bottomSecond
                          .length - 1
                      )
                    ),
                    l: Number(
                      props.currentThemeDetailed.hslColor.bottomThird.slice(
                        0,
                        props.currentThemeDetailed.hslColor.bottomThird.length -
                          1
                      )
                    )
                  }
                }
              }
            },
            interactivity: {
              events: {
                onhover: {
                  enable: true,
                  mode: "repulse"
                }
              }
            }
          }}
        />
        <div className="top-section">
          <div className="picture-container">
            <img
              className="profile-picture"
              src={profilePicture}
              alt="profile picture"
            />
            <Button
              className="upload-pic-button"
              onClick={handleChangePictureButton}
            >
              Change profile picture
            </Button>
          </div>
          <div className="theme-selector-area">
            <p className="title">Theme</p>
            <Select
              labelId="theme"
              id="theme"
              value={props.currentTheme}
              onChange={e => {
                changeTheme(e.target.value);
              }}
              label="Theme"
            >
              {themes}
            </Select>
          </div>
        </div>
        <div className="middle-section">
          <Paper className="user-info">
            <SingleField
              setMessage={setMessage}
              setSeverity={setSeverity}
              setOpen={setOpen}
              field="name"
              editValue={name}
              setEditValue={setName}
              value={nameField}
              setValue={setNameField}
              disabled={disabled}
            />
            <SingleField
              setMessage={setMessage}
              setSeverity={setSeverity}
              setOpen={setOpen}
              field="nickname"
              editValue={nickname}
              setEditValue={setNickname}
              value={nicknameField}
              setValue={setNicknameField}
              disabled={disabled}
            />
          </Paper>
        </div>
        <div className="bottom-section">
          <span className="gradient-button">
            <Button
              classes={{ root: "containedSecondary" }}
              variant="contained"
              disabled={disabled}
              color="secondary"
              startIcon={<VpnKeyIcon />}
              onClick={() => {
                if (!disabled) {
                  resetPassword();
                }
              }}
            >
              Reset Password
            </Button>
          </span>
          <span className="delete-account-button">
            <Button
              classes={{ root: "containedSecondary" }}
              variant="contained"
              color="secondary"
              startIcon={<DeleteSweepIcon />}
              onClick={() => setConfirmDelete(true)}
            >
              Delete Account
            </Button>
          </span>
        </div>
      </div>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity}>
          {message}
        </Alert>
      </Snackbar>
      <Dialog
        className="delete-account-dialog"
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to permanently delete your account?
        </DialogTitle>
        <DialogActions>
          <Button
            classes={{ root: "cancel-delete-account" }}
            onClick={() => setConfirmDelete(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            classes={{ root: "confirm-delete-account" }}
            onClick={deleteAccount}
            color="primary"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      {openPictureChanger && (
        <Dialog
          classes={{ root: "upload-picture-dialog" }}
          open={openDialog}
          onClose={handleDialogClose}
          aria-labelledby="Update picture"
        >
          <DropzoneArea
            dropzoneClass="upload-picture-drop"
            dropzoneText=""
            acceptedFiles={["image/jpeg", "image/png", "image/bmp"]}
            maxFileSize={10000000}
            filesLimit={1}
            onDrop={e => handleDrop(e)}
            onDelete={handleDelete}
          />

          <DialogActions>
            <Button
              className="cancel-upload-picture"
              onClick={handleDialogClose}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              className="confirm-upload-picture"
              onClick={handlePictureUpdate}
              color="primary"
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <svg>
        <linearGradient id="gradient-vertical" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gradient-top)" />
          <stop offset="100%" stopColor="var(--gradient-bottom)" />
        </linearGradient>
      </svg>
    </Container>
  );

  return page;
};

ProfilePage.propTypes = {
  currentTheme: PropTypes.string.isRequired,
  onSetTheme: PropTypes.func.isRequired,
  onModeSelect: PropTypes.func.isRequired,
  onResetMediaState: PropTypes.func.isRequired,
  onResetMediaControls: PropTypes.func.isRequired,
  onSetProfileImage: PropTypes.func.isRequired,
  currentThemeDetailed: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  currentTheme: state.themes.currentTheme,
  currentThemeDetailed: state.themes.currentThemeDetailed
});

const mapDispatchToProps = dispatch => ({
  onSetTheme: theme => dispatch(actions.setTheme(theme)),
  onModeSelect: mode => dispatch(actions.modeSelect(mode)),
  onResetMediaState: () => dispatch(actions.resetMediaState()),
  onResetMediaControls: () => dispatch(actions.resetMediaControls()),
  onSetProfileImage: image => dispatch(actions.setProfileImage(image))
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
