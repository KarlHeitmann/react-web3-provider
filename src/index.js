import React from 'react';
import Web3 from 'web3';
import PropTypes from 'prop-types';


const Web3Context = React.createContext(null);

class Web3Provider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      error: null,
    };
  }

  componentDidMount() {
    const web3 = new Web3(
      // Detect MetaMask using global window object
      window.web3 ?
      // Use MetaMask provider
      window.web3.currentProvider :
      // Use wallet-enabled browser provider
      Web3.givenProvider ||
      // Create a provider with Infura node
      new Web3.providers.HttpProvider(this.props.defaultWeb3Provider)
    );

    this.setState({ web3 });

    web3.eth.net.isListening()
      .then(() => this.setState({ error: false }))
      .catch(error => this.setState({ error }));
  }

  render() {
    if (this.state.web3 && this.state.error !== null) {
      if (this.state.error) {
        return this.props.error(this.state.error);
      } else {
        return (
          <Web3Context.Provider value={this.state.web3}>
            {this.props.children}
          </Web3Context.Provider>
        );
      }
    } else {
      return this.props.loading;
    }
  }
}

Web3Provider.propTypes = {
  defaultWeb3Provider: PropTypes.string.isRequired,
  loading: PropTypes.node,
  error: PropTypes.func,
};

export default Web3Provider;

export const withWeb3 = (WrappedComponent) => {
  return class extends React.Component {
    render() {
      return (
        <Web3Context.Consumer>
          {context =>
            <WrappedComponent web3={context} />
          }
        </Web3Context.Consumer>
      );
    }
  }
}
