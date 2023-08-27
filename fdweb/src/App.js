import React, { Component } from 'react';
import { loadSlim } from 'tsparticles-slim';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-tsparticles';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';

class App extends Component {
  constructor() {
    super();
    this.state = {
      imageUrl: '', // Add this line to store the image URL,
      box: {}, // Add this line to store the face box data
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        password: '',
        entries: 0,
        joined: ''
      }

    }
  }
  loadUser = (data) => {
    this.setState({ user: {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      entries: data.entries,
      joined: data.joined
    }})
  }


  componentDidMount(){
    fetch('http://localhost:3000/')
    .then(response => response.json())
    .then(console.log)
  }

  calculateFaceLocation = (clarifaiFace, image) => {
    const width = Number(image.width);
    const height = Number(image.height);
    console.log("Width:", width, "Height:", height);
  
    const faceLocation = {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    };
    
    return faceLocation;
  }
  

  displayFaceBox = (box) => {
    // Add your code here to display the box on the screen
    console.log(box);
    this.setState({ box: box });
  }

  particlesInit = async (engine) => {
    console.log(engine);
    await loadSlim(engine);
  }

  particlesLoaded = async (container) => {
    console.log(container);
  }

  onInputChange = (event) => {
    this.setState({ imageUrl: event.target.value });
  }

  onButtonSubmit = () => {
    const PAT = '/*your API key*?';
    const USER_ID = 'clarifai';
    const APP_ID = 'main';
    const MODEL_ID = 'face-detection';
    const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';
  
    const { imageUrl } = this.state; // Get the image URL from state
  
    const raw = JSON.stringify({
      "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
      },
      "inputs": [
        {
          "data": {
            "image": {
              "url": imageUrl // Use the user-provided image URL
            }
          }
        }
      ]
    });
  
    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT
      },
      body: raw
    };
  
    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
      .then(response => response.json())
      .then(result => {
        const clarifaiFace = result.outputs[0].data.regions[0].region_info.bounding_box;
        const image = new Image(); // Create a new image element
        image.src = imageUrl; // Set the image source
        image.onload = () => {
          const faceLocation = this.calculateFaceLocation(clarifaiFace, image);
          // console.log("Face Location:", faceLocation);
          // You can use the faceLocation object in further processing
          this.displayFaceBox(faceLocation);
        };
      })
      .catch(error => console.log('error', error));
      fetch("http://localhost:3000/image", {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: this.state.user.id
        })
      })
      .then(response => response.json())
      .then(count => {
        this.setState(Object.assign(this.state.user, {entries: count}))}
      )
      .catch(console.log)
  }
  
  

  // Function to define particle options
  getParticleOptions = () => {
    return {
      background: {
        color: {
          value: 'transparent',
        },
      },
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: 'push',
          },
          onHover: {
            enable: true,
            mode: 'repulse',
          },
          resize: true,
        },
        modes: {
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: '#ffffff',
        },
        links: {
          color: '#ffffff',
          distance: 150,
          enable: true,
          opacity: 0.5,
          width: 1,
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'bounce',
          },
          random: false,
          speed: 6,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 80,
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: 'circle',
        },
        size: {
          value: { min: 1, max: 5 },
        },
      },
      detectRetina: true,
    };
  };

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({ isSignedIn: false });
    } else if (route === 'home') {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles
          id="tsparticles"
          init={this.particlesInit}
          loaded={this.particlesLoaded}
          options={this.getParticleOptions()}
        />

        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home' 
        ?
        <div>
          <Logo />
          <Rank 
          name={this.state.user.name} entries={this.state.user.entries}
          />
          <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
          <FaceRecognition box={box}imageUrl={imageUrl} />
        </div>
        : (route === 'signin' 
        ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
         : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/> )
        
        }
      </div>
    );
  }
}

export default App;
