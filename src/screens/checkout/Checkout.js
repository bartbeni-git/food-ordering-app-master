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

import "./Checkout.css";

class Checkout extends Component {
  constructor() {
    super();
    this.state = {
      shouldRedirectToHome: sessionStorage.getItem("access-token") === null,
      addresses: [],
      newAddress: null,
      cart: window.sessionStorage.getItem("cart"), // Cart preserved from the restaurant details page
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
    };
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
              console.log(this.state.addressForm);
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

  render() {
    if (this.state.shouldRedirectToHome) {
      sessionStorage.clear();
      // Redirect to home if this flag is set to true
      return <Redirect from="/checkout" to="/" />;
    }
    const checkoutStepper = this.getCheckoutStepper();
    return (
      <div>
        <Header baseUrl={this.props.baseUrl} history={this.props.history} />
        <div className="checkout-container">
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
        </div>
      </div>
    );
  }
}

export default Checkout;
