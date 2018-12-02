import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Item from "./item";

@inject("CarStore")
@observer
class Favourites extends Component {
  render() {
    const { likedCarList: cars } = this.props.CarStore;
    return (
      <div className="container">
        <h2>Jūsų mėgstami automobiliai</h2>
        <hr />
        <div className="row">
          {cars.map(car => (
            <div key={car.id} className="col-sm-6 col-md-4 col-lg-3">
              <Item car={car} />
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Favourites;
