import React, { Component } from "react";
import Header from '../../common/header/Header';

class Profile extends Component{


    componentWillMount(){
        if(sessionStorage.getItem("access-token")===null || sessionStorage.getItem("access-token")==="null"){
            this.props.history.push({
                pathname: "/"
              });
        }
    }
    //Logout action from drop down menu on profile icon
    loginredirect = () => {
        sessionStorage.clear();
        this.props.history.push({
          pathname: "/"
        });
    }

    render(){
        return (     
            <div>
                <Header logoutHandler={this.loginredirect} baseUrl={this.props.baseUrl} showSearch={false} history={this.props.history} />
                <div>Profile Page</div>
            </div> 
        )
    }
}

export default Profile;