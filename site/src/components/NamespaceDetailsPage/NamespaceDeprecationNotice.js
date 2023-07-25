import React from 'react';
import moment from "moment/moment";

export default () =>
  <div className="row justify-content-md-center mb-3">
    <div className="col col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-10 bg-danger py-3  ">
      <h3 className="text-center text-white mb-2">
        <i className="icon icon-common icon-trash"/>
        <span className="mx-3"> This namespace is <strong>deactivated</strong> </span>
        <i className="icon icon-common icon-trash"/>
      </h3>
      <p className="mb-0 text-white text-center">
        The data from this namespace is, currently, either not available or supported anymore.
        Compact identifiers still resolve as normal but we recommend that you use another namespace if you can.
      </p>
    </div>
  </div>

