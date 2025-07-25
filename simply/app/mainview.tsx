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
  const [followingCurrentPost, setFollowingCurrentPost] = useState(false); // boolean to check if the current post's user is being followed
  const [currentPostUsername, setCurrentPostUsername] = useState(""); // username of the current post's user
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
      });
      fetch(request)
        .then((response) => response.json())
        .then((data) => {
          setPosts(data);
          setPostsLoaded(true);
          console.log("Posts loaded: " + data); 
        })
        .catch((error) => {console.log(error)}); 
    }

}), [postsLoaded, authToken, route.params.authToken, route.params.username, currentPostIndex]; 
useEffect(() => {
  if (posts.length > 0) {
    console.log(posts[currentPostIndex].postingUser+" is the current post's user");
    const reqHeaders = {"Content-Type": "application/json", "Authorization": authToken, "usertoview": posts[currentPostIndex].postingUser};
    const request = new Request("http://192.168.1.26:3000/isFollowing", {
      method: "GET",
      headers: reqHeaders
    });
    fetch(request).then((response) => {return response.json()}).then((data) => {
      setFollowingCurrentPost(data.isFollowing);
      setCurrentPostUsername(data.username);
      console.log("Current post username: " + currentPostUsername);
    }).catch((error) => {console.log(error)});
    
  }
 } // chreck if the current post's user is being followed
), [currentPostIndex, posts]; // update followingCurrentPost when post changes 
    console.log("dispuser "+route.params.username)
  return(<KeyboardAvoidingView style={{flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%"}}>
    <View style={{flex: 0, flexDirection: "row", width: 350, height: "10%", alignItems: "center", marginBottom: -70, marginTop: 10}}> 
      <Text style={{fontFamily: "DepartureMono", marginLeft: 10}}>Main Feed</Text>
      <Pressable onPress={() => {navigation.navigate('CreatePostcard', {authToken: authToken, username: route.params.username})}}>
        <Text style={{fontFamily: "DepartureMono", color: "blue", marginLeft: 10}} > create postcard </Text>
      </Pressable>
      <Pressable onPress={() => {
        console.log("Following " + currentPostUsername);
        const reqHeaders = {'Content-Type': "application/json", "Authorization": authToken}
        const req = new Request(followingCurrentPost ? "http://192.168.1.26:3000/unfollowUser" : "http://192.168.1.26:3000/followUser", {
          method: "POST",
          headers: reqHeaders,
          body: JSON.stringify({
            user: posts[currentPostIndex].postingUser // username of the current post's user 
          })
        });
        fetch(req).then((response) => {
          if (response.status == 201) {
            console.log(followingCurrentPost ? "Unfollowed " + posts[currentPostIndex].username : "Followed " + posts[currentPostIndex].username);
            setFollowingCurrentPost(!followingCurrentPost); // toggle the following state
          } else {
            console.log("Failed to follow/unfollow " + posts[currentPostIndex].username);
          }
        }).catch((error) => {console.log(error)});
      }}>
        {followingCurrentPost ? <Text style={{fontFamily: "DepartureMono", color: "black"}}>unfollow</Text>
         : <Text style={{fontFamily: "DepartureMono", color: "black"}}>follow</Text> }
      </Pressable>
    </View>
  <View style={{marginLeft: -10, height: "97%"}}>
    {posts.length > 0 ? (
      <DisplayPost props={{
        frontText: posts[currentPostIndex].frontText,
        backText: posts[currentPostIndex].backText,
        imageURL: posts[currentPostIndex].imageURL,
        stampImgUrl: posts[currentPostIndex].stampImgUrl,
        username: posts[currentPostIndex].postingUser,
        id: posts[currentPostIndex]._id,
        isLiked: false,
        authToken: authToken
      }}/>
    ) : (
      <KeyboardAvoidingView style={styles.postCardView}>
        <Text style={{fontFamily: "DepartureMono"}}>no posts</Text>
      </KeyboardAvoidingView>
    )}
  </View>
            <View style={{flex: 0, flexDirection: "row", width: 350, height: "5%", alignItems: "center", marginLeft: 40, marginTop: "-50"}}> 
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
  if (!stampPickerMode && !side) return(
  <KeyboardAvoidingView style={{flexDirection: "row", justifyContent: "center", height: "100%"}} behavior={'padding'}>
  <KeyboardAvoidingView style={styles.postCardView}     behavior={'padding'}>
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
  </KeyboardAvoidingView>
  </KeyboardAvoidingView>)
  //backside display below 
  if (!stampPickerMode && side) return(
    <KeyboardAvoidingView style={{flexDirection: "row", justifyContent: "center", height: "100%"}} behavior={'padding'}>
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
      <KeyboardAvoidingView style={{flexDirection: "row", justifyContent: "center", height: "100%"}} behavior={'padding'}>
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
      </KeyboardAvoidingView> 
    )
  }
}
function DisplayPost({props}) {
  const stampImgUrl = props.stampImgUrl; 
  const frontText = props.frontText; 
  const backText = props.backText; 
  const imageURL = props.imageURL; 
  const [username, setUsername] = React.useState(props.username);
  const [postDataLoaded, setPostDataLoaded] = React.useState(false); 
  const authToken = props.authToken; // auth token used for liking/unliking posts
  const id = props.id; // id of the post, used for liking
  const numLikes = props.numLikes != null ? props.numLikes : -1; // number of likes on the post, used for displaying likes
  // numLikes is only used if the post is being viewed by the posting user and numLikes NOT null - if not, the like button is displayed (if -1) 
  const [isLiked, setLiked] = React.useState(false); // boolean indicating if the post is liked by the user
  const [side, setSide] = useState(false); // true for backside of card
  console.log("DisplayPost props: " + JSON.stringify(props));
  React.useEffect(() => {
    if (!postDataLoaded) {
      const reqHeaders = {"Content-Type": "application/json", "Authorization": authToken, "postid": id}
      const request = new Request("http://192.168.1.26:3000/postInfo", {
        method: "GET",
        headers: reqHeaders
      });
    
    fetch(request).then((response) => response.json()).then((data) => {
      console.log("Post data loaded: " + data);
      setUsername(data.username);
      setPostDataLoaded(true);
      if (data.isLiked) {
        setLiked(true); // set liked state if post is liked by user
      } else {
        setLiked(false); // set not liked state if post is not liked by user
      }
    });
  }
  }, [postDataLoaded, authToken, id]); // fetch post data only once
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
    <Text style={{marginLeft:"2%", fontFamily: "DepartureMono", fontSize: 20}}>{username}</Text>
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
        <Text style={{marginLeft:"2%", fontFamily: "DepartureMono", fontSize: 20}}>{username}</Text>
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
      console.log("Loading scrapbook for " + username);
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
            //console.log("sbi:" + data[index].stampImgUrl);
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
     <KeyboardAvoidingView style={{flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%"}}>
      <View style={{flex: 0, flexDirection: "row", width: 350, height: "10%", alignItems: "center",  marginBottom: -70, marginTop: 10}}> 
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
         username: scrapbook[currentPostIndex].postingUser,
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
                      user: item
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
function StampCollection ({route, navigation}) {
  // interface to view a users stamp collection
  const [stamps, setStamps] = useState([]); // your stamps 
  const [stampsLoaded, setStampsLoaded] = useState(false); // boolean to check if stamps have been loaded 
  const [yourStampsLoaded, setYourStampsLoaded] = useState(false); // boolean to check if your stamps have been loaded
  const [yourStamps, setYourStamps] = useState([]); // stamps that you have 
  const [authToken, setAuthToken] = useState(route.params.authToken);
  const [username, setUsername] = useState(route.params.username); // username of whose stamps to view
  const [showStore, setShowStore] = useState(false); // boolean to check if the stamp store is being viewed 
  React.useEffect(() => {
    if (!yourStampsLoaded) {
      console.log("Loading stamps for " + username);
      const reqHeaders = {'Content-Type': "application/json", "Authorization": authToken, "usertoview": username}
      const req = new Request("http://192.168.1.26:3000/getStampBook", {
        method: "GET",
        headers: reqHeaders,
      });
      fetch(req)
        .then((response) => response.json())
        .then((data) => {
          setYourStamps(data);
          setYourStampsLoaded(true);
        })
        .catch((error) => console.log(error));
    }
    if (!stampsLoaded) {
      console.log("Loading all stamps");
      const reqHeaders = {'Content-Type': "application/json", "Authorization": authToken}
      const req = new Request("http://192.168.1.26:3000/getAllStamps", {
        method: "GET",
        headers: reqHeaders,
      });
      fetch(req)
        .then((response) => response.json())
        .then((data) => {
          console.log("Your stamps: " + data);
          setStamps(data);
          setStampsLoaded(true);
        })
        .catch((error) => console.log(error));
    }
  }, [stampsLoaded, authToken, username, yourStampsLoaded]);
  if (!showStore) return (
    <KeyboardAvoidingView style={{flexDirection: "column", alignItems: "center", justifyContent: "center", height: "85%"}}>
      <View style={{flex: 0, flexDirection: "row", width: 350, height: "30%", alignItems: "center",  marginBottom: -70, marginTop: 10}}>
        <Text style={{fontFamily: "DepartureMono"}}>{username}'s stamps</Text>
        <Pressable onPress={() => {setShowStore(true)}}>
          <Text style={{fontFamily: "DepartureMono", color: "blue", marginLeft: 10}}>view store</Text>
        </Pressable>
        </View> 
      <View style={{marginLeft: 300, flex: 0, flexDirection: "column", width: 1000, height: "100%", alignItems: "center", justifyContent: "center",  marginBottom: -70, marginTop: 10}}>
          <FlatList
          data={yourStamps}
          renderItem={({item}) =>
            <View style={{ height: 220, width: 500, flex: 0, justifyContent: "center"}}>
              <Text style={{fontFamily: 'DepartureMono'}}>{item.prettyName}</Text>
              //view users stamps 
                <Image source={{ uri: item.imgLink}} style={styles.stampStyle}/>

            </View>}
          keyExtractor={item => item.prettyName}
        />
      </View> 
    </KeyboardAvoidingView>
  )
  else return( // show stamp store interface 
    <KeyboardAvoidingView style={{flexDirection: "column", alignItems: "center", justifyContent: "center", height: "85%"}}>
      <View style={{flex: 0, flexDirection: "row", width: 350, height: "30%", alignItems: "center",  marginBottom: -70, marginTop: 10}}>
        <Text style={{fontFamily: "DepartureMono"}}>{username}'s stamps</Text>
        <Pressable onPress={() => {setShowStore(false)}}>
          <Text style={{fontFamily: "DepartureMono", color: "blue", marginLeft: 10}}>view your stamps</Text>
        </Pressable>
        </View> 
      <View style={{marginLeft: 300, flex: 0, flexDirection: "column", width: 1000, height: "100%", alignItems: "center", justifyContent: "center",  marginBottom: -70, marginTop: 10}}>
          <FlatList
          data={stamps}
          renderItem={({item}) =>
            <View style={{ height: 300, width: 500, flex: 0, justifyContent: "center"}}>
              <Text style={{fontFamily: 'DepartureMono'}}>{item.prettyName}</Text>
              //view users stamps 
                <Image source={{ uri: item.imgLink}} style={styles.stampStyle}/>
                {yourStamps.includes(item.prettyName) ?
                <Text style={{fontFamily: "DepartureMono", color: "green"}}>You have this stamp!</Text> :
                <Pressable onPress={() => {
                  const reqHeaders = {'Content-Type': "application/json", "Authorization": authToken}
                  const req = new Request("http://192.168.1.26:3000/buyStamp", {
                    method: "POST",
                    headers: reqHeaders,
                    body: JSON.stringify({
                      stampName: item.prettyName
                    })
                  });
                  fetch(req).then((response) => {
                    if (response.status == 201) {
                      console.log("Bought stamp " + item.prettyName);
                      setYourStamps([...yourStamps, item.prettyName]); // add stamp to your stamps
                    } else {
                      console.log("Failed to buy stamp " + item.prettyName);
                    }
                  }).catch((error) => {console.log(error)});
                }}>
                  <Text style={{fontFamily: "DepartureMono", color: "blue"}}>buy this stamp</Text>
                </Pressable>
                }
            </View>}
          keyExtractor={item => item.prettyName}
        />
      </View> 
    </KeyboardAvoidingView>
  )

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
      <View style={routeName === "MainFeed" ? styles.pressableLit : styles.bottomCtrlPressable}>
      <Pressable onPress={() => {navigation.navigate('MainFeed', {authToken: authToken});}}>
        <Image style={styles.ctlBarImg} source={require('../assets/images/mainfeed.png')} /> 
      </Pressable>
     </View>
      <View style={routeName === "CreatePostcard" ? styles.pressableLit : styles.bottomCtrlPressable}>
      <Pressable onPress={() => {navigation.navigate('CreatePostcard', {authToken: authToken, username: username});}}>
        <Image style={styles.ctlBarImg} source={require('../assets/images/createpostcard.png')} /> 
      </Pressable>
     </View>
      <View style={routeName === "StampCollection" ? styles.pressableLit : styles.bottomCtrlPressable}>
      <Pressable onPress={() => {navigation.navigate('StampCollection', {authToken: authToken, username: username});}}>
        <Image style={styles.ctlBarImg} source={require('../assets/images/stampcollection.png')} /> 
      </Pressable>
     </View>
           <View style={routeName === "Scrapbook" ? styles.pressableLit : styles.bottomCtrlPressable}>
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
    width: "25%",
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
    height: "80%",
    width: 350,
    backgroundColor: "white",
    borderRadius: 10,
    justifyContent: "flex-start",
    alignContent: "flex-start",

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
