import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

class Home extends Component {
    constructor() {
        super()
        //this.state = {};
    }

    render() {
      return (
        <View>
            <Text>Hello, I am your home Component!</Text>
        </View>
      );
    }
}

export default Home