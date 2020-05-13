import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  Container,
  FormControl,
  MenuItem,
  InputLabel,
  Select
} from "@material-ui/core";
import UserInfoTable from "./UserInfoTable/UserInfoTable";

import DeleteAccountButton from "./DeleteAccountButton/DeleteAccountButton";

import ResetPasswordButton from "./ResetPasswordButton/ResetPasswordButton";

import { useAuth0 } from "../../react-auth0-spa";
import { availableThemes } from "../../store/reducers/reducersHelpers/themesHelpers";
import * as actions from "../../store/actions/index";
import backendAxios from "../../axiosInstances/backendAxios";

import "./ProfilePage.scss";

const ProfilePage = props => {
  const { user } = useAuth0();

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
      .then(resp => console.log(resp))
      .catch(error => console.log(error));
  };

  // Only for auth0-authenticated users (not fb and gmail)
  const resetPassword = () => {
    backendAxios
      .post("/api/users", {
        email: user.email
      })
      .then(resp => console.log(resp))
      .catch(error => console.log(error));
  };

  return (
    <div className="profile-page">
      <Container maxWidth="xl" classes={{ root: "container-padding" }}>
        <h1>Profile Page</h1>
        <img src={user.picture} alt="Profile" />
        <h2>Testing id (sub): {user.sub}</h2>
        <h2>Name of user: {user.name}</h2>
        <p>Email of user: {user.email}</p>

        <FormControl variant="outlined">
          <InputLabel id="demo-simple-select-outlined-label">Theme</InputLabel>
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
        </FormControl>
      </Container>
      <UserInfoTable />
      <DeleteAccountButton
        onClick={e => {
          if (window.confirm("Delete Account?")) {
            deleteAccount();
          }
        }}
      />
      {user.sub.includes("auth0") && (
        <ResetPasswordButton onClick={resetPassword} />
      )}
    </div>
  );
};

ProfilePage.propTypes = {
  currentTheme: PropTypes.string.isRequired,
  onSetTheme: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  currentTheme: state.themes.currentTheme
});

const mapDispatchToProps = dispatch => ({
  onSetTheme: theme => dispatch(actions.setTheme(theme))
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
