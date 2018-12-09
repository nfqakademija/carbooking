import React, {Component} from "react";
import CarInfo from "./carInfo";
import CarImage from "./carImage";
import MapContainer from "../map/MapContainer";
import Dialog from "./Dialog";
import $ from "jquery";
import Loading from "../loading";
import {inject, observer} from "mobx-react";
import axios from "axios";

@inject("CarStore")
@observer
class CarListing extends Component {
    constructor(props) {
        super(props);

        this.state = {
            calendarShowing: false,
            place: null,
            lat: 0,
            comments: [],
            car: {},
            loading: true,
            showDialog: false,
        };
    }

    componentDidMount() {
        //todo check if car exists with received params, else redirect
        $("body, html").animate({scrollTop: $("#mainNav").offset().top}, 1000);
        this.getComments(this.props.match.params.id);
        // Check if hash is not the same as parameter id
        const hash = this.props.location.pathname.substr(this.props.location.pathname.lastIndexOf('/') + 1);
        if (hash != this.props.match.params.id) {
            this.getUserListing(hash);
        }
        this.getCar(this.props.match.params.id);
    }

    getUserListing = hash => {
        axios
            .get("reservation/" + hash)
            .then(response => {
                console.log(response.data.message);
                this.setState({
                    dialogHeader: "Rezervacija patvirtinta",
                    dialogText: response.data.message,
                    showDialog: true
                });
            })
            .catch(error => console.log(error.data))
    };

    getCar = id => {
        axios
            .get("/car/" + id)
            .then(response => {
                this.setState({car: response.data.data});
                this.setState({loading: false});
            })
            .catch(error => console.log(error));
    };

    getComments = id => {
        let comments = [];
        axios
            .get("/comments/" + id)
            .then(response => {
                this.setComments(response.data.data);
                comments = response.data.data;
            })
            .catch(error => console.log(error.response));
        return comments;
    };

    ShowCalendar = () => {
        this.setState({showCalendar: true});
    };

    setComments = comments => {
        this.setState({comments: comments});
    };

    addComment = comment => {
        this.setState({
            comments: [...this.state.comments, comment]
        });
    };

    render() {
        const {loading: load} = this.props.CarStore;

        if (this.state.loading) {
            return (
                <div className="main">
                    <div className="container">
                        <div className="flex flex-center fullHeight">
                            <Loading className={"loading"}/>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="product">
                {this.state.showDialog ? <Dialog
                    alertMessage={this.state.dialogText}
                    alertHeader={this.state.dialogHeader}
                /> : null}
                <div className="container card margin-bottom--big">
                    <div>
                        <CarImage image={this.state.car}/>
                    </div>
                    <div className="row">
                        <div className="col-md-11">
                            <CarInfo
                                car={this.state.car}
                                addComment={this.addComment}
                                comments={this.state.comments}
                            />
                        </div>
                        <div className="col-md-1"/>
                    </div>
                    <MapContainer
                        latitude={this.state.car.latitude}
                        longitude={this.state.car.longitude}
                        zoom={16}
                    />
                </div>
            </div>
        );
    }
}

export default CarListing;
