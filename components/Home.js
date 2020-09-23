import React, { Component } from 'react';
import { ActivityIndicator, Text, View, SafeAreaView, ScrollView, RefreshControl, Linking } from 'react-native';
import * as Location from 'expo-location';
import ErrorMessages from '../utils'

const SERVER_ADDRESS = 'http://18.188.89.203:8080/'
//const SERVER_ADDRESS = 'http://192.168.1.100:5000/'

class Home extends Component {

  constructor() {
    super()
    this.state = {
      refreshing: false,
      status: 'LOADING',
      status_code: '',
      location: '',
      info: '',
      style: {
        safeAreaView: {
          backgroundColor: '#FAFAFA',
          flex: 1
        },
        scrollView: {
          backgroundColor: '#FAFAFA',
          flex: 1
        },
        view: {
          flex: 1,
          paddingLeft: 30,
          paddingRight: 30,
          backgroundColor: '#FAFAFA',
          alignItems: 'center',
          justifyContent: 'center'
        },
        link: {
          textAlign: 'center',
          fontSize: 12,
          color: '#333333',
          opacity: 0.5,
          marginTop: 20,
          textDecorationLine: 'underline'
        },
        loading: {
          margin: 40
        },
        textInfoHeading: {
          textAlign: 'center',
          fontWeight: '700',
          fontSize: 28,
          color: '#212121',
          marginBottom: 25
        },
        textInfo: {
          textAlign: 'center',
          fontSize: 18,
          color: '#666666',
        },
        text: {
          textAlign: 'center',
          fontSize: 24,
          color: '#333333',
          margin: 5,
        },
        textSmall: {
          textAlign: 'center',
          fontSize: 12,
          color: '#333333',
          opacity: 0.5,
        },
        textBig: {
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: 32,
          color: '#333333',
          marginBottom: 25,
        }
      }
    };

  }

  componentDidMount() {
    this.update()
  }

  onRefresh() {
    if (this.state.status !== 'LOADING') {
      this.setState({ refreshing: true })
      this.update()
    }
  }

  update() {
    Location.requestPermissionsAsync()
      .then(response => {
        if (response.status !== 'granted') {
          this.setState({ status: 'ERROR', status_code: 'NO_LOCATION', refreshing: false })
        } else {
          Location.getCurrentPositionAsync({})
            .then(response => {
              let lon = response.coords.longitude
              let lat = response.coords.latitude
              this.getAmpelInfo(lon, lat)
            })
        }
      })
      .catch(_ => {
        this.setState({ status: 'ERROR', status_code: 'NO_LOCATION', refreshing: false })
      })
  }

  getAmpelInfo(lon, lat) {
    fetch(`${SERVER_ADDRESS}/coord?lat=${lat}&lon=${lon}`)
      .then(response => {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' + response.status)
          response.text().then(data => {
            console.log(data)
            this.setState({ 
              status: 'ERROR', 
              status_code: data,
              refreshing: false,
              style: {
                ...this.state.style,
                safeAreaView: { ...this.state.style.safeAreaView, backgroundColor: '#FAFAFA' },
                scrollView: { ...this.state.style.scrollView, backgroundColor: '#FAFAFA' },
                view: { ...this.state.style.view, backgroundColor: '#FAFAFA' },
              }
            })
          })
        } else {
          response.json().then(data => {
            this.setState({
              status: 'OK',
              status_code: '',
              refreshing: false,
              location: data.postcode,
              info: data.ampel_info.info,
              time: data.stand * 1000,
              style: {
                ...this.state.style,
                safeAreaView: { ...this.state.style.safeAreaView, backgroundColor: data.ampel_info.backgroundColor },
                scrollView: { ...this.state.style.scrollView, backgroundColor: data.ampel_info.backgroundColor },
                view: { ...this.state.style.view, backgroundColor: data.ampel_info.backgroundColor },
                text: { ...this.state.style.text, color: data.ampel_info.color },
                textSmall: { ...this.state.style.textSmall, color: data.ampel_info.color },
                textBig: { ...this.state.style.textBig, color: data.ampel_info.color },
              }
            })
          })
        }
      })
      .catch(error => {
        console.log(error)
      })

  }

  render() {
    let contentView;
    if (this.state.status === 'LOADING') {
      contentView = (
        <View style={this.state.style.view}>
          <Text style={this.state.style.textInfoHeading}>Bitte warten</Text>
          <Text style={this.state.style.textInfo}>Die Ampel wird für deinen Standort geschalten!</Text>
          <ActivityIndicator size='large' style={this.state.style.loading}></ActivityIndicator>
        </View>
      );
    } else if (this.state.status === 'ERROR') {
      contentView = (
        <View style={this.state.style.view}>
          <Text style={this.state.style.textInfoHeading}>{ErrorMessages[this.state.status_code]['title']}</Text>
          <Text style={this.state.style.textInfo}>{ErrorMessages[this.state.status_code]['description']}</Text>
        </View>
      );
    }
    else if (this.state.status === 'OK') {
      contentView = (
        <View style={this.state.style.view}>
          <Text style={this.state.style.text}>An deinem Standort</Text>
          <Text style={this.state.style.textBig}>{this.state.info}</Text>
          <Text style={this.state.style.textSmall}>Basierend auf deiner PLZ {this.state.location}</Text>
          <Text style={this.state.style.textSmall}>Stand {(new Date(this.state.time)).toLocaleDateString()}</Text>
          <Text style={this.state.style.link} onPress={ ()=> Linking.openURL('https://corona-ampel.gv.at') } >Hier mehr erfahren</Text>
        </View>
      );
    }

    return (
      <SafeAreaView style={this.state.style.safeAreaView}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} style={this.state.style.scrollView}
          refreshControl={
            <RefreshControl refreshing={this.state.refreshing} onRefresh={() => this.onRefresh()} />
          }
          showsVerticalScrollIndicator={false}
        >
          {contentView}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default Home