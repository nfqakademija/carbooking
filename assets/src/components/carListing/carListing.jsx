import React, {Component} from "react";
import CarInfo from "./carInfo";
import CarImage from "./carImage";
import MapContainer from "./MapContainer";
import Dialog from "./Dialog";
import {Redirect} from "react-router-dom";
import $ from "jquery";
import Loading from "../../extras/loading";
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
            redirectToError: false
        };
    }

    componentDidMount() {
        //todo check if car exists with received params, else redirect
        $("body, html").animate({scrollTop: $("#mainNav").offset().top}, 1000);
        this.getComments(this.props.match.params.id);
        // Check if hash is not the same as parameter id
        const hash = this.props.location.pathname.substr(
            this.props.location.pathname.lastIndexOf("/") + 1
        );
        // Checking if the owner declined the reservation
        if (hash === "not_approved") {
            const notApprovedHash = this.props.location.pathname.split('/').slice(-2)[0];
            this.getNotApproved(notApprovedHash);
        } else {
            if (hash !== this.props.match.params.id) {
                this.getUserListing(hash);
            }
        }
        this.getCar(this.props.match.params.id);
    }

    getNotApproved = hash => {
        axios
            .get("reservation/" + hash + "/not_approved")
            .then(response => {
                console.log(response.data.message);
                this.setState({
                    dialogHeader: "Rezervacija atšaukta",
                    dialogText: response.data.message,
                    showDialog: true,
                    showSuccess: true
                });
            })
            .catch(error => {
                this.setState({
                    dialogHeader: "Klaida",
                    dialogText: "Kažkas atsitiko blogai",
                    showDialog: true,
                    showSuccess: false
                });
            });
    };

    getUserListing = hash => {
        axios
            .get("reservation/" + hash)
            .then(response => {
                console.log(response.data.message);
                this.setState({
                    dialogHeader: "Patvirtinta",
                    dialogText: response.data.message,
                    showDialog: true,
                    showSuccess: true
                });
            })
            .catch(error => {
                this.setState({
                    dialogHeader: "Rezervacija nepatvirtinta",
                    dialogText: "Kažkas atsitiko blogai",
                    showDialog: true,
                    showSuccess: false
                });
            });
    };

    getCar = id => {
        axios
            .get("/car/" + id)
            .then(response => {
                this.setState({car: response.data.data});
                this.setState({loading: false});
            })
            .catch(error => {
                console.log(error);
                this.setState({redirectToError: true});
            });
    };

    handleBadListing = () => {
        const { postBadListing } = this.props.CarStore;
        postBadListing(this.props.match.params.id);
        this.setState({
            badListingHeader: "Jūsų pranešimas buvo išsiųstas",
            badListingText: "Dėkui už jūsų pranešimą",
            badListingShow: true
        });
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
            comments: [comment, ...this.state.comments]
        });
    };

    render() {
        const {loading: load} = this.props.CarStore;

        if (this.state.redirectToError) {
            return <Redirect to="/404"/>;
        }

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

        if (this.state.car === null) {
            return <Redirect to="/404"/>;
        }

        return (
            <div className="product">
                {this.state.showDialog ? (
                    <Dialog
                        showSuccess={this.state.showSuccess}
                        alertMessage={this.state.dialogText}
                        alertHeader={this.state.dialogHeader}
                    />
                ) : null}
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
                    <div className="info-report--small">
                        <hr/>
                        <p onClick={this.handleBadListing} className="info-report">
                            Pranešti apie netinkamą skelbimą
                        </p>
                        {this.state.badListingShow ? (
                            <div onClick={this.handleBadListingDialog}>
                                <Dialog
                                    showSuccess={true}
                                    alertHeader={this.state.badListingHeader}
                                    alertMessage={this.state.badListingText}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }
}

export default CarListing;
