# react-web3-provider
Simple higher-order component (HOC) providing a web3 context to React app.

Detects whether the user is using MetaMask or Ethereum wallet-enabled browser. If not, it will access the Ethereum network through a given RPC (e.g. INFURA node).

## Installation

```sh
$ yarn add react-web3-provider
```

## Usage

Add the `Web3Provider` to your root React component:

```js
import Web3Provider from 'react-web3-provider';

ReactDOM.render(
	<Web3Provider defaultWeb3Provider="https://mainnet.infura.io/YOUR_API_KEY" loading="Loading...">
		<App />
	</Web3Provider>
)
```

Then in component where you want to use Web3:
```js
import { withWeb3 } from 'react-web3-provider';

class MyComponent {
	render() {
		const { web3 } = this.props;

		web3.eth.getAccounts(console.log);

		// Version 1.0.0-beta.35
		return "Web3 version: {web3.version}";
	}
}

export default withWeb3(MyComponent);
```
