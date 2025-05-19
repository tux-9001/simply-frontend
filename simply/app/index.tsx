import { Text, View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Button} from "react-native";

import React, {useRef, useEffect, useState} from 'react'
if (__DEV__) {
  require("./ReactotronConfig");
}
export default function Index() {
  //console.log("I'm alive!")
  const [email, onChangeEmail] = React.useState();
  const [username, onChangeUsername] = React.useState(); 
  const [password, onChangePassword] = React.useState();
  const [loginMode, setLoginMode] = React.useState(true);
  const [authToken, setAuthToken] = React.useState("!NOTOKEN") // holds the auth token
  const [errorMode, setErrorMode] = React.useState(false); // for controlling display of login error dialog 
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
  const sendAuthReq = () => {
    print("Lm: "+loginMode)
   {loginMode ? sendLoginRequest : sendRegisterRequest}
  }
  const sendRegisterRequest = () => {
   console.log("Ping")
   const reqHeaders = new Headers()
   reqHeaders.append("Content-Type", "application/json"); 
   //tell the server content type 
   const request = new Request("http://192.168.1.79:3000/register", {
    method: "POST", 
    body: JSON.stringify({email: email.toString(), username: username.toString(), password: password.toString()}),
    headers: reqHeaders, 
    credentials: "include"
    });
    console.log(request)
    fetch(request).then(result => {
      print("status: "+result.status)
      if (result.status == 201) {
        setErrorMode(false)
        switchLoginMode(); 
      }
      if (result.status != 201) {
        setErrorMode(true)
      }
    }).catch(error => {setErrorMode(true)})
  }
  const sendLoginRequest = () => {
   const reqHeaders = new Headers()
   reqHeaders.append("Content-Type", "application/json"); 
   //tell the server content type 
   const request = new Request("http://192.168.1.79:3000/login", {
    method: "POST", 
    body: JSON.stringify({email: email.toString(), password: password.toString()}),
    headers: reqHeaders, 
    credentials: "include"
    });
    console.log(request)
    fetch(request).then(result => {
      console.log("status: "+result.status)

      if (result.status == 201) {
        setErrorMode(false)
        return result.json();
      }
      if (result.status == 401 || result.status == 400) setErrorMode(true);
    }).then((data) => {
      console.log("Token: "+data.token)
      setAuthToken(data.token)
      print("Set token OK")
    }).catch(error => {console.log(error)}) // enable error banner if server throws back an error 

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
      onSubmitEditing={loginMode ? sendLoginRequest : sendRegisterRequest}

      secureTextEntry={true}>
      </TextInput>
      <View style={styles.initButtonContainer}>
      <Button title="Login" color={loginMode ? "black" : "grey"} onPress={switchLoginMode}/>
      <Button title="Register" color={loginMode ? "grey" : "black"} onPress={switchRegisterMode}/>
      </View>
      {errorMode ? <Text style={styles.errorContainer}> Error: Invalid Credentials </Text> : null}
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
  },
  errorContainer: {
    backgroundColor: "red",
    width: 280, 
    height: 40,
  }

}); 
