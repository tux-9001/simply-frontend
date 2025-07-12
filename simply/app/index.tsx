import { Text, View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Button, Pressable, Image} from "react-native";
import { useFonts } from 'expo-font'; 
import React, {useRef, useEffect, useState} from 'react'
import Mainview from './mainview.tsx'
import * as SecureStore from 'expo-secure-store';

if (__DEV__) {
  require("./ReactotronConfig");
}
export default function Index() {
  // This is the main entry point of the app, it handles the login and registration process
  // and then passes the auth token to the main view of the app.
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
  useEffect(() => {
    // on mount, check if the user is already logged in
    const getToken = async () => {
      let result = await SecureStore.getItemAsync("simply_auth_token");
      if (result) {
        // if the token is found, set it as the auth token
        setAuthToken(result);
      } else {
        // if no token is found, set the auth token to "!NOTOKEN"
        setAuthToken("!NOTOKEN");
      }
    }
    getToken(); // call the function to get the token
    // check if the user is logged in, if not, set the auth token to "!NOTOKEN"
    // this will trigger the login screen to be displayed
         
  }, []); 
  function logOut() {
    //function to log out, called when going back to unauthenticated state 
    setToken("!NOTOKEN"); 
  }
  const [loaded, error] = useFonts({
    'DepartureMono': require('../assets/fonts/DepartureMonoNerdFont-Regular.otf')
  });
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
    //print("Lm: "+loginMode)
   {loginMode ? sendLoginRequest : sendRegisterRequest}
  }
  const sendRegisterRequest = () => {
   console.log("Ping")
   const reqHeaders = new Headers()
   reqHeaders.append("Content-Type", "application/json"); 
   //tell the server content type 
   const request = new Request("http://192.168.1.26:3000/register", {
    method: "POST", 
    body: JSON.stringify({email: email.toString(), username: username.toString(), password: password.toString()}),
    headers: reqHeaders, 
    credentials: "include"
    });
    console.log(request)
    fetch(request).then((result) => {
     // print("status: "+result.status)
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
   const reqHeaders = new Headers(); 
   reqHeaders.append("Content-Type", "application/json"); 
   //tell the server content type 
   const request = new Request("http://192.168.1.26:3000/login", {
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
    }).then( async (data) => {
      console.log("Token: "+data.token)
      await SecureStore.setItemAsync("simply_auth_token", data.token); // store the token in secure storage
      setAuthToken(data.token)
      //print("Set token OK")
    }).catch(error => {setErrorMode(true)}) // enable error banner if server throws back an error 

  }
  // if no authtoken return login screen 
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
    <Text style={styles.titleText}>Hello! Welcome to Simply :)   </Text>
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
  else return(
    <Mainview props={{authToken: authToken, deAuthFunc: logOut}}/>)  
}

const styles = StyleSheet.create({
  titleText: {
    fontSize: 17, 
    fontFamily: 'DepartureMono',
    textBreakStrategy: 'simple',
    letterSpacing: -0.4,
    height: 20,
    width: 300
  },
  loginInput: {
    height: 40,
    margin: 12,
    width: 280,
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    fontFamily: 'DepartureMono'
  },
  initButtonContainer: {
    margin: 100, 
    flexDirection : 'row',
    justifyContent: 'space-between',
    fontFamily: 'DepartureMono',
  },
  errorContainer: {
    backgroundColor: "red",
    width: 280, 
    height: 40,
    fontFamily: 'DepartureMono'
  }

});
