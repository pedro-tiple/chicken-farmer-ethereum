# Chicken Farmer - Ethereum
This is a small portfolio project to demonstrate knowledge in a variety of technologies.

Technologies used:
 - HTML, CSS, SCSS
 - React, JS, Typescript
 - Ethereum, Smart-Contracts, Solidity, Truffle Suite
 - NPM, Git
 
## What it is:

![alt text](front-end/public/display_image.png?raw=true)

Simple clicker game where feeding chickens causes them to lay eggs, with a chance of laying gold eggs.

Gold eggs can be used to expand the farm (more barns, more chickens), and to buy feed so the game can continue.

## How to run it:

Dependencies:
npm (Node.js), Solidity compiler (solc) 

Install front-end dependencies
```
$ cd front-end
$ npm install
```

Start a local development ethereum node using ganache-cli with the deterministic flag
```
$ cd front-end
$ ./node_modules/.bin/ganache-cli -d
```

Run the Smart Contract migrations
```
$ cd smart-contracts
$ ./../front-end/node_modules/.bin/truffle migrate
```

Start local development server
```
$ cd front-end
$ npm start
```

You are now ready to start playing!

To run the smart contract automatic tests (must have ganache-cli running)
```
$ cd smart-contracts
$ ./../front-end/node_modules/.bin/truffle compile --all
$ ./../front-end/node_modules/.bin/truffle test
```

## Instructions
Your first Barn is free, so start by pressing "Buy Barn", each new barn comes with one chicken and 100 feed.

Now that you have your very own chicken, keep feeding it by pressing "Feed" below it until it lays a gold egg.

With your first gold egg, you can either buy more feed, or a new chicken (each costs one gold egg).
You'll probably want a new chicken, feed that one too!

Each chicken has its own gold egg rate, you can gauge the quality of your chickens by the badge displayed next to them.
The better the medal, the better chance of them laying gold eggs. So sell those slacking chickens and buy new ones until you
are satisfied by your barn's production rate.

New barns will set you back 10 gold eggs, and if you want to industrialize your farm, an automatic feeder will cost you 100 gold eggs per barn.
Please be aware that to avoid overheating the autofeeder has a 5 seconds delay between feeds (meaning, feeding manually is more time efficient
but is a lot more work on big barns).

## Motivation for project
My main objective with this project is to prove familiarity with blockchain and smart contract technologies, 
in this case Ethereum and Solidity.

While the use case is very simple, it is enough to show proficiency in minimizing operation gas cost, security concerns, and interactions between deployed smart contracts.

I chose React for the front-end application because of its popularity. I had previous professional 
experience with it, so it was a good choice for a quick POC.

## Architecture
This project makes use of smart contracts to work as a distributed application (DApp). There is no central back-end server, all the business logic is 
computed by the distributed network participants and all information is stored on the blockchain.

### Smart Contract Organization
![alt text](front-end/public/architecture_smart-contracts.png?raw=true)
#### The Barn Registration Center
There is one central smart contract that is used to keep track of the user's assets: barns and gold eggs.
This central point allows us to at any time load the users' full state.

Users can register their Barns here, and from then on these barns can generate and spend their gold eggs.

#### The Barn
Barns keep chickens and feed, these two resources are used to generate new gold eggs.

Each Barn is its own smart contract, while the cheapest option (in gas costs) would be to have a single
smart contract that handled all the barns of all the users, that would reduce some of the complexity of this project.
So a choice was made to split each barn into a single smart contract to simulate the usage of more complex features of smart contracts and Web3.

#### Interactions between Users, Barns, and the BRC
![alt text](front-end/public/architecture_classes.png?raw=true)

### To Improve / Known issues
- A user can register a wallet as a barn, and use that wallet to receive gold eggs.<br/>
Proposed fix: move gold egg generation logic to BRC.

- Project not ready to be used on test or live networks.<br/>
Proposed fix: remove hardcoded node connection. Improve UI to handle waiting for transaction confirmation.

- Some high ranking chickens fail feeding due to insufficient gas.<br/>
Proposed fix: N/A. Need to research why gas estimation is failing in these cases.

- Improve game progression.<br/>
Proposed fix: add feed buy amount progression to allow Barns with more chickens.