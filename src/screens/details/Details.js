import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import StarRateIcon from "@material-ui/icons/StarRate";
import AddIcon from "@material-ui/icons/Add";
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
import { red } from "@material-ui/core/colors";

class Details extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null, // Stores restraunt details
      id: this.props.match.params.id, // Restaurant ID passed down by react router,
      cart: {}, // An object which has menu item ID and quantity
    };
  }

  componentDidMount() {
    fetch(`${this.props.baseUrl}restaurant/${this.state.id}`)
      .then((res) => res.json())
      .then((restaurantData) => {
        console.log(restaurantData);
        this.setState({
          data: restaurantData,
        });
      })
      .catch((e) => console.error(e));
  }

  getMenuItemsList(item_list) {
    const items = item_list.map((item) => {
      const itemColor =
        item.item_type.toUpperCase() === "VEG" ? "green" : "red";
      const priceLabel = `₹ ${item.price}`;
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
                const updatedCart = {...this.state.cart};

                if (!updatedCart[item.id]) {
                  updatedCart[item.id] = 1;
                } else {
                  updatedCart[item.id] += 1;
                }

                this.setState({
                  cart: updatedCart
                })
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
        <p>
          <StarRateIcon /> {customer_rating}
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
        <p>₹ {average_price}</p>
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

  // Returns Cart UI contained in Card object
  getCartSection() {
    const cartSize = Object.keys(this.state.cart).reduce((prev, itemId) => prev+this.state.cart[itemId], 0);
    return (
      <Card>
        <CardHeader
          avatar={
            <Avatar
              aria-label="Cart"
              style={{
                backgroundColor: "transparent",
                color: "black",
                padding: 12,
                overflow: 'initial'
              }}
            >
              <Badge badgeContent={cartSize} color="primary">
                <ShoppingCartIcon />
              </Badge>
            </Avatar>
          }
          title="My Cart"
          titleTypographyProps={{ variant: "h5" }}
        />
        <CardActions>
        <Button
          variant="contained"
          color="primary"
          fullWidth={true}
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
