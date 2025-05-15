import { Text, View, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from "react-native";

import React from 'react'
export default function Index() {
  const [email, onChangeEmail] = React.useState();
  const [username, onChangeUsername] = React.useState(); 
  const [password, onChangePassword] = React.useState(); 
  return (
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
      onChangeText={onChangeEmail}
      placeholder="e-mail">
      </TextInput>
    <TextInput
      style={styles.loginInput}
      value={username}
      onChangeText={onChangeUsername}
      placeholder="username">
      </TextInput>
    <TextInput
      style={styles.loginInput}
      value={password}
      onChangeText={onChangePassword}
      placeholder="password"
      secureTextEntry={true}>
      </TextInput>
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
    margin: 20, 
    flexDirection : 'row',
    justifyContent: 'space-between'
  }

}); 
