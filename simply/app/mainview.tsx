
import { Text, View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Button, Pressable, Image, FlatList} from "react-native";

import React, {useRef, useEffect, useState} from 'react'
if (__DEV__) {
  require("./ReactotronConfig");
}
function MainFeed ({props}) {
  // main friend feed function
  return(<Text>Hello</Text>)
}

function CreatePostcardInterface ({props}) {
  const username = "!ERROR"
  const [side, setSide] = useState(false); // true for backside of card
  const [stamp, setStamp] = useState("!NOSTAMP");
  const [stampPickerMode, setStampPickerMode] = useState(false);
  const [stampNames, setStampNames] = useState([]); 
  const [stampLinks, setStampLinks] = useState([]);
  const [authToken, setAuthToken] = useState(props.authToken);
  console.log("imglink "+stampLinks)
  if (!stampPickerMode) return(<KeyboardAvoidingView style={styles.postCardView}>
   <Pressable onPress={() => {setStampPickerMode(true)}}>
    <View style={{
      flex: 0,
      height: "45%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      backgroundColor: "#dbdbdb"
    }}>
    <Text style={{marginLeft:"2%", fontFamily: "DepartureMono", fontSize: 20}}>{props.username}</Text>
    <Text style={{fontFamily: "DepartureMono", fontSize: 10, color: "grey"}}>Press to change stamp.</Text>
  
     <Image source={{ uri: "https://res.cloudinary.com/dksba0x3e/image/upload/v1748049719/addStamp_xpogun.png"}} style={styles.stampStyle}/>

    </View>
    </Pressable>
  </KeyboardAvoidingView>)
  else {
    const reqHeaders = {"Content-Type": "application/json", "Authorization": authToken}
    const request = new Request("http://192.168.1.79:3000/getStampBook", {
      method: "GET",
      headers: reqHeaders
    });
    console.log("namearray" + stampNames)
    console.log("linkarray" + stampLinks)
 if (stampNames.length < 1) fetch(request).then((response) => {
      return response.text(); 
    }).then((text) => {
      const rJSON = JSON.parse(text); 
      setStampLinks(rJSON.imgurls); 
      setStampNames(rJSON.names);
    }).catch((error) => {console.log(error)});
    return(
      <KeyboardAvoidingView style={styles.postCardView}>
        <FlatList style={{height: "100%", width: "100%"}}>
          {stampLinks.map((link, index) => {
            console.log(link)
            return(

            <Image source={{uri: link}} style={styles.stampStyle}/>
       
            )
          })}
        </FlatList>
      </KeyboardAvoidingView> 
    )
  }
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
  const [username, setUserName] = useState("!error");
  const [uNameLoaded, setUnameLoaded] = useState(false);
  const [authToken, setAuthToken] = useState(props.authToken); 
  console.log(props.authToken)
  const fetchUsername = () => {
    const reqHeaders = {"Content-Type": "application/json", "Authorization": authToken}
    const req = new Request("http://192.168.1.79:3000/user", {
      method: "GET",
      headers: reqHeaders
    });
  fetch(req).then((response) => {
      //console.log("Resp:"+response.text());
      return response.text();
    }).then((text) => {
      const rJSON = JSON.parse(text);
      console.log("Text: "+text);
      setUserName(rJSON.username) 
    }).catch((error) => {console.log(error)});
  }

  // const ident = props.token; // The JWT token used for auth, sent with each request
   const [viewMode, setViewMode] = useState("mainfeed")
   const MainFeedPressed = () => {
      setViewMode("mainfeed")
   }
   const CreatePostcardPressed = () => {
     fetchUsername()
    console.log("Create postcard")
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
     {/*Below: Bottom control bar logic */}
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
     {/*Spaghetti-ish - TODO: pretty this up */}
     <KeyboardAvoidingView style={{
       flex: 1,
       justifyContent: "center",
       alignItems: "center",
       height: "90%",
       width: "100%",
       backgroundColor: "#c1c4c9"

     }}>
        {viewMode === "createpostcard" ? <CreatePostcardInterface props={{username: username, authToken: authToken}}/> : null}
        {viewMode === "mainfeed" ? <MainFeed/> : null}
        {viewMode === "stampcollection" ? <StampCollection/> : null}
        {viewMode === "scrapbook" ? <ScrapbookInterface/> : null}
     </KeyboardAvoidingView> 
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
    height: "10%"
  }, 
  bottomCtrlPressable: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: "25%",
    height: "100%",
    backgroundColor: 'grey'
  },
  pressableLit: {
    backgroundColor: "black"
  },
  ctlBarImg: {
    width: 72,
    height: 72
  },
  postCardView: {
    flex: 0, 
    height: "80%",
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10
  },
  stampStyle: {
    height: "90%",
    width: "25%",
    resizeMode: "stretch"
  }

}); 
