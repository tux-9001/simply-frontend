import { Text, View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Button, Pressable, Image, FlatList} from "react-native";
import * as ImagePicker from 'expo-image-picker'
import React, {useRef, useEffect, useState} from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationIndependentTree, useLinkProps } from "@react-navigation/native";
import { routePatternToRegex } from "expo-router/build/fork/getStateFromPath-forks";
import { Route } from "expo-router/build/Route";
import { useFocusEffect } from "expo-router";

const Tab = createBottomTabNavigator();


if (__DEV__) {
  require("./ReactotronConfig");
}
function MainFeed ({route, navigation}) {
  // main post feed function, displays all posts in a feed-like manner
  const [posts, setPosts] = useState([]); // array of posts
  const [authToken, setAuthToken] = useState(route.params.authToken); // auth token used for liking/unliking posts
  const [postsLoaded, setPostsLoaded] = useState(false); // boolean to check if posts have been loaded 
  const [currentPostIndex, setCurrentPostIndex] = useState(0); // index of the current post being displayed
  useFocusEffect(
    React.useCallback(() => {
      console.log("Focused on main feed");
      setPostsLoaded(false);
    }, [])); // reset postsLoaded on focus - this ensures posts most updated
  useEffect(() => {
    if (!postsLoaded) {
      const reqHeaders = {"Content-Type": "application/json", "Authorization": authToken}
      const request = new Request("http://192.168.1.26:3000/getMainfeed", {
        method: "GET",
        headers: reqHeaders
      })
    if (!postsLoaded) {
      const reqHeaders = {"Content-Type": "application/json", "Authorization": authToken}
      const request = new Request("http://192.168.1.26:3000/getMainfeed", {
        method: "GET",
        headers: reqHeaders
      });
      fetch(request)
        .then((response) => response.json())
        .then((data) => {
          setPosts(data);
          setPostsLoaded(true);
          console.log("Posts loaded: " + data.length); 
        })
        .catch((error) => {console.log(error)});
    }
  }}, [postsLoaded, authToken, route.params.authToken, route.params.username, currentPostIndex]);
  return(<KeyboardAvoidingView>
    <View style={{flex: 0, flexDirection: "row", width: 350, height: "10%", alignItems: "center", marginBottom: -70, marginTop: 10}}> 
      <Text style={{fontFamily: "DepartureMono", marginLeft: 10}}>Main Feed</Text>
      <Pressable onPress={() => {navigation.navigate('CreatePostcard', {authToken: authToken, username: route.params.username})}}>
        <Text style={{fontFamily: "DepartureMono", color: "blue", marginLeft: 10}} > create postcard </Text>
      </Pressable>
    </View>
  <View style={{marginLeft: -10}}>
    <DisplayPost props={{
        frontText: posts.length > 0 ? posts[currentPostIndex].frontText : "",
        backText: posts.length > 0 ? posts[currentPostIndex].backText : "",
        imageURL: posts.length > 0 ? posts[currentPostIndex].imageURL : "!NOIMG",
        stampImgUrl: posts.length > 0 ? posts[currentPostIndex].stampImgUrl : "!NOSTAMP",
        username: route.params.username,
        id: posts.length > 0 ? posts[currentPostIndex]._id : "",
        isLiked: false,
        authToken: authToken
      }}/>
      </View>
            <View style={{flex: 0, flexDirection: "row", width: 350, height: "10%", alignItems: "center", marginLeft: 40}}> 
        {currentPostIndex > 0 ? <Pressable onPress={() => setCurrentPostIndex(currentPostIndex - 1)}>
           <Text style={{fontFamily: "DepartureMono", marginLeft: -10}}> ← previous post</Text></Pressable>
           :<Text style={{fontFamily: "DepartureMono", marginLeft: -20}}> no previous posts</Text>}
        {currentPostIndex < posts.length - 1 ? <Pressable onPress={() => setCurrentPostIndex(currentPostIndex + 1)}> 
          <Text style={{fontFamily: "DepartureMono", marginLeft: 10}}>next post →</Text></Pressable>
          :<Text style={{fontFamily: "DepartureMono", marginLeft: 20}}> no more posts</Text>} 
      </View>
  </KeyboardAvoidingView>)
}

function CreatePostcardInterface ({ route, navigation }) {
  const username = "!ERROR"
  const [side, setSide] = useState(false); // true for backside of card
  const [stamp, setStamp] = useState("!NOSTAMP");
  const [stampImg, setStampImg] = useState("!NOIMG");
  const [stampPickerMode, setStampPickerMode] = useState(false);
  const [stamps, setStamps] = useState([]); 
  const authToken = route.params.authToken; // auth token used for posting
  const [frontText, setFrontText] = useState(""); 
  const [backText, setBackText] = useState("");
  const [postCompleted, setPostCompleted] = useState(false);
  //const [frontImgIncluded, setFrontImgIncluded] = useState(false); //controls whether or not an image is included on the front of the postcard 
  const [postImage, setPostImage] = useState("!NOIMG");
  const accessMainFeed = () => {
    navigation.navigate('MainFeed');
  }
  const submitPost = () => { 
    const reqHeaders = {"Content-Type": "application/json", "Authorization": authToken}; 
    const request = new Request("http://192.168.1.26:3000/newPostCard", {
      method: "POST",
      headers: reqHeaders,
      body: JSON.stringify({
        frontText: frontText,
        backText: backText, 
        image: postImage,
        stamp: stamp 
      })
    })
    if (stamp != "!NOSTAMP" && frontText != "") fetch(request).then((result) => {console.log("status: "+result.status); 
                        if (result.status == 201) navigation.navigate('MainFeed');}) 
    else console.log("Error - frontText or stamp empty!") // to navigate to another component wrap navigate call in event handler 
  }

  //below: default state of the component, first side and not in stamp picker mode
  if (!stampPickerMode && !side) return(<KeyboardAvoidingView style={styles.postCardView}     behavior={'padding'}>
   <Pressable  onPress={() => {setStampPickerMode(true)}}>
    <View style={{
      flex: 0,
      height: 100,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      backgroundColor: "#dbdbdb",
     //percentage may cause weird gaps
    }}> 
    <Text style={{marginLeft:"2%", fontFamily: "DepartureMono", fontSize: 20}}>{route.params.username}</Text>
    <Text style={{fontFamily: "DepartureMono", fontSize: 10, color: "grey"}}> Press to change stamp.</Text>
     <Image source={stamp == "!NOSTAMP" ? { uri: "https://res.cloudinary.com/dksba0x3e/image/upload/v1748049719/addStamp_xpogun.png"} : {uri: stampImg}} style={styles.stampStyle}/>
    </View>
    </Pressable>
    {postImage == "!NOIMG" ? null : <Image source={{uri: `data:image/jpeg;base64,${postImage}`}} style={{width: "100%", height: "50%"}}/>} 
  <TextInput
style={postImage == "!NOIMG" ? {width: "100%", height: "70%", backgroundColor: "white",  fontFamily: "DepartureMono"} : {width: "100%", height: "20%", backgroundColor: "white",  fontFamily: "DepartureMono"}}

    onChangeText={setFrontText}
    value={frontText}
    textAlignVertical="top"
    multiline={true}/>
    <View style={{flex:0, flexDirection: "row", width: "100%", height: "10%", backgroundColor: "white", alignItems: "center"}}>
      <Pressable onPress={submitPost}>
      <Text style={{fontFamily: "DepartureMono", color: "cyan"}}>post</Text>
      </Pressable>
      <Pressable onPress={ async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4,3],
          quality:.5,
          base64: true
        });
        //console.log(result.assets[0].base64);
        if (!result.cancelled) setPostImage(result.assets[0].base64);
        console.log(postImage);
      }}>
        <Text style={{fontFamily: "DepartureMono", color:"#dbdbdb", marginLeft: 10}}>add image</Text>
      </Pressable>
      <Pressable onPress={() => {setSide(true)}}>
      <Text style={{fontFamily: "DepartureMono", color: "#dbdbdb" }}> edit other side --></Text>
      </Pressable>
    </View>
  </KeyboardAvoidingView>)
  //backside display below 
  if (!stampPickerMode && side) return(
    <KeyboardAvoidingView style={styles.postCardView} behavior={'padding'}>
     <TextInput
    style={{width: "100%", height: "83.5%", backgroundColor: "white",  fontFamily: "DepartureMono", marginTop: 20}}
      onChangeText={setBackText}
      value={backText}
      textAlignVertical="top"
      multiline={true}/>    
    <View style={{flex:0, flexDirection: "row", width: "100%", height: "10%", backgroundColor: "white", alignItems: "center"}}>
      <Pressable onPress={submitPost}>
        <Text style={{fontFamily: "DepartureMono", color: "cyan"}}>post</Text>
      </Pressable>

      <Pressable onPress={() => {setSide(false)}}>
        <Text style={{fontFamily: "DepartureMono", color: "#dbdbdb", marginLeft: 5}}> edit other side --></Text>
      </Pressable>
    </View>

    </KeyboardAvoidingView>
  )
  //handler for stamp picker below 
  else {
    const reqHeaders = {"Content-Type": "application/json", "Authorization": authToken}
    const request = new Request("http://192.168.1.26:3000/getStampBook", {
      method: "GET",
      headers: reqHeaders
    });
    //console.log("namearray" + stampNames)
    //console.log("linkarray" + stampLinks)
    
 if (stamps.length < 1) fetch(request).then((response) => {
      return response.text(); 
    }).then((text) => {
      console.log(text)
      const rJSON = JSON.parse(text); 
      setStamps(rJSON)
    }).catch((error) => {console.log(error)});
    return(
      <KeyboardAvoidingView style={styles.postCardView}>
        <FlatList
          data={stamps}
          renderItem={({item}) =>
            <View style={{ height: 250, width: "200%", flex: 0, justifyContent: "center"}}>
              <Text style={{fontFamily: 'DepartureMono'}}>{item.prettyName}</Text>
              <Pressable onPress={() => {setStamp(item.prettyName); setStampImg(item.imgLink); console.log("stamp:"+stamp); setStampPickerMode(false)}}>
                <Image source={{ uri: item.imgLink}} style={styles.stampStyle}/>
              </Pressable>
            </View>}
          keyExtractor={item => item.prettyName}
        />
      </KeyboardAvoidingView> 
    )
  }
}
function DisplayPost({props}) {
  const stampImgUrl = props.stampImgUrl; 
  const frontText = props.frontText; 
  const backText = props.backText; 
  const imageURL = props.imageURL; 
  const username = props.username;
  const authToken = props.authToken; // auth token used for liking/unliking posts
  const id = props.id; // id of the post, used for liking 
  const [isLiked, setLiked] = React.useState(props.isLiked); // boolean indicating if the post is liked by the user
  const [side, setSide] = useState(false); // true for backside of card
  console.log("Stamp:" + stampImgUrl);
  if (imageURL == '!NOIMG') return(
    <View style={styles.postCardView}>
      <View style={{
      flex: 0,
      height: 100,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      backgroundColor: "#dbdbdb",
     //percentage may cause weird gaps
    }}> 
    <Text style={{marginLeft:"2%", fontFamily: "DepartureMono", fontSize: 20}}>{props.username}</Text>
    <Text style={{fontFamily: "DepartureMono", fontSize: 10, color: "grey"}}> This is a stamp. </Text>
     <Image source={{uri: stampImgUrl}} style={styles.stampStyle}/>
    </View>
    <Text style={{fontFamily: "DepartureMono", fontSize: 20, marginLeft: "2%", marginTop: 10, height: "70%"}}>{side ? backText : frontText}</Text>
    <View style={{flex: 0, flexDirection: "row", width: "100%", height: "10%", backgroundColor: "white", alignItems: "center"}}>
      <Pressable onPress={() => {setSide(!side)}}>
        <Text style={{fontFamily: "DepartureMono", color: "#dbdbdb" }}> view other side --> </Text>
      </Pressable>
      <Pressable onPress={() => {
        const reqHeaders = {"Content-Type": "application/json", "Authorization": authToken}
        const req = new Request(isLiked ? "http://192.168.1.26:3000/unlikePost" : "http://192.168.1.26:3000/likePost", {
          method: "POST",
          headers: reqHeaders,
          body: JSON.stringify({
            postId: id
          })
        });
        fetch(req).then((response) => {
          if (response.status == 201) {
            console.log("Post liked/unliked successfully");
            setLiked(!isLiked); // toggle the like state
          } else {
            console.log("Failed to like/unlike post");
            console.log(response.text);
          }
        }
        ).catch((error) => {console.log(error)        
      }); } }>
        <Text style={{fontFamily: "DepartureMono", color: "red", marginLeft: 50}}>{isLiked ? "unlike" : "like"}</Text>
      </Pressable>
      </View>
    </View> 
  )
  else return(
    <View style={styles.postCardView}>
      <View style={{
          flex: 0,
          height: 100,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          backgroundColor: "#dbdbdb",
     //percentage may cause weird gaps
         }}> 
        <Text style={{marginLeft:"2%", fontFamily: "DepartureMono", fontSize: 20}}>{props.username}</Text>
        <Text style={{fontFamily: "DepartureMono", fontSize: 10, color: "grey"}}> This post has an image!</Text>
        <Image source={{uri: stampImgUrl}} style={styles.stampStyle}/>
      </View>
      {!side ? <Image source={{uri: imageURL}} style={{width: "100%", height: 300}}/> : null}
      <Text style={!side ? {fontFamily: "DepartureMono", fontSize: 20, marginLeft: "2%", marginTop: 10, height: "25%"} : {fontFamily: "DepartureMono", fontSize: 20, marginLeft: "2%", marginTop: 10, height: "75%"}}>{side ? backText : frontText}</Text>
      <View style={{flex: 0, flexDirection: "row", width: "100%", height: "5%", backgroundColor: "white", alignItems: "center"}}>
        <Pressable onPress={() => {setSide(!side)}}>
          <Text style={{fontFamily: "DepartureMono", color: "#dbdbdb" }}> view other side --> </Text>
        </Pressable>
        <Pressable onPress={() => {
        const reqHeaders = {"Content-Type": "application/json", "Authorization": authToken}
        const req = new Request(isLiked ? "http://192.168.1.26:3000/unlikePost" : "http://192.168.1.26:3000/likePost", {
          method: "POST",
          headers: reqHeaders,
          body: JSON.stringify({
            postId: id
          })
        });
        fetch(req).then((response) => {
          if (response.status == 201) {
            console.log("Post liked/unliked successfully");
            setLiked(!isLiked); // toggle the like state
          } else {
            console.log("Failed to like/unlike post");
          }
        }
        ).catch((error) => {console.log(error)        
      }); } }>
        <Text style={{fontFamily: "DepartureMono", color: "red", marginLeft: 50}}>{isLiked ? "unlike" : "like"}</Text>
      </Pressable>
      </View>
    </View>
  ) // return correct formatting if no image 
  }
function ScrapbookInterface ({route, navigation}) {
  //TODO: Implement following (for not you) and viewing followers (when viewing your scrapbook)
  const [scrapbook, setScrapbook] = useState([]);
  const [authToken, setAuthToken] = useState(route.params.authToken);
  const [username, setUsername] = useState(route.params.username); // username of whose scrapbook to view
  const [yourUserName, setYourUserName] = useState(route.params.yourUserName); // your username, used for liking posts
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [scrapbookLoaded, setScrapbookLoaded] = useState(false); // boolean for controlling loading of scrapbook
  const [followingChecked, setFollowingChecked] = useState(false); // boolean to check if followers have been loaded
  const [viewMode, setViewMode] = useState("scrapbook"); // controls the view mode of the scrapbook interface
  const [followers, setFollowers] = useState([]); // array of followers, used for viewing followers
  // scrapbook is the main post-type interface 
  // stamps shows a users stamps 
  // 
  const [following, setFollowing] = useState(false); // boolean to check if you are following the user (if not you)
  // if scrapbook, scrapbook view mode (posts)
  console.log("Username: " + username);
  console.log("Your username: " + yourUserName);
  useFocusEffect(
   React.useCallback(() => {
    console.log("Focused on scrapbook interface");
    setScrapbookLoaded(false);
    setFollowingChecked(false);
    setCurrentPostIndex(0);
    setViewMode("scrapbook");
   }, [])); // reset state variables on focus - this ensures scrapbook most updated 
  useEffect(() => {
    if (!scrapbookLoaded) {
      const reqHeaders = {'Content-Type': "application/json", "Authorization": authToken, "usertoview": username}
      const req = new Request("http://192.168.1.26:3000/getScrapBook", {
        method: "GET",
        headers: reqHeaders,
      });
      fetch(req)
        .then((response) => response.json())
        .then((data) => {
          setScrapbook(data);
          setScrapbookLoaded(true);
          for (let index = 0; index < data.length; index++) {
            console.log("sbi:" + data[index].stampImgUrl);
          }
        })
        .catch((error) => console.log(error));
    }
    if (!followingChecked && username != yourUserName) {
      const reqHeaders = {'Content-Type': "application/json", "Authorization": authToken, "usertoview": username}
      const req = new Request("http://192.168.1.26/isFollowing", {
        method: "GET",
        headers: reqHeaders,
      });
      fetch(req)
        .then((response) => response.json())
        .then((data) => {if (data.isFollowing) {
          console.log("You are following " + username);
          setFollowingChecked(true);
          setFollowing(true);
        }})
      }
      if (!followingChecked && username == yourUserName) {
        console.log("getting your followers");
        const reqHeaders = {'Content-Type': "application/json", "Authorization": authToken}
        const req = new Request("http://192.168.1.26:3000/getFollowers", {
          method: "GET",
          headers: reqHeaders,
        });
        fetch(req)
          .then((response) => response.json())
          .then((data) => {
            console.log("Followers: " + data);
            setFollowers(data);}).catch((error) => console.log(error));  
        setFollowingChecked(true);
      }
  }, [scrapbookLoaded, authToken, username, setFollowingChecked, setFollowing, yourUserName]);


  if (viewMode == "scrapbook") return( 
     <KeyboardAvoidingView>
      <View style={{flex: 0, flexDirection: "row", width: 350, height: "10%", alignItems: "center", marginBottom: -70, marginTop: 10}}> 
        <Text style={{fontFamily: "DepartureMono"}}>{username}'s profile </Text>
        {username != yourUserName ? (
          following ? (
            <Pressable onPress={() => {
              const reqHeaders = {'Content-Type': "application/json", "Authorization": authToken}
              const req = new Request("http://192.168.1.26:3000/unfollowUser", {
              method: "POST",
              headers: reqHeaders,
              body: JSON.stringify({
                userToUnfollow: username
              })});
              fetch(req).then((response) => {
                if (response.status == 201) {
                  console.log("Unfollowed " + username);
                  setFollowing(false);
                  setFollowingChecked(true);
                } else {      
                  console.log("Failed to unfollow " + username);
                }
              });
            }  
          }>
            <Text style={{fontFamily: "DepartureMono", color: "red"}}>unfollow</Text></Pressable>):(
            <Pressable onPress={() => {
              // if you get a text outside text block warning, check spacing around colon in ternary 
              // for some reason, it throws this error when spaces around colon sometimes 
              console.log("Following " + username);
              const reqHeaders = {'Content-Type': "application/json", "Authorization": authToken}
              const req = new Request("http://192.168.1.26:3000/followUser", {
              method: "POST",
              headers: reqHeaders,
              body: JSON.stringify({
                userToFollow: username
              })});
              fetch(req).then((response) => {
                if (response.status == 201) {
                  console.log("followed " + username);
                  setFollowing(true);
                  setFollowingChecked(true);
                } else {      
                  console.log("Failed to follow " + username);
                }
              }).catch((error) => {console.log(error)});
            }  
          }>
            <Text style={{fontFamily: "DepartureMono", color: "blue", marginLeft: 10}} > follow </Text>
          </Pressable>
          )
        ):(
          <Pressable onPress={() => {setViewMode("viewFollowing")}}> 
            <Text style={{fontFamily: "DepartureMono", color: "blue", marginLeft: 10}} > view following </Text>
          </Pressable>
        )}  
        <Pressable onPress={() => {console.log("viewing stamps"); setViewMode("stampcollection")}}>
          <Text style={{fontFamily: "DepartureMono", color: "blue", marginLeft: 10}} > stamps </Text>
        </Pressable>
        </View>
     {scrapbook.length > 0 ? <DisplayPost props={{
      frontText: scrapbook[currentPostIndex].frontText,
       backText: scrapbook[currentPostIndex].backText,
        imageURL: scrapbook[currentPostIndex].imageURL,
         stampImgUrl: scrapbook[currentPostIndex].stampImgUrl, 
         username: username,
        id: scrapbook[currentPostIndex]._id,
      isLiked: scrapbook[currentPostIndex].usersLiked.includes(yourUserName),
    authToken: authToken}}/>
      : <KeyboardAvoidingView style={styles.postCardView}><Text style={{fontFamily: "DepartureMono"}}>no posts</Text></KeyboardAvoidingView>}
      <View style={{flex: 0, flexDirection: "row", width: 350, height: "10%", alignItems: "center", marginLeft: 40}}> 
        {currentPostIndex > 0 ? <Pressable onPress={() => setCurrentPostIndex(currentPostIndex - 1)}>
           <Text style={{fontFamily: "DepartureMono", marginLeft: -10}}> ← previous post</Text></Pressable>
           :<Text style={{fontFamily: "DepartureMono", marginLeft: -20}}> no previous posts</Text>}
        {currentPostIndex < scrapbook.length - 1 ? <Pressable onPress={() => setCurrentPostIndex(currentPostIndex + 1)}> 
          <Text style={{fontFamily: "DepartureMono", marginLeft: 10}}>next post →</Text></Pressable>
          :<Text style={{fontFamily: "DepartureMono", marginLeft: 20}}> no more posts</Text>}
        </View> 
     </KeyboardAvoidingView>
   )
   else if (viewMode == "stampCollection") return(
     <KeyboardAvoidingView style={styles.postCardView}>
       <View style={{flex: 0, flexDirection: "row", width: 350, height: "10%", alignItems: "center"}}>
        <Text style={{fontFamily: "DepartureMono"}}>{username}'s stamps</Text> 
        </View>
     </KeyboardAvoidingView>  );
    else if (viewMode == "viewFollowing") return(
      <KeyboardAvoidingView style={styles.postCardView}>
        <View style={{flex: 0, flexDirection: "row", width: 350, height: "10%", alignItems: "center"}}>
          <Text style={{fontFamily: "DepartureMono"}}>your following</Text>
          <Pressable onPress={() => {setViewMode("scrapbook")}}>
            <Text style={{fontFamily: "DepartureMono", color: "blue", marginLeft: "100"}}>go back</Text>
          </Pressable>
          </View>
          <FlatList
            data={followers}
            renderItem={({item}) => 
              <View style={{flex: 0, flexDirection: "row", width: "100%", height: 50, alignItems: "center"}}>
                <Text style={{fontFamily: "DepartureMono"}}>{item}</Text>
                <Pressable onPress={() => {}}>
                  <Text style={{fontFamily: "DepartureMono", color: "blue", marginLeft: 30}}>view profile</Text>
                </Pressable>
                <Pressable onPress={() => {
                  const reqHeaders = {'Content-Type': "application/json", "Authorization": authToken}
                  const req = new Request("http://192.168.1.26:3000/unfollowUser", {
                    method: "POST",
                    headers: reqHeaders,
                    body: JSON.stringify({
                      userToUnfollow: item
                    })
                  });
                  fetch(req).then((response) => {
                    if (response.status == 201) {
                      console.log("Unfollowed " + item);
                      setFollowers(followers.filter(follower => follower !== item));
                    } else {      
                      console.log("Failed to unfollow " + item);
                    }
                  }).catch((error) => {console.log(error)});
                }
                }>
                  <Text style={{fontFamily: "DepartureMono", color: "red", marginLeft: 30}}>unfollow</Text>
                </Pressable>        
              </View> }/>
              
        </KeyboardAvoidingView>
    ); 
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
function AppTabBar({ navigation, state, username, authToken }) {
  console.log("user:" + username);
  console.log("Auth token: " + authToken);
  const routeName = state.routes[state.index].name;
  console.log(routeName);
  return (
    <View style={styles.bottomCtrlBar}>
     {/*Below: Bottom control bar logic */}
      <View style={routeName == "MainFeed" ? styles.pressableLit : styles.bottomCtrlPressable}>
      <Pressable onPress={() => {navigation.navigate('MainFeed', {authToken: authToken});}}>
        <Image style={styles.ctlBarImg} source={require('../assets/images/mainfeed.png')} /> 
      </Pressable>
     </View>
      <View style={routeName == "CreatePostcard" ? styles.pressableLit : styles.bottomCtrlPressable}>
      <Pressable onPress={() => {navigation.navigate('CreatePostcard', {authToken: authToken, username: username});}}>
        <Image style={styles.ctlBarImg} source={require('../assets/images/createpostcard.png')} /> 
      </Pressable>
     </View>
      <View style={styles.bottomCtrlPressable}>
      <Pressable onPress={() => {navigation.navigate('StampCollection');}}>
        <Image style={styles.ctlBarImg} source={require('../assets/images/stampcollection.png')} /> 
      </Pressable>
     </View>
           <View style={routeName == "Scrapbook" ? styles.pressableLit : styles.bottomCtrlPressable}>
      <Pressable onPress={() => {navigation.navigate('Scrapbook', {authToken: authToken, username: username, yourUserName: username});}}>
        <Image style={styles.ctlBarImg} source={require('../assets/images/myscrapbook.png')} /> 
      </Pressable>
     </View>
     </View> )
}
//TODO: Implement the interface for this func
export default function Mainview ({props}) { 
  const [username, setUserName] = useState("!error");
  const [uNameLoaded, setUnameLoaded] = useState(false);
  const [authToken, setAuthToken] = useState(props.authToken); 
  console.log("Username: "+props.username)
  const fetchUsername = () => {
    const reqHeaders = {"Content-Type": "application/json", "Authorization": authToken}
    const req = new Request("http://192.168.1.26:3000/user", {
      method: "GET",
      headers: reqHeaders
    });
    fetch(req).then((response) => {
      return response.text();
    }).then((text) => {
      const rJSON = JSON.parse(text);
      console.log("Text: "+text);
      setUserName(rJSON.username) 
    }).catch((error) => {console.log(error)});
  }

  React.useEffect(() => {
    fetchUsername();
  }, [authToken]);

  // const ident = props.token; // The JWT token used for auth, sent with each request
   const [viewMode, setViewMode] = useState("mainfeed")
   const MainFeedPressed = () => {
      console.log("mainfeed")
      setViewMode("mainfeed")
   }
   const CreatePostcardPressed = () => {
     fetchUsername()
    console.log("Create postcard")
      setViewMode("createpostcard")
   }
   const StampCollectionPressed = () => {
      console.log("Stampcollection")
      setViewMode("stampcollection")
   }
   const ScrapbookPressed = () => {
      console.log("Scrapbook") 
      setViewMode("scrapbook")
   }
   /** 
   return(

    <View style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column-reverse",
        height: "100%",
        backgroundColor: 'white'
      }}>
     
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
        {viewMode === "scrapbook" ? <ScrapbookInterface props={{username: username, authToken: authToken, yourUserName: username}}/> : null}
     </KeyboardAvoidingView> 
     </View>
   )
   */ 
  return(
    <NavigationIndependentTree>
      <Tab.Navigator backBehavior="fullHistory" tabBar={props => <AppTabBar {...props} username={username} authToken={authToken} />} screenOptions={{headerShown: false, tabBarStyle: styles.bottomCtrlBar}}>
        <Tab.Screen name="MainFeed" component={MainFeed} initialParams={{authToken: authToken}} />
        <Tab.Screen name="CreatePostcard" component={CreatePostcardInterface}/>
        <Tab.Screen name="Scrapbook" component={ScrapbookInterface} />
        <Tab.Screen name="StampCollection" component={StampCollection} />
      </Tab.Navigator>
    </NavigationIndependentTree>
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
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start', 
    alignItems: 'flex-start',
    width: "100%",
    height: "10%"
  }, 
  bottomCtrlPressable: {
    flexShrink:0 ,
    flexGrow: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: "100%",
    backgroundColor: 'grey'
  },
  pressableLit: {
    flexShrink:0 ,
    flexGrow: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: "100%",
    backgroundColor: 'black'
  },
  ctlBarImg: {
    width: 72,
    height: 72
  },
  postCardView: {
    flex: 0, 
    height: 650,
    width: 350,
    backgroundColor: "white",
    borderRadius: 10,
    justifyContent: "flex-start",
    alignContent: "flex-start",
    marginLeft: 30,
    marginTop: 50

  },
  ScrapbookView: {
    flex: 0, 
    height: "98%",
    width: "98%",
    backgroundColor: "#f2d89b",
    borderRadius: 10,
    justifyContent: "center",
    alignContent: "flex-start",
    margin: -200,
    borderColor: 'brown',
    borderWidth: 10,
    flexDirection: 'column'
      },
  stampStyle: {
    height: "90%",
    width: "25%",
    resizeMode: "stretch"
  }

});
