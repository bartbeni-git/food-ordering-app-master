import React, { Component } from "react";
import Header from "../../common/header/Header";

class Checkout extends Component {
  constructor(){
    super();
    this.state = {            
        value:0, 
        activeStep : 0,            
        dataAddress:[],           
        selected:0,
        dataPayments:[],
        paymentMethod:"",
        dataStates:[], 
        flatBldNo : "",
        flatBldNoRequired : 'dispNone',
        locality:"",
        localityRequired : 'dispNone',
        city:"",
        cityRequired : 'dispNone',
        pincode:"",
        pincodeRequired : 'dispNone',
        saveAddressSuccess : false,
        saveAddressError : 'dispNone',
        saveAddressErrorMsg : '',
        checkOutAddressRequired : 'dispNone',
        selAddress : ""
    };
}
