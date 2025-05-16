import { Text, View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Button} from "react-native";

import React, {useRef, useEffect, useState} from 'react'
export default function Index() {
  const [email, onChangeEmail] = React.useState();
  const [username, onChangeUsername] = React.useState(); 
  const [password, onChangePassword] = React.useState();
  const [loginMode, setLoginMode] = React.useState(true);
  const [authToken, setAuthToken] = React.useState("!NOTOKEN") // holds the auth token 
  // for signing into the service 
  const emailInputRef = React.createRef<TextInput>(null); 
  const usernameInputRef = React.createRef<TextInput>(null); 
  const passwordInputRef = React.createRef<TextInput>(null); // references for focusing each input dialog 
  const switchLoginMode = () => {
   // switches to login mode 
   setLoginMode(true); 
  }
  const switchInputFromEmail = () => {
    //Switches the input field from email, dependent on the state of the login page 
     {!loginMode ? usernameInputRef.current?.focus() : passwordInputRef.current?.focus()}
  }
  const switchRegisterMode = () => {
    // switches to register mode 
    setLoginMode(false)
  }
  const sendRegisterRequest = () => {

  }
  const sendLoginRequest = () => {

  }
  if (authToken == "!NOTOKEN") return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        height: "100%"        
      }}
    >
    <Text style={styles.titleText}>Hello! Welcome to Simply :) </Text>
    <TextInput
      style={styles.loginInput}
      value={email}
      ref={emailInputRef}
      onChangeText={onChangeEmail}
      onSubmitEditing={switchInputFromEmail}
      placeholder="e-mail">
      </TextInput>
      {!loginMode ? <TextInput
      style={styles.loginInput}
      value={username}
      ref={usernameInputRef}
      onChangeText={onChangeUsername}
      onSubmitEditing={() => passwordInputRef.current?.focus()}
      placeholder="username">
      </TextInput> : null}
    <TextInput
      style={styles.loginInput}
      value={password}
      ref={passwordInputRef}
      onChangeText={onChangePassword}
      placeholder="password"
      onSubmitEditing({loginMode ? sendLoginRequest : sendRegisterRequest})
      secureTextEntry={true}>
      </TextInput>
      <View style={styles.initButtonContainer}>
      <Button title="Login" color={loginMode ? "black" : "grey"} onPress={switchLoginMode}/>
      <Button title="Register" color={loginMode ? "grey" : "black"} onPress={switchRegisterMode}/>
      </View> 
    </KeyboardAvoidingView>

  );
}

const styles = StyleSheet.create({
  titleText: {
    fontSize: 20, 
    fontWeight: 'bold'
  },
  loginInput: {
    height: 40,
    margin: 12,
    width: 280,
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
  },
  initButtonContainer: {
    
    margin: 100, 
    flexDirection : 'row',
    justifyContent: 'space-between',
  }

}); 
