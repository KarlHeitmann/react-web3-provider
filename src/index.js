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

  setWeb3(web3) {
    this.setState({ web3 });

    web3.eth.net.isListening()
      .then(() => this.setState({ error: false }))
      .catch(error => this.setState({ error }));
  }

  componentDidMount() {
    if (window.web3) {
      // Use MetaMask using global window object
      this.setWeb3(new Web3(window.web3));
    } else if (Web3.givenProvider) {
      // Use wallet-enabled browser provider
      this.setWeb3(new Web3(Web3.givenProvider));
    } else {
      // RPC fallback (e.g. INFURA node)
      this.setWeb3(new Web3(new Web3.providers.HttpProvider(this.props.defaultWeb3Provider)))

      // Breaking changes in MetaMask => see: https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
      // Listen for provider injection
      window.addEventListener('message', ({ data }) => {
        if (data && data.type && data.type === 'ETHEREUM_PROVIDER_SUCCESS') {
          this.setWeb3(new Web3(window.ethereum));
        }
      });

      // Request provider
      window.postMessage({ type: 'ETHEREUM_PROVIDER_REQUEST' }, '*');
    }
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
