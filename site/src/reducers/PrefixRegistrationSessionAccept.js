// PrefixRegistratonSessionAccept reducer

const defaultState = {
  acceptanceReason: undefined,
  additionalInformation: undefined
};

const PrefixRegistrationSessionAcceptReducer = (state = defaultState, action) => {
  switch (action.type) {
  case 'SET_PREFIXREGISTRATIONSESSIONACCEPT': {
    return {
      ...state,
      acceptanceReason: action.acceptanceReason,
      additionalInformation: action.additionalInformation
     };
  }

  default:
    return state;
  }
}


export default PrefixRegistrationSessionAcceptReducer;
