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