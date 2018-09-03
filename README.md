# react-web3-provider
Simple higher-order component (HOC) providing a web3 context to React app.

Detects whether the user is using MetaMask or Ethereum wallet-enabled browser. If not, it will access the Ethereum network through a given Web3 fallback provider (e.g. INFURA node).

Ready for the [upcoming changes](https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8) in MetaMask.

## Installation

```sh
$ yarn add react-web3-provider
```

## Basic usage

Add the `Web3Provider` to your root React component:
```js
import Web3 from 'web3';
import Web3Provider from 'react-web3-provider';

ReactDOM.render(
	<Web3Provider
		defaultWeb3Provider={new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/YOUR_API_KEY"))}
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
import Web3 from 'web3';
import Web3Provider from 'react-web3-provider';

ReactDOM.render(
	<Web3Provider
		defaultWeb3Provider={new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/YOUR_API_KEY"))}
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

## Hooked wallet
More complex example demonstrating transaction sending from a zero-client wallet.
```js
import Web3 from 'web3';
import Lightwallet from 'eth-lightwallet';
import Web3ProviderEngine from 'web3-provider-engine';
import HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet';
import SubscriptionsSubprovider from 'web3-provider-engine/subproviders/subscriptions';
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc';
import waterfall from 'async-waterfall';
import Web3Provider from 'react-web3-provider';

// Light-wallet options
const vaultOpts = {
	seedPhrase: '...',
	password: '...',
	hdPathString: "m/44'/60'/0'/0",
}
const lightWalletEnabled = true;

waterfall([
	(wcb) => wcb(null, new Web3ProviderEngine()),
	(engine, wcb) => {
		if (lightWalletEnabled) {
			try {
				Lightwallet.keystore.createVault(vaultOpts, (err1, ks) => {
					if (err1) throw err1;

					ks.keyFromPassword(vaultOpts.password, (err2, pwDerivedKey) => {
						if (err2) throw err2;
		
						ks.generateNewAddress(pwDerivedKey, 1);
						engine.addProvider(new HookedWalletSubprovider({
							getAccounts: (cb) => cb(null, ks.getAddresses()),
							signTransaction: (tx, cb) => ks.signTransaction(tx, cb),
						}));
						wcb(null, engine);
					});
				});
			} catch((err) => wcb(err, engine));
		} else wcb(null, engine);
	},
	(engine, wcb) => {
		const web3 = new Web3(engine);
		engine.addProvider(new SubscriptionsSubprovider());
		engine.addProvider(new RpcSubprovider({
			rpcUrl: 'https://mainnet.infura.io/YOUR_API_KEY',
		}));
		engine.start();
		wcb(null, web3);
	},
], (_, web3) => {
	ReactDOM.render(
		<Web3Provider
			defaultWeb3Provider={web3}
		>
			<App />
		</Web3Provider>
	);
});
```

Sending transaction:
```js
import waterfall from 'async-waterfall';
import { withWeb3 } from 'react-web3-provider';

class MyComponent {
	sendEther(amount, to) {
		console.log('SEND');
		const { web3 } = this.props;

		waterfall([
			(wcb) => {
				web3.eth.getAccounts().then((accounts) => {
					if (accounts && accounts.length >= 1) {
						wcb(null, accounts[0]);
					} else {
						wcb('Unknown account', null);
					}
				});
			},
			(account, wcb) => {
				web3.eth.sendTransaction({
					from: account,
					to,
					value: amount * 1000000000000000000,
				}, wcb);
			},
 		], console.log);
  }

	render() {
		return <button onClick={() => this.sendEther(0.1, '0x12345...')}>SEND TRANSACTION</button>;
	}
}



## Contributors
- Peter ([HUSSY.io](https://hussy.io))
