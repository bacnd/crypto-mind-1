import genQuestion from 'utils/genQuestion';
import { checkBeforeDoTransaction } from 'actions/getInfoAction';
import { CURRENT_ROOM } from 'actions/contractAction';
import { getStartGame } from 'utils/getRpc';
import CryptoMind from 'contracts/CryptoMind.json';

export const CURRENT_QUES = 'CURRENT_QUES';
export const SCORE = 'SCORE';
export const UPDATE_QUESTIONS = 'UPDATE_QUESTIONS';
export const GAME_RESULT = 'GAME_RESULT';

export const updateCurrentQuestion = (currentQues) => async (dispatch) => {
  dispatch({
    type: CURRENT_QUES,
    currentQues
  });
};

export const updateScore = (score) => async (dispatch) => {
  dispatch({
    type: SCORE,
    score
  });
};

export const updateGameResult = (score) => async (dispatch) => {
  dispatch({
    type: SCORE,
    score
  });
};

export const getResultOfRoom = () => async (dispatch, getState) => {
  const state = getState();
  let cryptoMind = state.contractStatus.cryptoMind;
  let currentGame = state.contractStatus.currentGame;
  let msg = dispatch(checkBeforeDoTransaction());
  if (msg) {
    console.log(msg);
  } else {
    const from = state.infoStatus.userAddress;
    if (currentGame) {
      let submitedPlayers = currentGame.submited;
      let roomId = currentGame.roomId;
      // Promise
      let getAllScore = submitedPlayers.map(async (submitedPlayer) => {
        let player = {};
        player.address = submitedPlayer;
        player.score = await cryptoMind.methods
          .getAnswerInRoom(submitedPlayer, roomId)
          .call({ from });
        return player;
      });

      let gameResult = await Promise.all(getAllScore);

      // sort by score
      gameResult.sort((a, b) => a.score - b.score);

      dispatch({
        type: GAME_RESULT,
        gameResult
      });
    }
  }
};

export const listenEventStart = () => async (dispatch, getState) => {
  const state = getState();
  let currentGame = state.contractStatus.currentGame;
  let web3 = state.infoStatus.web3;
  if (currentGame && web3) {
    let currentBlock = state.contractStatus.currentBlock;

    const networkId = process.env.REACT_APP_TOMO_ID;
    const contractAddress = CryptoMind.networks[networkId].address;
    const chainUrl = process.env.REACT_APP_BLOCKCHAIN_URL;

    if (currentGame.blockStart > 0) {
      let res = await getStartGame(
        currentGame.blockStart,
        contractAddress,
        currentGame.roomId,
        chainUrl
      );

      if (res) {
        let battleQuestions = genQuestion(res.seed, 10, 5);

        dispatch({
          type: UPDATE_QUESTIONS,
          battleQuestions
        });

        //update blockStart, blockTimeout
        currentGame.blockStart = res.blockStart;
        currentGame.blockTimeout = res.blockTimeout;

        dispatch({
          type: CURRENT_ROOM,
          currentGame
        });
      }
    } else {
      let res = await getStartGame(currentBlock, contractAddress, currentGame.roomId, chainUrl);
      if (res) {
        let battleQuestions = genQuestion(res.seed, 10, 5);
        dispatch({
          type: UPDATE_QUESTIONS,
          battleQuestions
        });

        //update blockStart, blockTimeout
        currentGame.blockStart = res.blockStart;
        currentGame.blockTimeout = res.blockTimeout;

        dispatch({
          type: CURRENT_ROOM,
          currentGame
        });
      }
    }
  }
};

export const listenJoinRoom = () => async (dispatch, getState) => {
  const state = getState();
  let cryptoMind = state.contractStatus.cryptoMind;
  let currentGame = state.contractStatus.currentGame;
  let web3 = state.infoStatus.web3;
  if (currentGame && web3) {
    let currentBlock = state.contractStatus.currentBlock;
    cryptoMind.events
      .JoinRoom(
        {
          filter: { roomId: [currentGame.roomId] },
          fromBlock: currentBlock
        },
        function(error, events) {
          console.log(events.returnValues['newPlayer']);
        }
      )
      .on('error', console.error);
  }
};

export const listenQuitRoom = () => async (dispatch, getState) => {
  const state = getState();
  let cryptoMind = state.contractStatus.cryptoMind;
  let currentGame = state.contractStatus.currentGame;
  let web3 = state.infoStatus.web3;
  if (currentGame && web3) {
    let currentBlock = state.contractStatus.currentBlock;
    cryptoMind.events
      .QuitRoom(
        {
          filter: { roomId: [currentGame.roomId] },
          fromBlock: currentBlock
        },
        function(error, events) {
          console.log(events.returnValues['quitPlayer']);
        }
      )
      .on('error', console.error);
  }
};
