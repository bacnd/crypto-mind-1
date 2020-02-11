import * as game from 'actions/gameAction';

const initialState = {
  question: [
    {
      ques: '75+51',
      ans: [156, 126, 116, 136]
    },
    {
      ques: '148+77',
      ans: [205, 195, 225, 245]
    },
    {
      ques: '178+81',
      ans: [158, 259, 219, 269]
    },
    {
      ques: '51+181',
      ans: [232, 132, 245, 214]
    }
  ],
  currentQues: 0,
  score: 0,
  cryptoMind: null
};

const gameReducer = (state = initialState, action) => {
  switch (action.type) {
    case game.CURRENT_QUES:
      return {
        ...state,
        currentQues: action.currentQues
      };
    case game.SCORE:
      return {
        ...state,
        score: action.score
      };
    case game.INIT_CONTRACT:
      console.log(action);
      return {
        ...state,
        cryptoMind: action.cryptoMind
      };
    default:
      return state;
  }
};

export default gameReducer;