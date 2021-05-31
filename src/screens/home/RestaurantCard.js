import React from "react";
import "./RestaurantCard.css";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import { withRouter } from "react-router-dom";

// Restaturant Card 
const RestaurantCard = function (props) {
  const index = props.index;
  const classes = props.classes;
  const customClasses = {
    cardMedia : {
      root: 'card-media-root',
      media: 'card-media',
      img: 'card-media-img'
    }
  }
  return (
    //Card for details page
    <Card
      className={classes.resCard}
      key={index}
      onClick={() => {
        let detailsPageUrl = "/restaurant/" + props.resId;
        return props.history.push(detailsPageUrl);
      }}
    >
  {/* Style for Card */}
      <CardMedia
        component="img"
        alt={props.resName}
        image={props.resURL}
        style={{height: '280'}}
        classes= {customClasses.cardMedia}
      />
      {/* Style for Card Content */}
      <CardContent>
        <div className='name-ctr'>
        <Typography gutterBottom variant="h4" component="h2">
          {props.resName}
        </Typography>
        </div>
        <div className='category-ctr'>
        <Typography gutterBottom variant="h6">
          {props.resFoodCategories}
        </Typography>
        </div>

        <div className="rating-main-contnr">
          <div className="rating-bg-color">
            <span>
              <i className="fa fa-star"></i>
            </span>
            <span>
              {" "}
              {props.resCustRating} ({props.resNumberCustRated})
            </span>
          </div>
          <div className="avg-price">
            <span>
              <i className="fa fa-inr"></i>
              <span style={{ fontSize: "100%", fontWeight: "bold" }}>
                {props.avgPrice} for two{" "}
              </span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default withRouter(RestaurantCard);
