# react-web3-provider
Simple higher-order component (HOC) providing a web3 context to React app.

Detects whether the user is using MetaMask or Ethereum wallet-enabled browser. If not, it will access the Ethereum network through a given RPC fallback (e.g. INFURA node).

Ready for the [upcoming changes](https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8) in MetaMask.

## Installation

```sh
$ yarn add react-web3-provider
```

## Basic usage

Add the `Web3Provider` to your root React component:
```js
import Web3Provider from 'react-web3-provider';

ReactDOM.render(
	<Web3Provider
		defaultWeb3Provider="https://mainnet.infura.io/YOUR_API_KEY"
		loading="Loading..."
		error={(err) => `Connection error: ${err.message}`}
	>
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

## Custom web3 state handling

You can render the web3 state somewhere else in the page instead of the global `loading` and `error` components:
```js
import Web3Provider from 'react-web3-provider';

ReactDOM.render(
	<Web3Provider
		defaultWeb3Provider="https://mainnet.infura.io/YOUR_API_KEY"
	>
		<App />
	</Web3Provider>
)
```


You can use the injected `web3State` property in your components:
```js
import { withWeb3 } from 'react-web3-provider';

class MyComponent {
	render() {
		const { web3, web3State } = this.props;

		return (
			<pre>
				{web3State.isConnected && "Connected!\n"}
				{web3State.isLoading && "Loading...\n"}
				{web3State.error && `Connection error: ${web3State.error.message}\n`}
				Web3 version: {web3.version}
			</pre>
		);
	}
}

export default withWeb3(MyComponent);
```
