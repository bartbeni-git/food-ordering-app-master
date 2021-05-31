import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import StarRateIcon from "@material-ui/icons/StarRate";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import CardActions from "@material-ui/core/CardActions";

import Header from "../../common/header/Header";
import "./Details.css";

let bill = 0;

class Details extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null, // Stores restraunt details
      id: this.props.match.params.id, // Restaurant ID passed down by react router,
      cart: {}, // An object which has menu item ID and quantity
      menuItemsMap: {}, // Stoes are all menu with id as key and their prices, name & type.
      redirectToCheckout: false, // Boolean flag to trigger
    };
    this.handleOrder = this.handleOrder.bind(this);
  }

  // Retruns an aggregated list of all menut items across all categories
  getMenutItems(data) {
    const menuItemsMap = {};
    data.categories
      .reduce((prev, next) => {
        return [...prev, ...next.item_list];
      }, [])
      .forEach(({ id, item_name, price, item_type }) => {
        menuItemsMap[id] = { item_name, price, item_type };
      });

    return menuItemsMap;
  }

  componentDidMount() {
    fetch(`${this.props.baseUrl}restaurant/${this.state.id}`)
      .then((res) => res.json())
      .then((restaurantData) => {
        const menuItemsMap = this.getMenutItems(restaurantData);
        this.setState({
          data: restaurantData,
          menuItemsMap,
        });
      })
      .catch((e) => console.error(e));
  }

  getMenuItemsList(item_list) {
    const items = item_list.map((item) => {
      const itemColor =
        item.item_type.toUpperCase() === "VEG" ? "green" : "red";
      const priceLabel = (
        <span>
          <i className="fa fa-inr" aria-hidden="true"></i>
          {item.price}
        </span>
      );
      const itemClasses = {
        root: "item-root",
        primary: "item-primary",
        secondary: "item-secondary",
      };
      return (
        <ListItem key={item.id}>
          <ListItemIcon style={{ color: itemColor }}>
            <FiberManualRecordIcon color="inherit" />
          </ListItemIcon>
          <ListItemText
            classes={itemClasses}
            primary={item.item_name}
            secondary={priceLabel}
          />
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              aria-label="Add to cart"
              style={{ marginRight: 24 }}
              onClick={() => {
                const updatedCart = { ...this.state.cart };

                if (!updatedCart[item.id]) {
                  updatedCart[item.id] = 1;
                } else {
                  updatedCart[item.id] += 1;
                }

                this.setState({
                  cart: updatedCart,
                });
              }}
            >
              <AddIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      );
    });

    return <List dense={true}>{items}</List>;
  }

  // Returns the entire menu card split by category
  getMenuCard() {
    const { categories = [] } = this.state.data;
    return categories.map((category) => {
      const menuItemsList = this.getMenuItemsList(category.item_list);
      return (
        <div key={category.id} className="category-ctr">
          <Typography variant="overline" display="block" gutterBottom>
            {category.category_name}
          </Typography>
          <Divider variant="middle" />
          {menuItemsList}
        </div>
      );
    });
  }

  getRaingBlock() {
    const { customer_rating, number_customers_rated } = this.state.data;
    return (
      <div>
        <p style={{'display': 'flex', alignItems: 'center'}}>
          <StarRateIcon style={{marginTop: 0  }}/> {customer_rating}
        </p>
        <p>
          Average rating by <b>{number_customers_rated}</b> customers
        </p>
      </div>
    );
  }

  getCostBlock() {
    const { average_price } = this.state.data;
    return (
      <div>
        <p>
          <i className="fa fa-inr" aria-hidden="true"></i>
          {average_price}
        </p>
        <p>Average cost for two people</p>
      </div>
    );
  }

  // Returns restaurant cover card with restaurant info for top of the pafe
  getRestaurantCover() {
    const { restaurant_name, address, categories, photo_URL } = this.state.data;
    const { locality } = address;
    const categoryList = categories
      .map(({ category_name }) => category_name)
      .join(" , ");
    const ratingBlock = this.getRaingBlock();
    const costBlock = this.getCostBlock();
    return (
      <div className="restaurant-cover-section">
        <Grid container spacing={10}>
          <Grid item xs={12} sm={3}>
            <div className="image-ctr">
              <img src={photo_URL} alt={restaurant_name} />
            </div>
          </Grid>
          <Grid item xs={12} sm={9}>
            <div className="info-ctr">
              <Typography variant="h5" gutterBottom>
                {restaurant_name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {locality}
              </Typography>
              <Typography variant="body2" gutterBottom>
                {categoryList}
              </Typography>
              <Grid container>
                <Grid item xs={6}>
                  {ratingBlock}
                </Grid>
                <Grid item xs={6}>
                  {costBlock}
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }

  // Reads cart items from state, transforms it into a JS object which could be used to render HTML
  getCartItemsJson() {
    const cart = this.state.cart;
    const cartItemIds = Object.keys(cart);
    const menuItemsMap = this.state.menuItemsMap;

    return cartItemIds.map((id) => {
      const itemDetails = menuItemsMap[id];
      const quantity = cart[id];

      return {
        id,
        ...itemDetails,
        quantity,
      };
    });
  }

  // Returns cart item rows
  getCartItemRows(cartItems) {
    bill = 0; // Reset bill every time items are rendered
    return cartItems.map(({ id, item_name, price, item_type, quantity }) => {
      const itemClassName = item_type === "NON_VEG" ? "red-dot" : "green-dot";
      const totalPrice = price * quantity;
      bill += price * quantity;
      return (
        <li className="cart-item-list-item" key={id}>
          <div className="cart-item-blk">
            <span className={"dot " + itemClassName}></span>
          </div>
          <div className="cart-item-blk">{item_name}</div>
          <div className="cart-item-blk action-container">
            <IconButton
              key="remove"
              aria-label="Close"
              color="inherit"
              onClick={() => {
                const updatedCart = { ...this.state.cart };

                if (updatedCart[id] === 1) {
                  delete updatedCart[id];
                } else {
                  updatedCart[id] -= 1;
                }

                this.setState({
                  cart: updatedCart,
                });
              }}
            >
              <RemoveIcon />
            </IconButton>
            <span class="cart-item-label">{quantity}</span>
            <IconButton
              key="add"
              aria-label="Close"
              color="inherit"
              onClick={() => {
                const updatedCart = { ...this.state.cart };

                updatedCart[id] += 1;

                this.setState({
                  cart: updatedCart,
                });
              }}
            >
              <AddIcon />
            </IconButton>
          </div>
          <div className="cart-item-blk price">
            <i className="fa fa-inr" aria-hidden="true"></i>
            {totalPrice}
          </div>
        </li>
      );
    });
  }

  handleOrder() {
    const cartItems = this.getCartItemsJson();

    if (cartItems.length === 0) {
      return;
    }
    //Saving cart and restaurant details in localstorage for checkout page
    window.localStorage.setItem("cart", JSON.stringify(cartItems));
    window.localStorage.setItem(
      "restaurantData",
      JSON.stringify(this.state.data)
    );
    this.props.history.push("/checkout/");
  }

  // Returns Cart UI contained in Card object
  getCartSection() {
    const cartSize = Object.keys(this.state.cart).reduce(
      (prev, itemId) => prev + this.state.cart[itemId],
      0
    );
    const cartItemRows = this.getCartItemRows(this.getCartItemsJson());
    return (
      <Card style={{padding: 16}}>
        <CardHeader
          avatar={
            <Avatar
              aria-label="Cart"
              style={{
                backgroundColor: "transparent",
                color: "black",
                padding: 8,
                overflow: "initial",
              }}
            >
              <Badge badgeContent={cartSize} color="primary">
                <ShoppingCartIcon />
              </Badge>
            </Avatar>
          }
          title="My Cart"
          titleTypographyProps={{ variant: "h5" }}
          style={{paddingLeft: 0, paddingRight: 0}}
        />
        <CardContent style={{paddingLeft: 0, paddingRight: 0}}>
          <ul className="cart-item-list">{cartItemRows}</ul>
          <ul className="cart-summary-list">
            <li className="cart-item-list-item">
              <div className="cart-item-blk">
                <Typography variant="h6" gutterBottom>
                  TOTAL AMOUNT
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
          <Button
            variant="contained"
            color="primary"
            fullWidth={true}
            onClick={this.handleOrder}
          >
            CHECKOUT
          </Button>
        </CardActions>
      </Card>
    );
  }
  // Returns the bottom half of details which is menu and cart
  getOrderingSection() {
    const menuCard = this.getMenuCard();
    const cartComponent = this.getCartSection();
    return (
      <Grid container spacing={10}>
        <Grid item xs={12} sm={6} style={{ padding: 50 }}>
          {menuCard}
        </Grid>
        <Grid item xs={12} sm={6} style={{ padding: 50 }}>
          {cartComponent}
        </Grid>
      </Grid>
    );
  }

  render() {
    const hasData = this.state.data !== null;
    const restaurantCover = hasData ? this.getRestaurantCover() : "";
    const orderingSection = hasData ? this.getOrderingSection() : "";
    return (
      <div>
        <Header />
        {hasData && (
          <div className="details-container">
            {restaurantCover}
            {orderingSection}
          </div>
        )}
      </div>
    );
  }
}

export default Details;
