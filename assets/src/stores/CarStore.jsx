// čia bus mašinų store'as
import { observable, action, computed } from "mobx";
import axios from "axios";
axios.defaults.baseURL = "http://127.0.0.1/api/";

class CarStore {
  @observable
  cars = [];
  @observable
  brands = [];
  @observable
  models = [];
  @observable
  filter = {
    location: "Visi",
    brand: "Visi",
    models: ["Visi"],
    price_from: 0,
    price_to: 99
  };
  @observable
  currentCar = {};

  @action
  getAllCars = () => {
    axios
      .get("cars")
      .then(response => {
        this.setCars(response.data.data);
      })
      .catch(error => console.log(error.response));
  };

  @action
  GetCar = id => {
    this.currentCar = this.cars.find(car => {
      return car.id == id;
    });
  };

  @action
  setCars = list => {
    this.cars = list;
  };

  @computed
  get carsCount() {
    return this.cars.length;
  }
}

const store = new CarStore();
export default store;
