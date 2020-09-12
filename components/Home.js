import React, { Component } from 'react';
import { ActivityIndicator, Text, View, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

const SERVER_ADDRESS = 'http://18.188.89.203:8080/'

class Home extends Component {

  constructor() {
    super()
    this.state = {
      refreshing: false,
      status: 'loading',
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
          paddingLeft: 2,
          paddingRight: 2,
          backgroundColor: '#FAFAFA',
          alignItems: 'center',
          justifyContent: 'center'
        },
        button: {
          marginTop: 40
        },
        loading: {
          margin: 40
        },
        text: {
          fontSize: 24,
          color: '#333333',
          margin: 5,
        },
        textSmall: {
          fontSize: 12,
          color: '#333333',
          opacity: 0.5,
          marginLeft: 20,
          marginRight: 20,
        },
        textBig: {
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
    if (this.state.status === 'ok') {
      this.setState({ refreshing: true })
      this.update()
    }
  }

  update() {
    Location.requestPermissionsAsync()
      .then(response => {
        if (response.status !== 'granted') {
          this.setState({ status: 'noLocation' })
        } else {
          Location.getCurrentPositionAsync({})
            .then(response => {
              let lon = response.coords.longitude
              let lat = response.coords.latitude
              this.getAmpelInfo(lon, lat)
            })
        }
      })
  }

  getAmpelInfo(lon, lat) {
    fetch(`${SERVER_ADDRESS}/coord?lat=${lat}&lon=${lon}`)
      .then(response => {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' + response.status)
          return
        }

        response.json().then(data => {
          this.setState({
            status: 'ok',
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
      })
      .catch(error => {
        console.log(error)
      })
  }

  render() {
    let contentView;
    if (this.state.status === 'loading') {
      contentView = (
        <View style={this.state.style.view}>
          <Text style={this.state.style.text}>Bitte warten</Text>
          <Text style={this.state.style.textSmall}>Erlaube der App Zugriff auf den Standort um Informationen zu deinem Bezirk zu erhalten.</Text>
          <ActivityIndicator size='large' style={this.state.style.loading}></ActivityIndicator>
        </View>
      );
    } else if (this.state.status === 'noLocation') {
      contentView = (
        <View style={this.state.style.view}>
          <Text style={this.state.style.text}>Kein Zugriff auf den Standort</Text>
          <Text style={this.state.style.textSmall}>Stelle sicher dass die App Zugriff auf deinen Standort hat.</Text>
        </View>
      );
    } else if (this.state.status === 'ok') {
      contentView = (
        <View style={this.state.style.view}>
          <Text style={this.state.style.text}>An deinem Standort</Text>
          <Text style={this.state.style.textBig}>{this.state.info}</Text>
          <Text style={this.state.style.textSmall}>Basierend auf deiner PLZ {this.state.location}</Text>
          <Text style={this.state.style.textSmall}>Stand {(new Date(this.state.time)).toLocaleDateString()}</Text>
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