# Connect4

[![Netlify Status](https://api.netlify.com/api/v1/badges/1e871ace-cd86-4e4d-8788-cfa155a4a2a1/deploy-status)](https://app.netlify.com/sites/connect4-quibbble/deploys)

Connect4 game website. Play at [connect4.quibbble.com](https://connect4.quibbble.com).

This repo contains [ReactJS](https://react.dev) frontend code and makes use of custom React components found at [boardgame](https://github.com/quibbble/boardgame). Game logic can be found at [go-connect4](https://github.com/quibbble/go-connect4). Server logic can be found at [go-quibbble](https://github.com/quibbble/go-quibbble). 

[![Quibbble Connect4](screenshot.png)](https://connect4.quibbble.com)

## Run Locally

- Generate a personal `GITHUB_ACCESS_TOKEN` with package read permissions. Read more about it [here](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).
- Create a `.npmrc` file in the `connect4` root directory with the following:
```
//npm.pkg.github.com/:_authToken=<GITHUB_ACCESS_TOKEN>
@quibbble:boardgame=https://npm.pkg.github.com
```
- Run `npm i`.
- Run the quibbble server ([go-quibbble](https://github.com/quibbble/go-quibbble)) locally on port `8080`.
- Create a `.env.local` file in the `connect4` root directory with the following:
```
VITE_HOST="http://127.0.0.1:8080"
VITE_WEBSOCKET="ws://127.0.0.1:8080"
```
- Run `npm start`.
