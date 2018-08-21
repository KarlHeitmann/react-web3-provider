import React from 'react';
import Web3 from 'web3';
import hoistNonReactStatics from 'hoist-non-react-statics';
import PropTypes from 'prop-types';


const Web3Context = React.createContext(null);

class Web3Provider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      connection: {
        connected: false,
        isLoading: true,
        error: null,
      }
    };
  }

  setWeb3(web3) {
    this.setState({ web3: new Web3(web3) }, () => {
      this.state.web3.eth.net.isListening()
      .then(() => this.setState({
        connection: {
          isConnected: true,
          isLoading: false,
          error: null
        }
      }))
      .catch(error => this.setState({
        connection: {
          isConnected: false,
          isLoading: false,
          error
        }
      }));
    });
  }

  componentDidMount() {
    if (window.web3) {
      // Use MetaMask using global window object
      this.setWeb3(window.web3);
    } else if (Web3.givenProvider) {
      // Use wallet-enabled browser provider
      this.setWeb3(Web3.givenProvider);
    } else {
      // RPC fallback (e.g. INFURA node)
      this.setWeb3(new Web3(new Web3.providers.HttpProvider(this.props.defaultWeb3Provider)))

      // Breaking changes in MetaMask => see: https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
      // Listen for provider injection
      window.addEventListener('message', ({ data }) => {
        if (data && data.type && data.type === 'ETHEREUM_PROVIDER_SUCCESS') {
          this.setWeb3(window.ethereum);
        }
      });

      // Request provider
      window.postMessage({ type: 'ETHEREUM_PROVIDER_REQUEST' }, '*');
    }
  }

  render() {
    const { web3, connection } = this.state;
    if (this.props.loading && connection.isLoading) {
      return this.props.loading;
    } else if (this.props.error && connection.error) {
      return this.props.error(connection.error);
    } else {
      return (
        <Web3Context.Provider value={{
          web3: this.state.web3,
          connection: this.state.connection,
        }}>
          {this.props.children}
        </Web3Context.Provider>
      );
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
  class Web3Consumer extends React.Component {
    render() {
      return (
        <Web3Context.Consumer>
          {context =>
            <WrappedComponent
              {...this.props}
              web3={context.web3}
              web3State={context.connection}
            />
          }
        </Web3Context.Consumer>
      );
    }
  }

  if (WrappedComponent.defaultProps) {
    Web3Consumer.defaultProps = { ...WrappedComponent.defaultProps };
  }

  return hoistNonReactStatics(Web3Consumer, WrappedComponent);
}
