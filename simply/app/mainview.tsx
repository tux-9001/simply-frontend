
import { Text, View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Button} from "react-native";

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
export default function Mainview ({props}) {
   const ident = props.token; // The JWT token used for auth, sent with each request
   const [viewMode, setViewMode] = react.useState("mainfeed")
}
