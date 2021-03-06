import React, { Component } from "react";
import Comment from "./comment";
import "./carListing.css";
import Dialog from "./Dialog";
import Validators from "./carListingValidators";
import DatePicker from "react-datepicker/es";
import { inject, observer } from "mobx-react";
import axios from "axios";
import moment from "moment";
import lt from "date-fns/locale/lt";
import { Button, Collapse } from "mdbreact";

@inject("CarStore")
@observer
class carInfo extends Component {
  constructor(props) {
    super(props);
    // const min
    // for (let i = 0; i < props.bookingDates.length; i++) {
    //     if (props.bookingDates[i] < props.bookingDates[i+1]) {
    //
    //     }
    // }
    this.state = {
      reservationClicked: false,
      reservationButtonText: "Rezervuoti",
      date_from: new Date().setHours(0, 0, 0, 0),
      date_until: moment(new Date().setHours(0, 0, 0, 0))
        .add(1, "d")
        .valueOf(),
      name: "",
      email: "",
      phone: "",
      message: "",
      value: null,
      totalPrice: 0,
      comments: [],
      commentName: "",
      commentText: "",
      response: {},
      bookingDates: {},
      rentedDates: [],
      showAlertWindow: false,
      excludeDates: [],
      showCommentNameError: false,
      showCommentTextError: false,
      commentCollapse: false,
      reservationCollapse: false,
      showReservationErrors: false,
      cannotReserveDates: ""
    };
  }

  getDates = (start, end) => {
    let arr = [];
    let dt = new Date(start);
    while (dt <= end) {
      arr.push(new Date(dt));
      dt.setDate(dt.getDate() + 1);
    }
    arr.push(new Date(end));
    return arr;
  };

  componentDidMount() {
    this.calculateSum();
  }

  handleDateChangeRaw = e => {
    e.preventDefault();
  };

  postReservation = reservation => {
    axios
      .post("/new/reservation", { reservation })
      .then(response => {
        this.setState({
          showAlertWindow: true,
          alertHeader: "Rezervacijos forma išsiųsta",
          alertText:
            "Rezervacija bus patvirtinta kai automobilio savininkas el. pašte patvirtins jūsų rezervacijos užklausą",
          showSuccess: true
        });
      })
      .catch(error => {
        console.log(error.response.data.status);
        this.setState({
          showAlertWindow: true,
          alertHeader: "Rezervacija nepavyko",
          alertText: error.response.data.message,
          showSuccess: false
        });
      });
  };

  handleSubmit = e => {
    if (this.state.reservationClicked === true) {
      e.preventDefault();
      const { name, email, phone, message, date_from, date_until } = this.state;

      const reservation = {
        carId: this.props.car.id,
        date_from: moment(new Date(date_from)).add(1, "d"),
        date_until: moment(new Date(date_until)).add(1, "d"),
        name: name,
        email: email,
        phone: phone,
        message: message
      };

      const validationErrors = Validators.reservation(reservation);
      if (
        validationErrors.name !== undefined ||
        validationErrors.email !== undefined ||
        validationErrors.phone !== undefined ||
        validationErrors.message !== undefined
      ) {
        this.setState({
          validationErrors: validationErrors,
          showReservationErrors: true
        });
        return;
      }
      this.setState({ showReservationErrors: false });

      this.postReservation(reservation);

      this.setState({
        reservationClicked: false,
        reservationCollapse: false,
        reservationButtonText: "Rezervuoti"
      });
    } else {
      this.setState({
        reservationClicked: true,
        reservationCollapse: true,
        reservationButtonText: "Patvirtinti rezervaciją"
      });
    }
  };

  handleSubmitComment = e => {
    const commentNameError = Validators.commentName(this.state.commentName);
    const commentTextError = Validators.commentText(this.state.commentText);
    let showError = false;
    if (commentNameError !== "") {
      this.setState({
        showCommentNameError: true,
        commentNameError: commentNameError
      });
      showError = true;
    } else this.setState({ showCommentNameError: false });
    if (commentTextError !== "") {
      this.setState({
        showCommentTextError: true,
        commentTextError: commentTextError
      });
      showError = true;
    } else this.setState({ showCommentTextError: false });
    if (showError) {
      this.setState({
        commentCollapse: true
      });
      e.preventDefault();
    } else {
      this.setState({
        commentCollapse: false,
        commentName: "",
        commentText: ""
      });
      e.preventDefault();
      const { postComment } = this.props.CarStore;
      const { commentName, commentText } = this.state;

      const comment = {
        carId: this.props.car.id,
        name: commentName,
        text: commentText
      };
      document.getElementById("clear-comment-input").reset();

      //siunčiam komentarą į api
      postComment(comment);
      //TODO IF ALL GOOD
      //pertvarkom komentaro stuktūrą ir atvaizduojam komentarą lokaliai
      const restructuredComment = {
        comment: comment.text,
        name: comment.name,
        createdAt: new Date().toJSON().replace("T", " ")
      };
      this.props.addComment(restructuredComment);
    }
  };

  toggleComment = () => {
    this.setState({ commentCollapse: !this.state.commentCollapse });
  };

  dateWithoutTime = date => {
    return date.setHours(0, 0, 0, 0);
  };

  calculateSum = () => {
    if (this.state.date_until > this.state.date_from) {
      const resultInMiliseconds = this.state.date_until - this.state.date_from;

      const ResultInDays = Math.floor(
        resultInMiliseconds / (1000 * 60 * 60 * 24)
      );

      if (ResultInDays > 0) {
        const totalPrice =
          Math.round(ResultInDays * this.props.car.price * 100) / 100;
        this.setState({
          totalPrice
        });
      } else {
        this.setState({ totalPrice: 0 });
      }
    } else {
      this.setState({
        totalPrice: 0
      });
    }
  };

  handleFromChange = (excludedDates, date) => {
    if (this.dateWithoutTime(date) === this.state.date_until) {
      this.setState({ cannotReserveDates: "Minimali nuomos trukmė: 1 para" });
    } else {
      this.setState({ cannotReserveDates: "" });
    }
    let showError = false;
    if (date <= new Date(this.state.date_until)) {
      this.setState(
        { date_from: this.dateWithoutTime(date) },
        this.calculateSum
      );
      excludedDates.map(dates => {
        if (dates >= date && dates <= new Date(this.state.date_until)) {
          this.setState({
            cannotReserveDates:
              "Tarp jūsų pasirinktų datų jau yra kelios, kurios yra rezervuotos"
          });
          showError = true;
        }
        if (showError === false) {
          this.setState({ cannotReserveDates: "" });
        }
      });
    } else {
      this.setState({
        date_until: date,
        date_from: date
      });
    }
  };

  handleUntilChange = (excludedDates, date) => {
    if (this.dateWithoutTime(date) === this.state.date_from) {
      this.setState({ cannotReserveDates: "Minimali nuomos trukmė: 1 para" });
    } else {
      this.setState({ cannotReserveDates: "" });
    }
    let showError = false;
    if (date >= new Date(this.state.date_from)) {
      this.setState(
        { date_until: this.dateWithoutTime(date) },
        this.calculateSum
      );
      excludedDates.some(dates => {
        if (dates <= date && dates >= new Date(this.state.date_from)) {
          this.setState({
            cannotReserveDates:
              "Tarp jūsų pasirinktų datų jau yra kelios, kurios yra rezervuotos"
          });
          showError = true;
        }
        if (showError === false) {
          this.setState({ cannotReserveDates: "" });
        }
      });
    }
  };

  handleNameChange = name => {
    this.setState({ name: name.target.value });
  };

  handleMessageChange = message => {
    this.setState({ message: message.target.value });
  };

  handleBadListing = () => {
    const { postBadListing } = this.props.CarStore;
    postBadListing(this.props.car.id);
    this.setState({
      badListingHeader: "Jūsų pranešimas buvo išsiųstas",
      badListingText: "Dėkui už jūsų pranešimą",
      badListingShow: true
    });
  };

  isLiked = () => {
    const { car: currentCar } = this.props;
    const { likedCars } = this.props.CarStore;

    return (
      likedCars.filter(car => {
        return car.id == currentCar.id;
      }).length > 0
    );
  };

  handleLikeSubmit = e => {
    e.preventDefault();
    const { car } = this.props;
    const { likesToggler } = this.props.CarStore;
    likesToggler(car);
  };

  handleEmailChange = email => {
    this.setState({ email: email.target.value });
  };

  handlePhoneChange = phone => {
    this.setState({ phone: phone.target.value });
  };

  handleCommentName = name => {
    this.setState({ commentName: name.target.value });
  };

  handleCommentText = text => {
    this.setState({ commentText: text.target.value });
  };

  handleAlert = () => {
    this.setState({ showAlertWindow: false });
  };

  render() {
    let datesArray = [];
    let dates = [];
    if (this.props.car.bookingDates.length !== 0) {
      this.props.car.bookingDates.map(date => {
        datesArray = this.getDates(
          new Date(date.bookedFrom),
          new Date(date.bookedUntil)
        );
        dates = [...datesArray, ...dates];
      });
    }

    const comments = (
      <React.Fragment>
        <div className="container d-none d-lg-block">
          <hr />
        </div>
        <div className="col-lg-3 info-description info-description--border">
          Komentarai
        </div>
        <div className="col-lg-9 info-comment info-comment--border">
          {this.props.comments.length ? (
            <Comment comments={this.props.comments} />
          ) : (
            <p className="info-comment--padding">
              Šis skelbimas neturi jokių komentarų.
            </p>
          )}
        </div>
        <div className="container d-none d-lg-block container--margin-reduce">
          <hr />
        </div>
        <div className="col-lg-12 info--newComment info--newComment-border">
          <button
            onClick={this.toggleComment}
            className="btn btn-warning btn-comment"
          >
            Parašyti komentarą
          </button>
          <Collapse isOpen={this.state.commentCollapse}>
            <div className="form-group form-group-separate">
              <form id="clear-comment-input">
                <input
                  onChange={this.handleCommentName}
                  value={this.state.commentName}
                  className="form-control"
                  type="text"
                  name="name"
                  placeholder="Įrašykite savo vardą"
                />
                {this.state.showCommentNameError ? (
                  <div className="input--error">
                    {this.state.commentNameError}
                  </div>
                ) : null}
                <textarea
                  onChange={this.handleCommentText}
                  value={this.state.commentText}
                  className="form-control"
                  placeholder="Komentaras..."
                />
                {this.state.showCommentTextError ? (
                  <div className="input--error">
                    {this.state.commentTextError}
                  </div>
                ) : null}
                <br />
                <button
                  onClick={this.handleSubmitComment}
                  className="btn btn-warning info-button"
                  data-toggle="collapse"
                  data-target="#collapseComment"
                  aria-expanded="false"
                  aria-controls="collapseComment"
                >
                  Skelbti
                </button>
              </form>
            </div>
          </Collapse>
        </div>
      </React.Fragment>
    );

    const report = (
      <React.Fragment>
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
      </React.Fragment>
    );

    return (
      <div className="info">
        <div className="row">
          <div className="col-lg-7">
            <div className="row">
              <div className="col-lg-3 info-description" />
              <div className="col-lg-9">
                <p className="info--big">
                  {this.props.car.brand}
                  <span className="m--no-wrap light-text">
                    {" "}
                    {this.props.car.model}
                    <span
                      onClick={this.handleLikeSubmit}
                      className="card-like card-like--position"
                    >
                      <i
                        className={
                          (this.isLiked() ? "fas" : "far") + " fa-heart"
                        }
                      />
                    </span>
                  </span>
                </p>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-3 info-description">Vieta</div>
              <div className="col-lg-9">
                <p className="info--normal">{this.props.car.city}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-3 info-description">Aprašymas</div>
              <div className="col-lg-9">
                <p className="info--normal">{this.props.car.description}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-3 info-description">Savininkas</div>
              <div className="flex align-center owner-info justify-left col-lg-9">
                <p className="info--normal flex align-center mr-4 color-primary info--owner info--owner-raise">
                  <i className="far fa-user-circle fa-2x color-black" />
                  {this.props.car.name}
                </p>
                <p className="info--normal info--owner info--owner-raise">
                  <i className="fas mr-1 fa-phone info--envelope" />
                  {this.props.car.phone}
                </p>
              </div>
            </div>
            <div className="row d-none d-lg-flex">{comments}</div>
          </div>
          <div className="col-lg-4  offset-lg-1 info-price">
            <span className="info-price--currency">€</span>
            <span className="info-price--value">{this.props.car.price}</span>
            <span className="info-price--small">parai</span>
            <div className="info-dates">
              <div className="form-group">
                <label className="" htmlFor="inputState">
                  Nuomos pradžia:
                </label>
                <div className="relative clearfix">
                  <DatePicker
                    className="form-control"
                    name="date_from"
                    autoComplete="off"
                    excludeDates={dates}
                    locale={"lt"}
                    selected={new Date(this.state.date_from)}
                    selectsStart
                    startDate={this.state.date_from}
                    endDate={this.state.date_until}
                    // rentDates[0] because currently there will be only one rented date
                    minDate={this.props.car.rentDates[0].rentedFrom}
                    maxDate={this.props.car.rentDates[0].rentedUntil}
                    onChange={e => this.handleFromChange(dates, e)}
                    onChangeRaw={this.handleDateChangeRaw}
                  />
                  <i className="fa fa-caret-down" aria-hidden="true" />
                </div>
                <label htmlFor="inputState">Nuomos pabaiga:</label>
                <div className="relative clearfix">
                  <DatePicker
                    className="form-control"
                    locale={"lt"}
                    name="date_until"
                    autoComplete="off"
                    excludeDates={dates}
                    selected={this.state.date_until}
                    selectsEnd
                    startDate={this.state.date_from}
                    endDate={new Date(this.state.date_until)}
                    minDate={this.props.car.rentDates[0].rentedFrom}
                    maxDate={this.props.car.rentDates[0].rentedUntil}
                    onChange={e => this.handleUntilChange(dates, e)}
                    onChangeRaw={this.handleDateChangeRaw}
                  />
                  <i className="fa fa-caret-down" aria-hidden="true" />
                </div>
              </div>
              <div className="input--error input--error-dates">
                {this.state.cannotReserveDates}
              </div>
            </div>
            <button
              onClick={this.handleSubmit}
              className="btn btn-warning info-button"
            >
              {this.state.reservationButtonText}
            </button>
            {this.state.showAlertWindow ? (
              <div onClick={this.handleAlert}>
                <Dialog
                  showSuccess={this.state.showSuccess}
                  alertHeader={this.state.alertHeader}
                  alertMessage={this.state.alertText}
                />
              </div>
            ) : null}
            <Collapse isOpen={this.state.reservationCollapse}>
              <div className="form-group form-group-separate">
                <p className=" color-gray mt-2 mb-2">
                  Preliminari kaina už laikotarpį:
                  <span className="color-primary">
                    {" "}
                    {this.state.totalPrice} €
                  </span>
                </p>
                <form id="clear-reservation-input">
                  <input
                    onChange={this.handleNameChange}
                    className="form-control"
                    type="text"
                    name="name"
                    placeholder="Įrašykite savo vardą"
                  />
                  {this.state.showReservationErrors ? (
                    <div className="input--error">
                      {this.state.validationErrors.name}
                    </div>
                  ) : null}
                  <input
                    onChange={this.handleEmailChange}
                    className="form-control"
                    type="email"
                    name="email"
                    placeholder="Įrašykite savo el. paštą"
                  />
                  {this.state.showReservationErrors ? (
                    <div className="input--error">
                      {this.state.validationErrors.email}
                    </div>
                  ) : null}
                  <input
                    onChange={this.handlePhoneChange}
                    className="form-control"
                    type="text"
                    name="phone"
                    placeholder="+370"
                  />
                  {this.state.showReservationErrors ? (
                    <div className="input--error">
                      {this.state.validationErrors.phone}
                    </div>
                  ) : null}
                  <div className="form-group">
                    <textarea
                      onChange={this.handleMessageChange}
                      className="form-control"
                      placeholder="Žinutė pardavėjui..."
                    />
                    {this.state.showReservationErrors ? (
                      <div className="input--error">
                        {this.state.validationErrors.message}
                      </div>
                    ) : null}
                  </div>
                </form>
              </div>
            </Collapse>
            <div className="d-none d-lg-block">
              <hr />
              {report}
            </div>
            <div className="d-lg-none">{comments}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default carInfo;
