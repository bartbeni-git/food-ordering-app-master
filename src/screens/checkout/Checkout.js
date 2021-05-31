import React, { Component } from "react";
import { Redirect } from "react-router";
import Header from "../../common/header/Header";
import * as Utils from "../../common/Utils";
import * as Constants from "../../common/Constants";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import GridList from "@material-ui/core/GridList";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import IconButton from "@material-ui/core/IconButton";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import CloseIcon from '@material-ui/icons/Close';

import "./Checkout.css";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Snackbar,
} from "@material-ui/core";

class Checkout extends Component {
  constructor() {
    super();
    this.state = {
      shouldRedirectToHome: sessionStorage.getItem("access-token") === null, // Non logged in user should be redirected to home
      addresses: [],
      newAddress: null,
      cart: JSON.parse(window.localStorage.getItem("cart")), // Cart preserved from the restaurant details page
      restaurantData: JSON.parse(window.localStorage.getItem("restaurantData")), // Restaurant data which was used for placing order
      activeStep: 0, // Used as default step by material-ui stepper
      addressPanelVal: 0, // To display the first tab panel in address tabs step
      selectedAddressId: null, // Meant to store the address UUID selected by customer for delivery
      addressForm: {
        stateUuid: "",
        locality: "",
        city: "",
        pincode: "",
        flatBuildingName: "",
      }, // Preserves the state of form meant to add new address
      statesList: [], // List of all available states
      paymentsList: [], // List of all available payment types
      selectedPaymentId: "", // Uuid of the payment method selected by customer
      // Following are common attributes for snackbar
      snackBarOpen: false,
      snackBarText: '',
    };

    this.placeOrder = this.placeOrder.bind(this);
    this.handleSnackBarClose = this.handleSnackBarClose.bind(this);
  }

  //Snack bar close common handler
  handleSnackBarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ snackBarOpen: false, snackBarText: '' })
  }

  fetchAddressList() {
    const requestUrlForAddressList = this.props.baseUrl + "address/customer";
    const that = this;
    Utils.makeApiCall(
      requestUrlForAddressList,
      null,
      null,
      Constants.ApiRequestTypeEnum.GET,
      null,
      (responseText) => {
        that.setState({
          addresses: JSON.parse(responseText).addresses || [],
          addressPanelVal: 0, // Switching back to the address tab
        });
      },
      () => {
        // Any failure to fetch addresses should result in redirect to home page
        that.setState({
          shouldRedirectToHome: true,
        });
      }
    );
  }

  componentDidMount() {
    this.fetchAddressList();
    const requestUrlForStatesList = this.props.baseUrl + "states";
    const requestUrlForPaymentsList = this.props.baseUrl + "payment";
    const that = this;
    Utils.makeApiCall(
      requestUrlForStatesList,
      null,
      null,
      Constants.ApiRequestTypeEnum.GET,
      null,
      (responseText) => {
        that.setState({
          statesList: JSON.parse(responseText).states || [],
        });
      },
      (e) => {
        console.error("Failed to fetch states!", e);
      }
    );
    Utils.makeApiCall(
      requestUrlForPaymentsList,
      null,
      null,
      Constants.ApiRequestTypeEnum.GET,
      null,
      (responseText) => {
        that.setState({
          paymentsList: JSON.parse(responseText).paymentMethods || [],
        });
      },
      (e) => {
        console.error("Failed to fetch payments!", e);
      }
    );
  }

  // Returns saved address grid
  getSavedAddresses() {
    const addresses = this.state.addresses;
    if (addresses.length === 0) {
      return (
        <Typography variant="body2" style={{ color: "#757575" }}>
          There are no saved addresses! You can save an address using the 'New
          Address' tab or using your 'Profile menu option.'
        </Typography>
      );
    }

    const customClasses = {
      grid: {
        root: "address-grid",
      },
    };
    const that = this;
    return (
      <div className="address-grid-ctr">
        <GridList classes={customClasses.grid} spacing={10} cols={2.5}>
          {addresses.map((address) => {
            const color =
              that.state.selectedAddressId === address.id
                ? { color: "green" }
                : { color: "inherit" };
            return (
              <div key={address.id} className="address-card-root-tile">
                <Typography variant="body2" gutterBottom>
                  {address.flat_building_name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {address.locality}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {address.city}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {address.state.state_name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {address.pincode}
                </Typography>
                <div className="action-bar">
                  <IconButton
                    aria-label="Select address"
                    onClick={() =>
                      that.setState({ selectedAddressId: address.id })
                    }
                  >
                    <CheckCircleIcon
                      className={
                        address.id === this.state.selectedAddressId
                          ? "selected"
                          : ""
                      }
                      style={color}
                    />
                  </IconButton>
                </div>
              </div>
            );
          })}
        </GridList>
      </div>
    );
  }

  handleSaveAddress() {
    const isFlatBuildingNameMissing = !(
      this.state.addressForm.flatBuildingName &&
      this.state.addressForm.flatBuildingName.length > 0
    );
    const isLocalityMissing = !(
      this.state.addressForm.locality &&
      this.state.addressForm.locality.length > 0
    );
    const isCityMissing = !(
      this.state.addressForm.city && this.state.addressForm.city.length > 0
    );
    const isStateUuidMissing = !(
      this.state.addressForm.stateUuid &&
      this.state.addressForm.stateUuid.length > 0
    );
    const isPincodeMissing = !(
      this.state.addressForm.pincode &&
      this.state.addressForm.pincode.length > 0
    );
    const isPincodeInvalid =
      !isPincodeMissing &&
      !(
        parseInt(this.state.addressForm.pincode) > 100000 &&
        parseInt(this.state.addressForm.pincode) < 999999
      );

    const updatedAddressForm = Object.assign(this.state.addressForm, {
      isFlatBuildingNameMissing,
      isLocalityMissing,
      isCityMissing,
      isStateUuidMissing,
      isPincodeMissing,
      isPincodeInvalid,
    });

    const shouldSaveAddress =
      !isFlatBuildingNameMissing &&
      !isLocalityMissing &&
      !isCityMissing &&
      !isStateUuidMissing &&
      !isPincodeMissing &&
      !isPincodeInvalid;
    this.setState({ addressForm: updatedAddressForm });

    if (shouldSaveAddress) {
      const requestUrlForAddressSave = this.props.baseUrl + "address";
      const accessToken = window.sessionStorage.getItem("access-token");
      const authorization = `Bearer ${accessToken}`;

      fetch(requestUrlForAddressSave, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization,
        },
        body: JSON.stringify({
          city: this.state.addressForm.city,
          flat_building_name: this.state.addressForm.flatBuildingName,
          locality: this.state.addressForm.locality,
          pincode: this.state.addressForm.pincode,
          state_uuid: this.state.addressForm.stateUuid,
        }),
      })
        .then(() => this.fetchAddressList())
        .catch((e) => console.error("Failed to add this address", e));
    }
  }

  getAddressForm() {
    const customClasses = {
      FormControl: {
        root: "address-form-conrol",
      },
      Label: {
        root: "address-form-conrol__label",
      },
      Input: {
        root: "address-form-conrol__input",
      },
      Select: {
        root: "address-form-conrol__select-root",
        select: "address-form-conrol__select",
      },
    };
    return (
      <div className="address-form-ctr">
        <FormControl classes={customClasses.FormControl} required>
          <InputLabel classes={customClasses.Label} htmlFor="flatBuildingName">
            Flat / Building No.
          </InputLabel>
          <Input
            classes={customClasses.Input}
            id="flatBuildingName"
            type="text"
            defaultValue={this.state.addressForm.flatBuildingName}
            onChange={(e) => {
              const flatBuildingName = e.target.value;
              const updatedAddressForm = Object.assign(this.state.addressForm, {
                flatBuildingName,
              });
              this.setState({ addressForm: updatedAddressForm });
            }}
          />
          {this.state.addressForm.isFlatBuildingNameMissing && (
            <FormHelperText error={true}>
              <span className="red">required</span>
            </FormHelperText>
          )}
        </FormControl>
        <FormControl classes={customClasses.FormControl} required>
          <InputLabel classes={customClasses.Label} htmlFor="locality">
            Locality
          </InputLabel>
          <Input
            classes={customClasses.Input}
            id="locality"
            type="text"
            defaultValue={this.state.addressForm.locality}
            onChange={(e) => {
              const locality = e.target.value;
              const updatedAddressForm = Object.assign(this.state.addressForm, {
                locality,
              });
              this.setState({ addressForm: updatedAddressForm });
            }}
          />
          {this.state.addressForm.isLocalityMissing && (
            <FormHelperText error={true}>
              <span className="red">required</span>
            </FormHelperText>
          )}
        </FormControl>
        <FormControl classes={customClasses.FormControl} required>
          <InputLabel classes={customClasses.Label} htmlFor="city">
            City
          </InputLabel>
          <Input
            classes={customClasses.Input}
            id="city"
            type="text"
            defaultValue={this.state.addressForm.city}
            onChange={(e) => {
              const city = e.target.value;
              const updatedAddressForm = Object.assign(this.state.addressForm, {
                city,
              });
              this.setState({ addressForm: updatedAddressForm });
            }}
          />
          {this.state.addressForm.isCityMissing && (
            <FormHelperText error={true}>
              <span className="red">required</span>
            </FormHelperText>
          )}
        </FormControl>
        <FormControl classes={customClasses.FormControl} required>
          <InputLabel classes={customClasses.Label} id="state-id-label">
            State
          </InputLabel>
          <Select
            labelId="state-id-label"
            id="stateUuid"
            value={this.state.addressForm.stateUuid}
            autoWidth={true}
            classes={customClasses.Select}
            onChange={(e) => {
              const stateUuid = e.target.value;
              const updatedAddressForm = Object.assign(this.state.addressForm, {
                stateUuid,
              });
              this.setState({ addressForm: updatedAddressForm });
            }}
          >
            {this.state.statesList.length > 0 &&
              this.state.statesList.map(({ id, state_name }) => (
                <MenuItem value={id} key={id}>
                  {state_name}
                </MenuItem>
              ))}
          </Select>
          {this.state.addressForm.isStateUuidMissing && (
            <FormHelperText error={true}>
              <span className="red">required</span>
            </FormHelperText>
          )}
        </FormControl>
        <FormControl classes={customClasses.FormControl} required>
          <InputLabel classes={customClasses.Label} htmlFor="pincode">
            Pincode
          </InputLabel>
          <Input
            classes={customClasses.Input}
            id="pincode"
            type="text"
            defaultValue={this.state.addressForm.pincode}
            onChange={(e) => {
              const pincode = e.target.value;
              const updatedAddressForm = Object.assign(this.state.addressForm, {
                pincode,
              });
              this.setState({ addressForm: updatedAddressForm });
            }}
          />
          {this.state.addressForm.isPincodeMissing && (
            <FormHelperText error={true}>
              <span className="red">required</span>
            </FormHelperText>
          )}
          {this.state.addressForm.isPincodeInvalid && (
            <FormHelperText error={true}>
              <span className="red">
                Pincode must contain only number and must be 6 digits long
              </span>
            </FormHelperText>
          )}
        </FormControl>
        <FormControl>
          <Button
            onClick={() => this.handleSaveAddress()}
            variant="contained"
            color="secondary"
          >
            SAVE ADDRESS
          </Button>
        </FormControl>
      </div>
    );
  }

  // Returns action buttons for Address step
  getAddressStepActionBar() {
    return (
      <div className="action-ctr">
        <Button disabled style={{ marginRight: 16 }}>
          BACK
        </Button>
        <Button
          variant="contained"
          color="primary"
          style={{ marginRight: 16 }}
          onClick={() => {
            if (this.state.selectedAddressId) {
              this.setState({
                activeStep: 1, // Takes the stepper to payment step
              });
            } else {
              console.error("Please select an address first");
            }
          }}
        >
          NEXT
        </Button>
      </div>
    );
  }

  // Returns HTML for address step
  getAddressStep() {
    // Event handler for click on address bar tabs
    const handleChange = (event, newValue) => {
      this.setState({ addressPanelVal: newValue });
    };
    const panelVal = this.state.addressPanelVal;
    return (
      <div className="address-blk-ctr">
        <AppBar position="static">
          <Tabs value={panelVal} onChange={handleChange}>
            <Tab label="EXISTING ADDRESS" />
            <Tab label="NEW ADDRESS" />
          </Tabs>
        </AppBar>
        <div className="tab-panel" role="tab-panel" hidden={panelVal !== 0}>
          {this.getSavedAddresses()}
        </div>
        <div className="tab-panel" role="tab-panel" hidden={panelVal !== 1}>
          {this.getAddressForm()}
        </div>
        {this.getAddressStepActionBar()}
      </div>
    );
  }

  // Returns action buttons for Payment step
  getPaymentStepActionBar() {
    return (
      <div className="action-ctr">
        <Button
          style={{ marginRight: 16 }}
          onClick={() => {
            this.setState({
              activeStep: 0, // Takes the stepper to payment step
            });
          }}
        >
          BACK
        </Button>
        <Button
          variant="contained"
          color="primary"
          style={{ marginRight: 16 }}
          onClick={() => {
            if (this.state.selectedPaymentId) {
              this.setState({ activeStep: 2 });
            } else {
              console.error("Please select a payment mode first");
            }
          }}
        >
          FINISH
        </Button>
      </div>
    );
  }

  getPaymentStep() {
    const paymentOptions = this.state.paymentsList.map(
      ({ id, payment_name }) => (
        <FormControlLabel
          value={id}
          key={id}
          control={<Radio />}
          label={payment_name}
        />
      )
    );
    const that = this;
    return (
      <div className="payments-blk-ctr">
        <FormControl component="fieldset">
          <FormLabel component="legend">Select Mode of Payment</FormLabel>
          <RadioGroup
            aria-label="gender"
            name="gender1"
            value={this.state.selectedPaymentId}
            onChange={(e) =>
              that.setState({ selectedPaymentId: e.target.value })
            }
          >
            {paymentOptions}
          </RadioGroup>
        </FormControl>
        {this.getPaymentStepActionBar()}
      </div>
    );
  }

  getCheckoutStepper() {
    const steps = ["Delivery", "Payment"];
    const stepContent = steps.map((step, idx) => {
      if (idx === 0) {
        return this.getAddressStep();
      } else {
        return this.getPaymentStep();
      }
    });
    return (
      <Stepper activeStep={this.state.activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>{stepContent[index]}</StepContent>
          </Step>
        ))}
      </Stepper>
    );
  }

  placeOrder() {
    if(!this.state.selectedAddressId) {
      this.setState({ snackBarOpen: true, snackBarText: 'Please select an address first' });
      return;
    }
    if(!this.state.selectedPaymentId) {
      this.setState({ snackBarOpen: true, snackBarText: 'Please select payment mode first' });
      return;
    }

    let totalBill = 0;
    const itemQuantities = this.state.cart.map(({id, price, quantity}) => {
      totalBill += quantity*price;
      return {
        item_id: id,
        price,
        quantity
      }
    });
    const saveOrderRequest = {
      "address_id": this.state.selectedAddressId,
      "bill": totalBill,
      "coupon_id": "",
      "discount": 0,
      "item_quantities": itemQuantities,
      "payment_id": this.state.selectedPaymentId,
      "restaurant_id": this.state.restaurantData.id,
    }
    const requestUrlForOrderPlacement = this.props.baseUrl + "order";
    const accessToken = window.sessionStorage.getItem("access-token");
    const authorization = `Bearer ${accessToken}`;

    fetch(requestUrlForOrderPlacement, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization,
      },
      body: JSON.stringify(saveOrderRequest),
    })
    .then(response => response.json())
    .then(({id}) => {
      if(!id) { throw new Error('Order failed')}
      this.setState({ snackBarOpen: true, snackBarText: 'Order placed successfully! Your order ID is '+id });
    })
    .catch((e) => {
      console.error('Failed to place order', e);
      this.setState({ snackBarOpen: true, snackBarText: 'Unable to place your order! Please try again!' });
    });
  }

  getCartSummary() {
    let bill = 0;
    const cartItemRows = this.state.cart.map(
      ({ id, item_name, price, item_type, quantity }) => {
        const itemClassName = item_type === "NON_VEG" ? "red-dot" : "green-dot";
        const totalPrice = price * quantity;
        bill += totalPrice;
        return (
          <li className="cart-item-list-item" key={id}>
            <div className="cart-item-blk">
              <span className={"dot " + itemClassName}></span>
            </div>
            <div className="cart-item-blk">{item_name}</div>
            <div className="cart-item-blk">{quantity}</div>
            <div className="cart-item-blk price"><i className="fa fa-inr" aria-hidden="true"></i>{totalPrice}</div>
          </li>
        );
      }
    );
    return (
      <Card
        classes={{
          root: "summary-card",
        }}
      >
        <CardHeader
          title="Summary"
          titleTypographyProps={{ variant: "h5" }}
          style={{ marginBottom: 16 }}
        />
        <CardContent>
          <Typography variant="body1" gutterBottom>
            {this.state.restaurantData.restaurant_name}
          </Typography>
          <ul className="cart-item-list">{cartItemRows}</ul>
          <Divider
            variant="fullWidth"
            style={{ marginTop: 10, marginBottom: 10 }}
          />
          <ul className="cart-summary-list">
            <li className="cart-item-list-item">
              <div className="cart-item-blk">
                <Typography variant="h6" gutterBottom>
                  Net Amount
                </Typography>
              </div>
              <div className="cart-item-blk price">
                <Typography variant="h6" gutterBottom>
                  <i className="fa fa-inr" aria-hidden="true"></i>{bill}
                </Typography>
              </div>
            </li>
          </ul>
        </CardContent>
        <CardActions>
          <Button variant="contained" color="primary" fullWidth={true} onClick={this.placeOrder}>
            PLACE ORDER
          </Button>
        </CardActions>
      </Card>
    );
  }

  render() {
    if (this.state.shouldRedirectToHome) {
      sessionStorage.clear();
      // Redirect to home if this flag is set to true
      return <Redirect from="/checkout" to="/" />;
    }
    const checkoutStepper = this.getCheckoutStepper();
    const cartSummaryComponent = this.getCartSummary();
    return (
      <div>
        <Header baseUrl={this.props.baseUrl} history={this.props.history} />
        <div className="checkout-container">
          <Grid container spacing={10}>
            <Grid item xs={12} sm={6} style={{ paddingRight: "0" }}>
              {checkoutStepper}

              {this.state.activeStep > 1 && (
                <div className="final-step">
                  <Typography variant="h5" gutterBottom>
                    View the summary {"&"} place your order now!
                  </Typography>
                  <Button
                    onClick={() => {
                      this.setState({
                        activeStep: 0, // Takes the stepper to payment step
                      });
                    }}
                  >
                    CHANGE
                  </Button>
                </div>
              )}
            </Grid>
            <Grid item xs={12} sm={6} style={{ paddingRight: "0" }}>
              {cartSummaryComponent}
            </Grid>
          </Grid>
        </div>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.snackBarOpen}
          autoHideDuration={6000}
          onClose={this.handleSnackBarClose}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.state.snackBarText}</span>}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={this.handleSnackBarClose}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </div>
    );
  }
}

export default Checkout;
