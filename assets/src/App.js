import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { inject, observer, runInAction } from "mobx-react";

// Components
import Feed from "./components/Feed";
import Navbar from "./components/Navbar";
import Index from "./components/Index";
import Switch from "react-router-dom/Switch";
import carListing from "./components/carListing/carListing";
import Map from "./components/Map";

@inject("CarStore")
@observer
class App extends Component {
  componentDidMount() {
    {
      this.props.CarStore.getAllCars();
    }
  }

  setCars = () => {};

  render() {
    return (
      <div>
        <BrowserRouter>
          <div>
            <Navbar />
            <Switch>
              <Route path="/feed/carListing/:id" component={carListing} exact />
              <Route path="/" component={Index} exact />
              <Route path="/feed" component={Feed} />
            </Switch>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
