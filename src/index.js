import React from "react";
import PropTypes from "prop-types";

class AccountKit extends React.Component {
  constructor(props) {
    super(props);
    this.signIn = this.signIn.bind(this);
    this.state = {
      disabled: false,
      isMounted: false,
    };
  }

  componentDidMount() {
    
    if (!window.AccountKit) {
      (cb => {
        const tag = document.createElement("script");
        tag.setAttribute(
          "src",
          `https://sdk.accountkit.com/${this.props.language}/sdk.js`
        );
        tag.setAttribute("id", "account-kit");
        tag.setAttribute("type", "text/javascript");
        tag.onload = cb;
        document.head.appendChild(tag);
      })(() => {
        this.setState({
          isMounted: true,
        }, () => {
          window.AccountKit_OnInteractive = this.onLoad.bind(this);
        })
      });
    }
  }

  onLoad() {
    const { appId, csrf, version, debug, display, redirect } = this.props;
    window.AccountKit.init({
      appId,
      state: csrf,
      version,
      debug,
      display,
      redirect,
      fbAppEventsEnabled: false
    });
    if (this.state.isMounted) {
      this.setState({
        disabled: false
      });
    }
  }

  componentWillUnmount() {
    this.setState({
      isMounted: false,
    })
  }

  signIn() {
    if (this.state.disabled) {
      return;
    }
    const {
      loginType,
      onResponse,
      countryCode,
      phoneNumber,
      emailAddress,
    } = this.props;

    const options = {};
    if (countryCode) {
      options.countryCode = countryCode;
    }

    if (loginType === "PHONE" && phoneNumber) {
      options.phoneNumber = phoneNumber;
    } else if (loginType === "EMAIL" && emailAddress) {
      options.emailAddress = emailAddress;
    }

    window.AccountKit.login(loginType, options, resp => onResponse(resp));
  }

  render() {
    const disabled = this.state.disabled || this.props.disabled;
    return this.props.children({
      onClick: () => {
        this.signIn();
      },
      disabled
    });
  }
}

AccountKit.propTypes = {
  csrf: PropTypes.string.isRequired,
  appId: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired,
  onResponse: PropTypes.func.isRequired,
  loginType: PropTypes.oneOf(["PHONE", "EMAIL"]),
  debug: PropTypes.bool,
  disabled: PropTypes.bool,
  display: PropTypes.oneOf(["popup", "modal"]),
  redirect: PropTypes.string,
  language: PropTypes.string,
  countryCode: PropTypes.string,
  phoneNumber: PropTypes.string,
  emailAddress: PropTypes.string
};

AccountKit.defaultProps = {
  debug: false,
  disabled: false,
  display: "popup",
  language: "en_US",
  loginType: "PHONE"
};

export default AccountKit;
