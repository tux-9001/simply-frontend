
import { Text, View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Button, Pressable, Image} from "react-native";

import React, {useRef, useEffect, useState} from 'react'
if (__DEV__) {
  require("./ReactotronConfig");
}
function MainFeed ({props}) {
  // main friend feed function 
}
function CreatePostcardInterface ({props}) {
  // interface to create a postcard 
}
function ScrapbookInterface ({props}) {
  // interface to view a scrapbook - a user's collection of posts 
}
function StampCollection ({props}) {
  // interface to view a users stamp collection 
}
function UserProfile ({props}) {
  // Function to view a user's profile 
}
function StampStore ({props}) {
  // Function to view the stamp store 
}
//TODO: Implement the interface for this func
export default function Mainview ({props}) {
  // const ident = props.token; // The JWT token used for auth, sent with each request
   const [viewMode, setViewMode] = useState("mainfeed")
   const MainFeedPressed = () => {

      setViewMode("mainfeed")
   }
   const CreatePostcardPressed = () => {

      setViewMode("createpostcard")
   }
   const StampCollectionPressed = () => {

      setViewMode("stampcollection")
   }
   const ScrapbookPressed = () => {
     
      setViewMode("scrapbook")
   }
   return(
    <View style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column-reverse",
        height: "100%",
        backgroundColor: 'white'

      }}> 
     <View style={styles.bottomCtrlBar}>
      <View style={viewMode === "mainfeed" ? [styles.bottomCtrlPressable, styles.pressableLit] : [styles.bottomCtrlPressable] }>
      <Pressable onPress={MainFeedPressed}>
        <Image style={styles.ctlBarImg} source={require('../assets/images/mainfeed.png')} /> 
      </Pressable>
      </View> 
      <View style={viewMode === "createpostcard" ? [styles.bottomCtrlPressable, styles.pressableLit] : [styles.bottomCtrlPressable] }>
       <Pressable onPress={CreatePostcardPressed}>
        <Image style={styles.ctlBarImg} source={require('../assets/images/createpostcard.png')} /> 
      </Pressable>     
      </View> 
      <View style={viewMode === "stampcollection" ? [styles.bottomCtrlPressable, styles.pressableLit] : [styles.bottomCtrlPressable] }> 
      <Pressable onPress={StampCollectionPressed}>
          <Image style={styles.ctlBarImg} source={require('../assets/images/stampcollection.png')} /> 
      </Pressable>
      </View> 
      <View style={viewMode === "scrapbook" ? [styles.bottomCtrlPressable, styles.pressableLit] : [styles.bottomCtrlPressable] }>
      <Pressable onPress={ScrapbookPressed}>
           <Image style={styles.ctlBarImg} source={require('../assets/images/myscrapbook.png')} /> 
      </Pressable>     
      </View> 
     </View>
     </View>
   )
}
//TODO: Optimize and pretty up the bottom bar
const styles = StyleSheet.create({
  titleText: {
    fontSize: 20, 
    fontFamily: 'DepartureMono'
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
  },
  // * * * * * * 
  bottomCtrlBar: {
    backgroundColor: 'grey', 
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start', 
    alignItems: 'center',
    width: "100%",
    height: 100
  }, 
  bottomCtrlPressable: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: "25%",
    height: 100,
    backgroundColor: 'grey'
  },
  pressableLit: {
    backgroundColor: "black"
  },
  ctlBarImg: {
    width: 72,
    height: 72
  }

}); 
