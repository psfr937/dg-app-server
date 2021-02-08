const initState = [];

export default (state = initState, action) => {
  if (!action.errors) {
    action.errors = [];
  }
  switch (action.type) {
    case 'PUSH_ERRORS': {
      return [
        ...state,
        ...action.errors.map(error => ({
          id: Math.random(),
          ...error
        }))
      ];
    }
    case 'REMOVE_ERROR': {
      return [...state.filter(error => error.id !== action.id)];
    }
    default: {
      return state;
    }
  }
};
