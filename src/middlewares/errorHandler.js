import Errors from '../constants/Errors';

export const pushError = (error, meta) => ({
  type: 'PUSH_ERRORS',
  errors: [
    {
      ...error,
      meta
    }
  ]
});

export const pushErrors = errors => {
  if (errors && errors.length === undefined) {
    return pushError(Errors.UNKNOWN_EXCEPTION, errors);
  }
  return {
    type: 'PUSH_ERRORS',
    errors
  };
};

export const removeError = id => ({
  type: 'REMOVE_ERROR',
  id
});


export default (req, res, next) => {
  res.pushError = (error, meta) => {
    req.store.dispatch(pushErrors([{
      ...error,
      meta: {
        path: req.path,
        ...meta,
      },
    }]));
  };

  res.softErrors = (errors) => {
    req.store.dispatch(pushErrors(errors));
    const status = req.store.getState().errors.reduce((max, error) => {
      max = ( max === undefined || error.status > max ) ? error.status : max;
      return max;
    }, []);
    res.status(200).json({
      status,
      errors: req.store.getState().errors.map((error) => {
        delete error.id;
        delete error.status;
        return {
          ...error,
          meta: {
            path: req.path,
            ...error.meta,
          },
        };
      }),
    });
  };

  res.errors = (errors = [], meta = {}) => {
    if (errors !== []) req.store.dispatch(pushErrors(errors));
    let status = req.store.getState().errors.reduce((max, error) => {
      max = ( typeof max === undefined || error.status > max ) ? error.status : max;
      return max;
    }, 500)
    // if(status === []) status = 500
    return res.status(status).json({
      ...meta,
      status,
      errors: req.store.getState().errors.map((error) => {
        delete error.id;
        delete error.status;
        return {
          ...error,
          meta: {
            path: req.path,
            ...error.meta,
          },
        };
      }),
    });
  };

  next();
};
